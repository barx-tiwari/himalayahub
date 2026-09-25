export default function ScoreRing({ percent }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  return (
    <svg className="score-ring" viewBox="0 0 140 140" role="img" aria-label={`Score ${percent} percent`}>
      <circle className="track" cx="70" cy="70" r={r} />
      <circle className="value" cx="70" cy="70" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} />
      <text x="70" y="80" textAnchor="middle">{percent}%</text>
    </svg>
  );
}
