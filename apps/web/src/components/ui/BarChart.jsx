/**
 * Dependency-free SVG bar chart.
 * data: [{ label, value, alt? }]  values are shown against `max` (default: highest value).
 */
export default function BarChart({ data, max, height = 180, title, legend, valueSuffix = '' }) {
  const width = 560;
  const pad = { t: 16, r: 8, b: 26, l: 30 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const top = max || Math.max(10, ...data.map((d) => Math.max(d.value || 0, d.alt || 0)));
  const slot = innerW / Math.max(1, data.length);
  const hasAlt = data.some((d) => d.alt != null);
  const barW = Math.min(28, slot * (hasAlt ? 0.34 : 0.55));
  const y = (v) => pad.t + innerH - (v / top) * innerH;
  const ticks = [0, 0.5, 1].map((f) => Math.round(top * f));

  return (
    <figure className="bar-chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <title>{title}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          return (
            <g key={`${d.label}-${i}`}>
              <rect className="bar" x={hasAlt ? cx - barW - 1 : cx - barW / 2} y={y(d.value || 0)} width={barW} height={Math.max(0, innerH - (y(d.value || 0) - pad.t))} rx="4">
                <title>{`${d.label}: ${d.value}${valueSuffix}`}</title>
              </rect>
              {hasAlt && (
                <rect className="bar-alt" x={cx + 1} y={y(d.alt || 0)} width={barW} height={Math.max(0, innerH - (y(d.alt || 0) - pad.t))} rx="4">
                  <title>{`${d.label}: ${d.alt}`}</title>
                </rect>
              )}
              <text x={cx} y={height - 8} textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {legend && (
        <figcaption className="legend">
          <span>{legend[0]}</span>
          {legend[1] && <span className="alt">{legend[1]}</span>}
        </figcaption>
      )}
    </figure>
  );
}
