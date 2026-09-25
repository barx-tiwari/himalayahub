import { ArrowRight } from 'lucide-react';

/** Renders the lightweight diagram types used in notes: layers, flow, code. */
export default function NoteDiagram({ diagram }) {
  if (!diagram) return null;
  return (
    <figure style={{ margin: 0 }}>
      {diagram.type === 'layers' && (
        <div className="layers" role="list">
          {diagram.items.map(([num, name, desc]) => (
            <div className="layer" role="listitem" key={`${num}-${name}`}>
              <b>{num}</b><strong>{name}</strong><span>{desc}</span>
            </div>
          ))}
        </div>
      )}
      {diagram.type === 'flow' && (
        <ol className="flow" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {diagram.steps.map((s, i) => (
            <li key={s} style={{ display: 'contents' }}>
              <span className="flow-step">{s}</span>
              {i < diagram.steps.length - 1 && <ArrowRight className="flow-arrow" size={18} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      )}
      {diagram.type === 'code' && <pre><code>{diagram.content}</code></pre>}
      {diagram.title && <figcaption className="small muted" style={{ marginTop: 8 }}>{diagram.title}</figcaption>}
    </figure>
  );
}
