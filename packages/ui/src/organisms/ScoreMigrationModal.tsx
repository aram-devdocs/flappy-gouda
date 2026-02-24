import type { ScoreComparison } from '@repo/types';

/** Props for {@link ScoreMigrationModal}. */
export interface ScoreMigrationModalProps {
  /** Whether the modal is shown. */
  visible: boolean;
  /** Per-difficulty score comparisons to display. */
  comparisons: ScoreComparison[];
  /** Called when the user accepts the import. */
  onAccept: () => void;
  /** Called when the user declines the import. */
  onDecline: () => void;
}

/** Modal shown once to offer importing scores from the old site. */
export function ScoreMigrationModal({
  visible,
  comparisons,
  onAccept,
  onDecline,
}: ScoreMigrationModalProps) {
  if (!visible) return null;

  return (
    <dialog
      open
      aria-label="Import scores from old site"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9, 9, 73, 0.55)',
        zIndex: 10,
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
          background: 'var(--fn-white, #FFFFFF)',
          borderRadius: '16px',
          padding: '24px 28px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxWidth: '320px',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--fn-navy, #090949)',
            margin: '0 0 4px',
          }}
        >
          Scores Found
        </h2>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--fn-navy, #090949)',
            opacity: 0.6,
            margin: '0 0 16px',
          }}
        >
          Import your best scores from the old site?
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Difficulty</th>
              <th style={thStyle}>Old</th>
              <th style={thStyle}>Current</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.difficulty}>
                <td style={tdStyle}>{c.label}</td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: c.isImprovement ? 700 : 400,
                    color: c.isImprovement
                      ? 'var(--fn-violet, #6500D9)'
                      : 'var(--fn-navy, #090949)',
                  }}
                >
                  {c.oldScore}
                </td>
                <td style={tdStyle}>{c.newScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button type="button" onClick={onDecline} style={declineBtnStyle}>
            No Thanks
          </button>
          <button type="button" onClick={onAccept} style={acceptBtnStyle}>
            Import
          </button>
        </div>
      </div>
    </dialog>
  );
}

const thStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--fn-navy, #090949)',
  opacity: 0.5,
  padding: '4px 8px',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  fontSize: '14px',
  padding: '4px 8px',
  textAlign: 'center',
  color: 'var(--fn-navy, #090949)',
};

const acceptBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--fn-violet, #6500D9)',
  color: 'var(--fn-white, #FFFFFF)',
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
};

const declineBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: '8px',
  border: '1px solid var(--fn-navy, #090949)',
  background: 'transparent',
  color: 'var(--fn-navy, #090949)',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  opacity: 0.7,
};
