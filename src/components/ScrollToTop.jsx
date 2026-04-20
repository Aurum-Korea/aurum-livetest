import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ─── ScrollToTop ──────────────────────────────────────────────────────
// Resets scroll to (0,0) on every route change. React Router preserves
// scroll by default — this is the standard pattern to fix it.
// Placed at the top of <Routes> so it sees every pathname change.
// ──────────────────────────────────────────────────────────────────────
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Use 'instant' so a new page doesn't animate its way from mid-page
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
