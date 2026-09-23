/** Signed change with colour AND an arrow/sign (never colour alone). */
export default function Delta({ value, percent, digits = 2, suffix = '' }) {
  const v = Number.isFinite(percent) ? percent : value;
  if (!Number.isFinite(v)) return <span className="delta flat">—</span>;
  const dir = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '■';
  const parts = [];
  if (Number.isFinite(value)) parts.push(`${value > 0 ? '+' : ''}${value.toLocaleString(undefined, { maximumFractionDigits: digits })}${suffix}`);
  if (Number.isFinite(percent)) parts.push(`${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`);
  return (
    <span className={`delta ${dir}`}>
      <span aria-hidden="true">{arrow} </span>
      <span className="sr-only">{dir === 'up' ? 'Up' : dir === 'down' ? 'Down' : 'Unchanged'} </span>
      {parts.join(' (') + (parts.length > 1 ? ')' : '')}
    </span>
  );
}
