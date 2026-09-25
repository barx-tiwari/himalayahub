/** Small stat tile used on the dashboard and home page. */
export default function DashboardCard({ icon: I, label, value, hint, tone = '', children, className = '' }) {
  return (
    <div className={`card dash-card ${className}`}>
      {I && <span className={`icon-tile ${tone}`}><I aria-hidden="true" /></span>}
      <div className="stat" style={{ flex: 1 }}>
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="small muted">{hint}</span>}
        {children}
      </div>
    </div>
  );
}
