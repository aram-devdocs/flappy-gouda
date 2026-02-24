import {
  BRIDGE_URL,
  MIGRATION_FLAG_KEY,
  areAllScoresZero,
  buildScoreComparisons,
  hasScoreImprovements,
  mergeBestScores,
  parseBridgeScores,
} from '@repo/engine';
import type { BestScores, ScoreComparison } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const BRIDGE_TIMEOUT_MS = 3000;

/** Shape returned by {@link useScoreMigration}. */
export interface UseScoreMigrationReturn {
  /** Whether the migration modal should be shown. */
  showModal: boolean;
  /** Per-difficulty score comparisons for display. */
  comparisons: ScoreComparison[];
  /** Accept the migration, merge scores, and reload. */
  accept: () => void;
  /** Decline the migration and hide the modal. */
  decline: () => void;
}

/** Mark migration as complete and run cleanup. */
function skipMigration(cleanupFn: () => void): void {
  localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  cleanupFn();
}

/** Remove the iframe from the DOM and clear the timer. */
function removeIframe(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  timerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
): void {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    (timerRef as React.MutableRefObject<ReturnType<typeof setTimeout> | null>).current = null;
  }
  if (iframeRef.current?.parentNode) {
    iframeRef.current.parentNode.removeChild(iframeRef.current);
    (iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = null;
  }
}

/**
 * Hook that manages the one-time score migration from the old site via a
 * cross-origin iframe + postMessage bridge.
 */
export function useScoreMigration(currentScores: BestScores): UseScoreMigrationReturn {
  const [showModal, setShowModal] = useState(false);
  const [comparisons, setComparisons] = useState<ScoreComparison[]>([]);
  const oldScoresRef = useRef<BestScores | null>(null);
  const scoresRef = useRef(currentScores);
  scoresRef.current = currentScores;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

    const iframe = document.createElement('iframe');
    iframe.src = BRIDGE_URL;
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    const cleanup = () => {
      removeIframe(iframeRef, timerRef);
      window.removeEventListener('message', onMessage);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(BRIDGE_URL).origin) return;

      const scores = parseBridgeScores(event.data);
      if (!scores || areAllScoresZero(scores)) {
        skipMigration(cleanup);
        return;
      }
      if (!hasScoreImprovements(scores, scoresRef.current)) {
        skipMigration(cleanup);
        return;
      }

      oldScoresRef.current = scores;
      setComparisons(buildScoreComparisons(scores, scoresRef.current));
      setShowModal(true);
      removeIframe(iframeRef, timerRef);
    };

    window.addEventListener('message', onMessage);

    iframe.addEventListener('load', () => {
      // '*' is safe here: the request payload is non-sensitive and the iframe src is a hardcoded origin we control
      iframe.contentWindow?.postMessage({ type: 'sn-migration-request', version: 1 }, '*');
    });

    timerRef.current = setTimeout(() => skipMigration(cleanup), BRIDGE_TIMEOUT_MS);

    return cleanup;
  }, []);

  const accept = useCallback(() => {
    if (!oldScoresRef.current) return;
    const merged = mergeBestScores(oldScoresRef.current, scoresRef.current);
    localStorage.setItem('sn-flappy-best-v2', JSON.stringify(merged));
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
    window.location.reload();
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
    setShowModal(false);
  }, []);

  return { showModal, comparisons, accept, decline };
}
