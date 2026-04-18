import { useState, useCallback, useEffect, useRef } from 'react';
import { useLivePrices, useToast, MOCK_ORDERS_INIT, MOCK_HOLDINGS } from './lib/index.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { initParticles } from './lib/particles.js';

import Nav        from './components/Nav.jsx';
import Ticker     from './components/Ticker.jsx';
import Footer     from './components/Footer.jsx';
import Toast      from './components/Toast.jsx';
import LoginModal from './components/LoginModal.jsx';
import GoldAI     from './components/GoldAI.jsx';
import LandingPopup from './components/LandingPopup.jsx';

import HomePage                     from './pages/HomePage.jsx';
import RegisterPage                 from './pages/RegisterPage.jsx';
import { ShopSelectorPage, ShopPage, ProductPage } from './pages/ShopPages.jsx';
import { CartPage, CheckoutPage }   from './pages/CartCheckout.jsx';
import { DashboardPage, SellFlowPage, WithdrawFlowPage, OrderHistoryPage, AccountPage, KYCFlowPage } from './pages/UserPages.jsx';
import { WhyGoldPage, StoragePage, AGPPage, AGPBackingReport, LearnPage, GoldTodayPage } from './pages/InfoPages.jsx';
import { AGPIntroPage, AGPEnrollPage } from './pages/AGPPages.jsx';

import FoundersClubPage  from './campaigns/FoundersClubPage.jsx';
import FoundersPromoPage from './campaigns/FoundersPromoPage.jsx';
import AGPLaunchPage     from './campaigns/AGPLaunchPage.jsx';

