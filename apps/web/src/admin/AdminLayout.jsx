import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { ADMIN_NAV } from './nav';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { LogoMark } from '../components/layout/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import { AdminIcon } from './icons';

const ROLE_LABEL = { EDITOR: 'Editor', MODERATOR: 'Moderator', ADMIN: 'Admin', SUPER_ADMIN: 'Super admin' };

export default function AdminLayout() {
  const { user, can, logout } = useAuth();
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const groups = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(i.perm)) })).filter((g) => g.items.length);

  return (
    <div className={`admin${open ? ' nav-open' : ''}`}>
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <header className="admin-top">
        <button type="button" className="btn btn-ghost btn-icon admin-burger" aria-expanded={open} aria-controls="admin-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <Link to="/admin" className="admin-brand"><LogoMark className="admin-mark" /><span>{settings.siteName} <small>Admin</small></span></Link>
        <div className="admin-top-actions">
          <Link to="/" className="btn btn-ghost btn-sm" target="_blank" rel="noopener"><ExternalLink aria-hidden="true" /><span className="hide-sm">View site</span></Link>
          <ThemeToggle />
          <span className="admin-user" title={user.email}><span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><span className="hide-sm"><strong>{user.name}</strong><small>{ROLE_LABEL[user.role] || user.role}</small></span></span>
          <button type="button" className="btn btn-ghost btn-icon" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut aria-hidden="true" /></button>
        </div>
      </header>
      <div className="admin-body">
        <nav id="admin-nav" className="admin-nav" aria-label="Admin">
          {groups.map((g) => (
            <div key={g.group || 'main'} className="admin-nav-group">
              {g.group && <h2>{g.group}</h2>}
              <ul>{g.items.map((i) => (
                <li key={i.to}><NavLink to={i.to} end={i.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  <AdminIcon name={i.icon} /><span>{i.label}</span>{!i.ready && <span className="soon" title="Coming in a later update">Soon</span>}
                </NavLink></li>
              ))}</ul>
            </div>
          ))}
        </nav>
        {open && <button type="button" className="admin-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
        <main id="admin-main" className="admin-main" tabIndex={-1}><Outlet /></main>
      </div>
    </div>
  );
}
