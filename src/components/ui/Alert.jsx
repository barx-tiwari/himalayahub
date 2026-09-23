import { AlertTriangle, Check, Info } from 'lucide-react';

const ICON = { info: Info, warning: AlertTriangle, error: AlertTriangle, success: Check };

export default function Alert({ type = 'info', children, action, className = '' }) {
  const I = ICON[type];
  return (
    <div className={`alert alert-${type} ${className}`} role={type === 'error' ? 'alert' : 'status'}>
      <I aria-hidden="true" />
      <div style={{ flex: 1 }}>{children}</div>
      {action}
    </div>
  );
}
