import { Search } from 'lucide-react';

export default function EmptyState({ icon: I = Search, title, children, action }) {
  return (
    <div className="empty">
      <I aria-hidden="true" />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
