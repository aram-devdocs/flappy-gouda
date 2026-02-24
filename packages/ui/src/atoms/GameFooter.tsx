/** Props for {@link GameFooter}. */
export interface GameFooterProps {
  /** Text content for the footer. */
  text: string;
}

/** Centered footer text with subdued styling. */
export function GameFooter({ text }: GameFooterProps) {
  return (
    <div
      style={{
        padding: '6px 12px',
        fontSize: '10px',
        textAlign: 'center',
        color: 'var(--fn-navy, #090949)',
        opacity: 0.4,
      }}
    >
      {text}
    </div>
  );
}