function makeCartKey(product, storage) {
  return `${product.id}-${storage || 'singapore'}`;
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

export default function App() {
  const [page, setPage] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('page');
    return p || 'home';
  });
  const [lang, setLang]         = useState('ko');
  const [currency, setCurrency] = useState('KRW');
  const [user, setUser]         = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [product, setProduct]   = useState(null);
  const [scrollPct, setScrollPct] = useState(0);

  const [cart, setCart]         = useState([]);
  const [cartPayMethod, setCartPayMethod] = useState('toss');
  const [orders, setOrders]     = useState(MOCK_ORDERS_INIT);
  const [holdings]              = useState(MOCK_HOLDINGS);

  const { prices, krwRate, dailyChanges, loaded } = useLivePrices();
  const { toasts, show: toast }                   = useToast();

  // T-06: Scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(isNaN(pct) ? 0 : pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // S-01: Global particle canvas
  const canvasRef = useRef(null);
  useEffect(() => {
    const cleanup = initParticles(canvasRef.current);
    return cleanup;
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [page]);

  const navigate = useCallback(p => setPage(p), []);

  const addToCart = useCallback((p, qty = 1, storage = 'singapore') => {
    const key = makeCartKey(p, storage);
    setCart(c => {
      const exists = c.find(i => i.cartKey === key);
      if (exists) return c.map(i => i.cartKey === key ? { ...i, qty: i.qty + qty } : i);
      return [...c, { cartKey: key, ...p, qty, storage, price: prices[p.metal] * p.weightOz * (1 + p.premium) }];
    });
  }, [prices]);

  const removeFromCart  = useCallback(key => setCart(c => c.filter(i => i.cartKey !== key)), []);
  const updateCartQty   = useCallback((key, qty) => { if (qty <= 0) { removeFromCart(key); return; } setCart(c => c.map(i => i.cartKey === key ? { ...i, qty } : i)); }, [removeFromCart]);
  const clearCart       = useCallback(() => setCart([]), []);
  const addOrder        = useCallback(order => setOrders(o => [order, ...o]), []);
  const handleLogin     = useCallback(u => { setUser(u); setShowLogin(false); toast(`환영합니다, ${u.name || u.email}!`); }, [toast]);

  const shared = { lang, navigate, prices, krwRate, currency, setCurrency, user, setUser, toast };
  const shopP  = { ...shared, cart, addToCart, removeFromCart, updateCartQty, clearCart };

  const renderPage = () => {
    switch (page) {
      case 'home':              return <HomePage {...shared} setShowLogin={setShowLogin} />;
      case 'register':          return <RegisterPage {...shared} setShowLogin={setShowLogin} />;
      case 'shop':              return <ShopSelectorPage {...shared} />;
      case 'shop-physical':     return <ShopPage {...shopP} setProduct={setProduct} cartPayMethod={cartPayMethod} setCartPayMethod={setCartPayMethod} />;
      case 'product':           return <ProductPage {...shopP} product={product} setProduct={setProduct} setShowLogin={setShowLogin} />;
      case 'cart':              return <CartPage {...shopP} cartPayMethod={cartPayMethod} setCartPayMethod={setCartPayMethod} setProduct={setProduct} />;
      case 'checkout':          return <CheckoutPage {...shopP} orders={orders} addOrder={addOrder} initialPayMethod={cartPayMethod} setShowLogin={setShowLogin} />;
      case 'dashboard':         return <DashboardPage {...shared} orders={orders} holdings={holdings} />;
      case 'sell':              return <SellFlowPage {...shared} holdings={holdings} />;
      case 'withdraw':          return <WithdrawFlowPage {...shared} holdings={holdings} />;
      case 'orders':            return <OrderHistoryPage {...shared} orders={orders} />;
      case 'account':           return <AccountPage {...shared} setShowLogin={setShowLogin} />;
      case 'kyc':               return <KYCFlowPage {...shared} />;
      case 'why':               return <WhyGoldPage {...shared} />;
      case 'storage':           return <StoragePage {...shared} />;
      case 'agp':               return <AGPPage {...shared} />;
      case 'agp-intro':         return <AGPIntroPage {...shared} />;
      case 'agp-enroll':        return <AGPEnrollPage {...shared} setShowLogin={setShowLogin} />;
      case 'agp-report':        return <AGPBackingReport {...shared} />;
      case 'gold-today':         return <GoldTodayPage {...shared} />;
      case 'learn':             return <LearnPage {...shared} />;
      case 'campaign-founders': return <FoundersClubPage {...shared} setShowLogin={setShowLogin} />;
      case 'founders':          return <FoundersClubPage {...shared} setShowLogin={setShowLogin} />;
      case 'founders-promo':    return <FoundersPromoPage {...shared} setShowLogin={setShowLogin} />;
      case 'campaign-agp-launch': return <AGPLaunchPage {...shared} setShowLogin={setShowLogin} />;
      default: return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>404</div>
          <p style={{ fontFamily: "'Outfit',sans-serif", color: '#a0a0a0' }}>페이지를 찾을 수 없습니다.</p>
          <button onClick={() => navigate('home')} style={{ background: '#C5A572', border: 'none', color: '#0d0b08', padding: '12px 28px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700 }}>홈으로</button>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* S-01: Global particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* T-06: Scroll progress bar */}
      {scrollPct > 0 && scrollPct < 100 && (
        <div className="scroll-progress-bar" style={{ width: `${scrollPct}%` }} />
      )}

      <Nav page={page} navigate={navigate} lang={lang} setLang={setLang} user={user} setUser={setUser} setShowLogin={setShowLogin} cart={cart} />
      <div style={{ position: 'sticky', top: 'calc(72px + env(safe-area-inset-top, 0px))', zIndex: 99 }}>
        <Ticker prices={prices} krwRate={krwRate} dailyChanges={dailyChanges} lang={lang} loaded={loaded} />
      </div>
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={page} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer lang={lang} navigate={navigate} />
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} lang={lang} />
      <Toast toasts={toasts} />
      <GoldAI lang={lang} prices={prices} krwRate={krwRate} user={user} navigate={navigate} />
      <LandingPopup lang={lang} navigate={navigate} />
    </div>
  );
}
