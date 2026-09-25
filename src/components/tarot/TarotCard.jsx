/** A flippable Major Arcana card. The "image" is an illustrated emblem so no image files are needed. */
export default function TarotCard({ card, flipped, drawing, onFlip, position }) {
  const label = flipped && card ? `${position ? `${position}: ` : ''}${card.name}` : `${position ? `${position}: ` : ''}face-down card${onFlip ? ', press to reveal' : ''}`;
  return (
    <button type="button" className={`tarot-card${flipped ? ' is-flipped' : ''}${drawing ? ' is-drawing' : ''}`}
      onClick={onFlip} disabled={!onFlip || flipped} aria-label={label} style={{ cursor: onFlip && !flipped ? 'pointer' : 'default' }}>
      <span className="tarot-inner">
        <span className="tarot-face tarot-back" aria-hidden="true" />
        <span className="tarot-face tarot-front" aria-hidden="true">
          {card && (
            <>
              <span className="tarot-numeral">{card.numeral}</span>
              <span className="tarot-art-ring"><span className="tarot-art">{card.symbol}</span></span>
              <span className="tarot-name">{card.name}</span>
            </>
          )}
        </span>
      </span>
    </button>
  );
}
