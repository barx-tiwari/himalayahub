import { Suspense, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth as useAuthForBanner } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SearchModal from '../components/search/SearchModal';
import ShortcutsModal from '../components/layout/ShortcutsModal';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import { WhatsAppFloat } from '../components/contact/WhatsApp';
import { PageLoader } from '../components/ui/Spinner';
import { useUI } from '../context/UIContext';
import { domainFor } from '../data/navigation';

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

const GO = { x: '/explore-nepal', h: '/', t: '/typing', n: '/notes', d: '/dashboard', c: '/courses', q: '/quizzes', l: '/news', s: '/sports', m: '/markets', w: '/weather', e: '/emergency' };

export default function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setSearchOpen, setShortcutsOpen } = useUI();
  const mainRef = useRef(null);
  const gPressed = useRef(0);

  // Scroll to top and move focus to main content on route change (screen readers).
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === '/') { e.preventDefault(); setSearchOpen(true); return; }
      if (e.key === '?') { e.preventDefault(); setShortcutsOpen(true); return; }
      if (e.key === 'g') { gPressed.current = Date.now(); return; }
      if (Date.now() - gPressed.current < 1200 && GO[e.key]) {
        gPressed.current = 0;
        navigate(GO[e.key]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate, setSearchOpen, setShortcutsOpen]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }} data-domain={domainFor(pathname)}>
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            <VerifyReminder />
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <SearchModal />
      <ShortcutsModal />
      <WhatsAppFloat />
    </>
  );
}

/** Gentle reminder for signed-in accounts that haven't entered their email code yet. */
function VerifyReminder() {
  const { user } = useAuthForBanner();
  const { pathname } = useLocation();
  if (!user || user.emailVerified || ['/verify-email', '/account', '/login'].includes(pathname)) return null;
  return <div className="verify-banner" role="status"><div className="container">Confirm your email to post and vote. <Link to="/verify-email">Enter your 6-digit code</Link></div></div>;
}
