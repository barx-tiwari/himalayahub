import { clamp } from '../../utils/format';

export default function ProgressBar({ value = 0, label, showValue = true, success, className = '' }) {
  const v = clamp(Math.round(value), 0, 100);
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="progress-label"><span>{label}</span>{showValue && <span>{v}%</span>}</div>
      )}
      <div className={`progress${success || v === 100 ? ' success' : ''}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
        <span style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
