import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, X, LayoutDashboard , LogIn } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from '../ui/ThemeToggle';
import { mainNav } from '../../data/navigation';
import { Icon } from '../../utils/icons';
import { useUI } from '../../context/UIContext';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/format';

function isGroupActive(item, pathname) {
  return item.match?.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

function DropdownItem({ item, pathname }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const menuId = `menu-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => wrapRef.current?.querySelector('.dropdown a')?.focus());
    }
  };
  const onMenuKey = (e) => {
    const links = [...wrapRef.current.querySelectorAll('.dropdown a')];
    const i = links.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length]?.focus(); }
  };

  return (
    <li className={`nav-item${isGroupActive(item, pathname) ? ' is-active' : ''}`} ref={wrapRef}
      onBlur={(e) => { if (!wrapRef.current?.contains(e.relatedTarget)) setOpen(false); }}>
      <button ref={btnRef} type="button" className="nav-link" aria-expanded={open} aria-controls={menuId}
        onClick={() => setOpen((o) => !o)} onKeyDown={onKeyDown}>
        {item.label} <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <ul className="dropdown" id={menuId} onKeyDown={onMenuKey}>
          {item.children.map((c) => (
            <li key={c.to}>
              <Link to={c.to}>
                <Icon name={c.icon} />
                <span><strong>{c.label}</strong><small>{c.desc}</small></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MobileMenu({ onClose }) {
  const [openGroup, setOpenGroup] = useState(null);
  const { isStaff, user } = useAuth();
  const panelRef = useRef(null);
  useEffect(() => { panelRef.current?.querySelector('a, button')?.focus(); }, []);
  // Portalled to <body>: the navbar's backdrop-filter would otherwise trap the fixed drawer.
  return createPortal(
    <>
    <div className="menu-backdrop" onClick={onClose} aria-hidden="true" />
    <nav className="mobile-menu menu-drawer" id="mobile-menu" aria-label="Main menu" ref={panelRef}>
      <div className="drawer-head">
        <span className="drawer-title">Menu</span>
        <button type="button" className="drawer-close" onClick={onClose} aria-label="Close menu"><X aria-hidden="true" /></button>
      </div>
      <ul>
        {mainNav.map((item, n) => (item.children ? (
          <li key={item.label} style={{ '--n': n }}>
            <button type="button" className="mm-group-btn" aria-expanded={openGroup === item.label}
              onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}>
              {item.label} <ChevronDown aria-hidden="true" />
            </button>
            {openGroup === item.label && (
              <ul className="mm-sub">
                {item.children.map((c) => (
                  <li key={c.to}><NavLink to={c.to} onClick={onClose}>{c.label}</NavLink></li>
                ))}
              </ul>
            )}
          </li>
        ) : (
          <li key={item.to} style={{ '--n': n }}><NavLink to={item.to} end={item.end} onClick={onClose}>{item.label}</NavLink></li>
        )))}
        <li><NavLink to="/emergency" onClick={onClose} className="mm-sos">🚨 Emergency Help</NavLink></li>
        <li><NavLink to="/dashboard" onClick={onClose}>Dashboard</NavLink></li>
        <li><NavLink to="/profile" onClick={onClose}>Profile</NavLink></li>
        {!user && <li><NavLink to="/login" onClick={onClose}>Sign in</NavLink></li>}
        {user && <li><NavLink to="/account" onClick={onClose}>Your account</NavLink></li>}
        {isStaff && <li><NavLink to="/admin" onClick={onClose}>Admin panel</NavLink></li>}
      </ul>
    </nav>
    </>,
    document.body,
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { setSearchOpen } = useUI();
  const { state } = useProgress();
  const { isStaff, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const on = () => setAtTop(window.scrollY < 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [pathname]);
  const overHero = pathname === '/' && atTop && !mobileOpen;

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className={`navbar${overHero ? ' over-hero' : ''}`}>
      <div className="container navbar-inner">
        <Logo />
        <nav aria-label="Main">
          <ul className="nav-links">
            {mainNav.map((item) => (item.children
              ? <DropdownItem key={item.label} item={item} pathname={pathname} />
              : (
                <li key={item.to} className="nav-item">
                  <NavLink to={item.to} end={item.end} className="nav-link">{item.label}</NavLink>
                </li>
              )))}
          </ul>
        </nav>
        <div className="nav-actions">
          <Link to="/emergency" className="sos-btn" aria-label="Emergency Help" title="Emergency Help"><span aria-hidden="true">🚨</span><span className="sos-label">Emergency</span></Link>
          <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search (shortcut: slash)">
            <Search aria-hidden="true" />
            <span className="search-label">Search</span>
            <kbd className="search-hint">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          {isStaff && <Link to="/admin" className="btn btn-ghost btn-sm nav-admin" aria-label="Admin panel" title="Admin panel"><LayoutDashboard aria-hidden="true" /><span className="nav-admin-label">Admin</span></Link>}
          <ThemeToggle />
          {user ? (
            <Link to="/account" className="avatar" aria-label={`Your account (${user.name})`} title={user.emailVerified ? user.name : `${user.name} — email not confirmed`}>
              {user.avatar ? <img src={user.avatar} alt="" /> : initials(user.name)}
              {!user.emailVerified && <span className="avatar-dot" aria-hidden="true" />}
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav-signin"><LogIn aria-hidden="true" /><span className="nav-signin-label">Sign in</span></Link>
          )}
          <button type="button" className="btn btn-ghost btn-icon menu-toggle" aria-expanded={mobileOpen} aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}<span className="menu-toggle-label">Menu</span>
          </button>
        </div>
      </div>
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  );
}
