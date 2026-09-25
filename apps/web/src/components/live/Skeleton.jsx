/** Shimmering placeholders that match the shape of content being loaded. */
export default function Skeleton({ lines = 3, block = false, cards = 0, label = 'Loading…' }) {
  if (cards) {
    return (
      <div className="news-grid" role="status" aria-label={label}>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
            <span className="skeleton block" />
            <span className="skeleton title" />
            <span className="skeleton line" />
            <span className="skeleton line" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div role="status" aria-label={label} style={{ display: 'grid', gap: 10 }}>
      {block && <span className="skeleton block" />}
      <span className="skeleton title" />
      {Array.from({ length: lines }, (_, i) => <span key={i} className="skeleton line" style={{ width: `${92 - i * 12}%` }} />)}
    </div>
  );
}
