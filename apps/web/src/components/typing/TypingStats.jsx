/** Live stats panel for the typing engine. */
export default function TypingStats({ stats, compact }) {
  const items = [
    ['WPM', stats.wpm],
    ['Accuracy', `${stats.accuracy}%`],
    ['Characters', stats.characters],
    ['Correct', stats.correct],
    ['Incorrect', stats.incorrect],
    ['Errors', stats.errors],
  ];
  return (
    <dl className="typing-stats" style={{ margin: 0 }} aria-live="off">
      {(compact ? items.slice(0, 2) : items).map(([label, value]) => (
        <div className="stat" key={label}>
          <dt className="stat-label">{label}</dt>
          <dd className="stat-value" style={{ margin: 0 }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
