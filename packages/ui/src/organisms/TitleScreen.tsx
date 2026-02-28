import type { DifficultyKey } from '@repo/types';
import {
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  RADIUS,
  RGBA_TOKENS,
  SHADOW,
  SPACING,
  Z_INDEX,
  cssVar,
} from '@repo/types';
import { CheeseIcon } from '../atoms/CheeseIcon';
import { NicknameInput } from '../molecules/NicknameInput';

/** Props for {@link TitleScreen}. */
export interface TitleScreenProps {
  visible: boolean;
  bestScore: number;
  onPlay: () => void;
  nickname?: string | null;
  nicknameValue?: string;
  onNicknameChange?: (value: string) => void;
  onNicknameSubmit?: () => void;
  nicknameError?: string;
  nicknameChecking?: boolean;
  hasLeaderboard?: boolean;
  difficulty?: DifficultyKey;
}

/** Full-screen overlay shown in idle state with branding, nickname onboarding, and Play button. */
export function TitleScreen({
  visible,
  bestScore,
  onPlay,
  nickname,
  nicknameValue = '',
  onNicknameChange,
  onNicknameSubmit,
  nicknameError,
  nicknameChecking,
  hasLeaderboard,
}: TitleScreenProps) {
  if (!visible) return null;

  const needsNickname = hasLeaderboard && nickname === null;
  const canSubmitNickname = nicknameValue.length === 3 && !nicknameChecking;

  return (
    <dialog
      open
      aria-label="Start game"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: RGBA_TOKENS.scrimMedium,
        zIndex: Z_INDEX.modal,
        border: 'none',
        padding: 0,
        margin: 0,
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          background: cssVar('white'),
          borderRadius: RADIUS['2xl'],
          padding: `${SPACING[6]} ${SPACING[8]}`,
          textAlign: 'center',
          boxShadow: SHADOW.card,
          maxWidth: '320px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: FONT_SIZE['6xl'], marginBottom: SPACING[2] }}>
          <CheeseIcon />
        </div>
        <p style={{ ...hintStyle, margin: `0 0 ${SPACING[2]}` }}>
          <Kbd>Space</Kbd> <Kbd>Click</Kbd> <span>to flap</span>
        </p>
        {bestScore > 0 && <p style={bestStyle}>Best: {bestScore}</p>}

        {needsNickname && (
          <div style={{ margin: `${SPACING[3]} 0` }}>
            <p style={tagLabelStyle}>Choose Your Tag</p>
            <div style={{ marginBottom: SPACING[2] }}>
              <NicknameInput
                value={nicknameValue}
                onChange={onNicknameChange ?? noop}
                error={nicknameError}
                checking={nicknameChecking}
              />
            </div>
            <button
              type="button"
              onClick={onNicknameSubmit}
              disabled={!canSubmitNickname}
              style={{
                ...goBtnStyle,
                opacity: canSubmitNickname ? 1 : OPACITY.soft,
                cursor: canSubmitNickname ? 'pointer' : 'default',
              }}
            >
              Set Tag
            </button>
          </div>
        )}

        <button type="button" onClick={onPlay} style={playBtnStyle}>
          {needsNickname ? 'Play Without Leaderboard' : 'Play'}
        </button>
      </div>
    </dialog>
  );
}

function Kbd({ children }: { children: string }) {
  return <kbd style={kbdStyle}>{children}</kbd>;
}

function noop() {}

const kbdStyle: React.CSSProperties = {
  padding: `${SPACING[0.5]} ${SPACING[1.5]}`,
  background: cssVar('light'),
  borderRadius: RADIUS.sm,
  fontSize: FONT_SIZE.xs,
  fontWeight: FONT_WEIGHT.semibold,
  border: `1px solid ${RGBA_TOKENS.shadowSm}`,
};

const hintStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.sm,
  color: cssVar('navy'),
  opacity: OPACITY.medium,
};

const bestStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.md,
  fontWeight: FONT_WEIGHT.semibold,
  color: cssVar('magenta'),
  margin: `0 0 ${SPACING[2]}`,
};

const tagLabelStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.sm,
  fontWeight: FONT_WEIGHT.bold,
  color: cssVar('navy'),
  margin: `0 0 ${SPACING[2]}`,
};

const playBtnStyle: React.CSSProperties = {
  padding: `${SPACING[2]} ${SPACING[6]}`,
  fontSize: FONT_SIZE.lg,
  fontWeight: FONT_WEIGHT.bold,
  color: cssVar('white'),
  background: cssVar('violet'),
  border: 'none',
  borderRadius: RADIUS.lg,
  cursor: 'pointer',
  width: '100%',
};

const goBtnStyle: React.CSSProperties = {
  padding: `${SPACING[1.5]} ${SPACING[4]}`,
  fontSize: FONT_SIZE.md,
  fontWeight: FONT_WEIGHT.bold,
  color: cssVar('white'),
  background: cssVar('cyan'),
  border: 'none',
  borderRadius: RADIUS.lg,
  cursor: 'pointer',
};
