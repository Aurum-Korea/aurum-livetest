import { useState, useCallback, useEffect } from 'react';
import { useLivePrices, useToast, MOCK_ORDERS_INIT, MOCK_HOLDINGS } from './lib/index.jsx';

// Components
import Nav        from './components/Nav.jsx';
import Ticker     from './components/Ticker.jsx';
import Footer     from './components/Footer.jsx';
import Toast      from './components/Toast.jsx';
import LoginModal from './components/LoginModal.jsx';

// Pages
import HomePage                     from './pages/HomePage.jsx';
import { ShopSelectorPage, ShopPage, ProductPage } from './pages/ShopPages.jsx';
import { CartPage, CheckoutPage }   from './pages/CartCheckout.jsx';
import { DashboardPage, SellFlowPage, WithdrawFlowPage, OrderHistoryPage, AccountPage, KYCFlowPage } from './pages/UserPages.jsx';
import { WhyGoldPage, StoragePage, AGPPage, AGPBackingReport, LearnPage } from './pages/InfoPages.jsx';
import { AGPIntroPage, AGPEnrollPage } from './pages/AGPPages.jsx';

// Campaigns
import FoundingGiftPage from './campaigns/FoundingGiftPage.jsx';
import FiveGatesPage    from './campaigns/FiveGatesPage.jsx';

// ─── Cart helpers ──────────────────────────────────────────────────────────
function makeCartKey(product, storage) {
  return `${product.id}-${storage || 'singapore'}`;
}

export default function App() {
  const [page, setPage]         = useState('home');
  const [lang, setLang]         = useState('ko');
  const [currency, setCurrency] = useState('KRW');
  const [user, setUser]         = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [product, setProduct]   = useState(null);

  const [cart, setCart]         = useState([]);
  const [cartPayMethod, setCartPayMethod] = useState('toss');
  const [orders, setOrders]     = useState(MOCK_ORDERS_INIT);
  const [holdings]              = useState(MOCK_HOLDINGS);

  const { prices, krwRate, dailyChanges, priceError } = useLivePrices();
  const { toasts, show: toast } = useToast();

  // Scroll to top on page change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  const navigate = useCallback(p => setPage(p), []);

  // Cart operations
  const addToCart = useCallback((p, qty = 1, storage = 'singapore') => {
    const key = makeCartKey(p, storage);
    setCart(c => {
      const exists = c.find(i => i.cartKey === key);
      if (exists) return c.map(i => i.cartKey === key ? { ...i, qty: i.qty + qty } : i);
      return [...c, {
        cartKey: key, ...p,
        qty, storage,
        price: p._cachedPrice || (prices[p.metal] * p.weightOz * (1 + p.premium)),
      }];
    });
  }, [prices]);

  const removeFromCart = useCallback(key => setCart(c => c.filter(i => i.cartKey !== key)), []);

  const updateCartQty = useCallback((key, qty) => {
    if (qty <= 0) { removeFromCart(key); return; }
    setCart(c => c.map(i => i.cartKey === key ? { ...i, qty } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const addOrder = useCallback(order => setOrders(o => [order, ...o]), []);

  const handleLogin = useCallback(u => { setUser(u); setShowLogin(false); toast(`환영합니다, ${u.name || u.email}!`); }, [toast]);

  // ── Route map ─────────────────────────────────────────────────────────────
  const sharedProps = { lang, navigate, prices, krwRate, currency, setCurrency, user, setUser, toast };
  const shopProps   = { ...sharedProps, cart, addToCart, removeFromCart, updateCartQty, clearCart };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage {...sharedProps} setShowLogin={setShowLogin} />;

      case 'shop':
        return <ShopSelectorPage {...sharedProps} />;

      case 'shop-physical':
        return <ShopPage {...shopProps} setProduct={setProduct} cartPayMethod={cartPayMethod} setCartPayMethod={setCartPayMethod} />;

      case 'product':
        return <ProductPage {...shopProps} product={product} setProduct={setProduct} setShowLogin={setShowLogin} />;

      case 'cart':
        return <CartPage {...shopProps} cartPayMethod={cartPayMethod} setCartPayMethod={setCartPayMethod} setProduct={setProduct} />;

      case 'checkout':
        return <CheckoutPage {...shopProps} orders={orders} addOrder={addOrder} initialPayMethod={cartPayMethod} />;

      case 'dashboard':
        return <DashboardPage {...sharedProps} orders={orders} holdings={holdings} />;

      case 'sell':
        return <SellFlowPage {...sharedProps} holdings={holdings} />;

      case 'withdraw':
        return <WithdrawFlowPage {...sharedProps} holdings={holdings} />;

      case 'orders':
        return <OrderHistoryPage {...sharedProps} orders={orders} />;

      case 'account':
        return <AccountPage {...sharedProps} setShowLogin={setShowLogin} />;

      case 'kyc':
        return <KYCFlowPage {...sharedProps} />;

      case 'why':
        return <WhyGoldPage {...sharedProps} />;

      case 'storage':
        return <StoragePage {...sharedProps} />;

      case 'agp':
        return <AGPPage {...sharedProps} />;

      case 'agp-intro':
        return <AGPIntroPage {...sharedProps} />;

      case 'agp-enroll':
        return <AGPEnrollPage {...sharedProps} />;

      case 'agp-report':
        return <AGPBackingReport {...sharedProps} />;

      case 'learn':
        return <LearnPage {...sharedProps} />;

      case 'campaign-founding':
        return <FoundingGiftPage {...sharedProps} setShowLogin={setShowLogin} />;

      case 'campaign-referral':
        return <FiveGatesPage {...sharedProps} />;

      default:
        return (
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>404</div>
            <p style={{ fontFamily: "'Outfit',sans-serif", color: '#a0a0a0' }}>페이지를 찾을 수 없습니다.</p>
            <button onClick={() => navigate('home')} style={{ background: '#C5A572', border: 'none', color: '#0a0a0a', padding: '12px 28px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700 }}>홈으로</button>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Price ticker */}
      <Ticker prices={prices} krwRate={krwRate} dailyChanges={dailyChanges} lang={lang} />

      {/* Navigation */}
      <Nav
        page={page}
        navigate={navigate}
        lang={lang}
        setLang={setLang}
        user={user}
        setUser={setUser}
        setShowLogin={setShowLogin}
        cart={cart}
      />

      {/* Main content */}
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer lang={lang} navigate={navigate} />

      {/* Login modal */}
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} lang={lang} />

      {/* Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
}
