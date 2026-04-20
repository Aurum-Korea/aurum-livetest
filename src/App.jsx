import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage';
import FoundersPage from './pages/FoundersPage';
import GoldPathPage from './pages/GoldPathPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TerminalPage from './pages/TerminalPage';
import ShopPage from './pages/ShopPage';
import VaultPage from './pages/VaultPage';
import WhyPage from './pages/WhyPage';
import SecurityPage from './pages/SecurityPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import KycPage from './pages/KycPage';
import ReferralPage from './pages/ReferralPage';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/founders" element={<FoundersPage />} />
      <Route path="/goldpath" element={<GoldPathPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/terminal" element={<RequireAuth><TerminalPage /></RequireAuth>} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/vault" element={<VaultPage />} />
      <Route path="/why" element={<WhyPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/kyc" element={<KycPage />} />
      <Route path="/referral" element={<ReferralPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
