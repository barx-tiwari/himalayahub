import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from '../ui/ThemeToggle';
import { mainNav } from '../../data/navigation';
import { Icon } from '../../utils/icons';
import { useUI } from '../../context/UIContext';
import { useProgress } from '../../context/ProgressContext';
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
  return (
    <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile">
      <ul>
        {mainNav.map((item) => (item.children ? (
          <li key={item.label}>
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
          <li key={item.to}><NavLink to={item.to} end={item.end} onClick={onClose}>{item.label}</NavLink></li>
        )))}
        <li><NavLink to="/emergency" onClick={onClose} className="mm-sos">🚨 Emergency Help</NavLink></li>
        <li><NavLink to="/dashboard" onClick={onClose}>Dashboard</NavLink></li>
        <li><NavLink to="/profile" onClick={onClose}>Profile</NavLink></li>
      </ul>
    </nav>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { setSearchOpen } = useUI();
  const { state } = useProgress();
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
          <ThemeToggle />
          <Link to={state.profile ? '/dashboard' : '/profile'} className="avatar" aria-label={state.profile ? `Dashboard for ${state.profile.name}` : 'Profile and sign in'} title="Profile">
            {state.profile ? initials(state.profile.name) : '?'}
          </Link>
          <button type="button" className="btn btn-ghost btn-icon menu-toggle" aria-expanded={mobileOpen} aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  );
}
