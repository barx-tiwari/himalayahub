import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RefreshCw, ServerCrash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Spinner';
import AccessDenied from '../pages/AccessDenied';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import SiteSettings from './pages/SiteSettings';
import ComingSoon from './pages/ComingSoon';
import Destinations from './pages/Destinations';
import DestinationEdit from './pages/DestinationEdit';
import TravelCategories from './pages/TravelCategories';
import Moderation from './pages/Moderation';
import './admin.css';

/**
 * /admin entry (lazy-loaded, so public visitors never download it).
 * The guard here is for UX only — every admin API call is authorised on the server.
 */
export default function AdminRoot() {
  const { status, user, isStaff, apiDown, refresh } = useAuth();
  const { pathname } = useLocation();
  if (status === 'loading') return <PageLoader />;
  if (apiDown) {
    return (
      <div className="container page"><div className="empty" role="alert">
        <ServerCrash aria-hidden="true" />
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>The admin panel can’t reach the server</h1>
        <p>The API isn’t responding, so content can’t be loaded or saved. The public website keeps working from its built-in content.</p>
        <button type="button" className="btn btn-primary" onClick={refresh}><RefreshCw aria-hidden="true" /> Try again</button>
      </div></div>
    );
  }
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  if (!isStaff) return <AccessDenied signedInAs={user.email} />;
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<SiteSettings />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="destinations/:id" element={<DestinationEdit />} />
        <Route path="travel-categories" element={<TravelCategories />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
