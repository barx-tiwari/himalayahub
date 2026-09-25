/** Dependency-free SVG charts for live data. */
export function Sparkline({ values, width = 120, height = 36, label }) {
  const pts = (values || []).filter((v) => Number.isFinite(v));
  if (pts.length < 2) return <span className="muted small">—</span>;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = width / (pts.length - 1);
  const coords = pts.map((v, i) => [i * step, height - 2 - ((v - min) / span) * (height - 4)]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const trend = pts[pts.length - 1] >= pts[0] ? 'up' : 'down';
  return (
    <svg className={`sparkline ${trend}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={label || `Trend ${trend}`}>
      <path className="area" d={`${line} L${width} ${height} L0 ${height} Z`} />
      <path className="line" d={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** points: [{ label, value }] */
export function LineChart({ points, height = 200, title, format = (v) => v.toLocaleString() }) {
  const data = (points || []).filter((p) => Number.isFinite(p.value));
  if (data.length < 2) return <p className="muted small">Not enough historical data to draw a chart.</p>;
  const width = 640;
  const pad = { t: 14, r: 12, b: 26, l: 56 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const span = max - min || 1;
  const x = (i) => pad.l + (i / (data.length - 1)) * w;
  const y = (v) => pad.t + h - ((v - min) / span) * h;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ');
  const ticks = [min, min + span / 2, max];
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  return (
    <figure className="line-chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <title>{title}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">{format(t)}</text>
          </g>
        ))}
        <path className="area" d={`${line} L${x(data.length - 1)} ${pad.t + h} L${x(0)} ${pad.t + h} Z`} />
        <path className="line" d={line} />
        {data.map((d, i) => (i % labelEvery === 0 || i === data.length - 1) && (
          <text key={d.label + i} x={x(i)} y={height - 8} textAnchor="middle">{d.label}</text>
        ))}
      </svg>
    </figure>
  );
}
