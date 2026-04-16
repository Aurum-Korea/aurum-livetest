import { useState, useCallback, useEffect } from 'react';
import { useLivePrices, useToast, MOCK_ORDERS_INIT, MOCK_HOLDINGS } from './lib/index.jsx';

// Same import pattern as original aurum-test — all UI chrome from BaseUI.jsx
import { Ticker, Nav, LoginModal, Toast } from './BaseUI.jsx';
import Footer     from './components/Footer.jsx';

import HomePage                     from './pages/HomePage.jsx';
import { ShopSelectorPage, ShopPage, ProductPage } from './pages/ShopPages.jsx';
import { CartPage, CheckoutPage }   from './pages/CartCheckout.jsx';
import { DashboardPage, SellFlowPage, WithdrawFlowPage, OrderHistoryPage, AccountPage, KYCFlowPage } from './pages/UserPages.jsx';
import { WhyGoldPage, StoragePage, AGPPage, AGPBackingReport, LearnPage } from './pages/InfoPages.jsx';
import { AGPIntroPage, AGPEnrollPage } from './pages/AGPPages.jsx';

import FoundersClubPage  from './campaigns/FoundersClubPage.jsx';
import AGPLaunchPage     from './campaigns/AGPLaunchPage.jsx';

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
  const { toasts, show: toast }           = useToast();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

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
      case 'shop':              return <ShopSelectorPage {...shared} />;
      case 'shop-physical':     return <ShopPage {...shopP} setProduct={setProduct} cartPayMethod={cartPayMethod} setCartPayMethod={setCartPayMethod} />;
      case 'product':           return <ProductPage {...shopP} product={product} setProduct={setProduct} setShowLogin={setShowLogin} />;
      case 'cart':              return <CartPage {...shopP} cartPayMethod={cartPayMethod} setCartPayMethod={setCartPayMethod} setProduct={setProduct} />;
      case 'checkout':          return <CheckoutPage {...shopP} orders={orders} addOrder={addOrder} initialPayMethod={cartPayMethod} />;
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
      case 'agp-enroll':        return <AGPEnrollPage {...shared} />;
      case 'agp-report':        return <AGPBackingReport {...shared} />;
      case 'learn':             return <LearnPage {...shared} />;
      case 'campaign-founders': return <FoundersClubPage {...shared} setShowLogin={setShowLogin} />;
      case 'campaign-agp-launch': return <AGPLaunchPage {...shared} setShowLogin={setShowLogin} />;
      default: return (
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
      {priceError && <div style={{ background:"#1a0808", borderBottom:"1px solid rgba(248,113,113,0.3)", padding:"6px 20px", fontSize:11, color:"#f87171", textAlign:"center", fontFamily:"'Outfit',sans-serif" }}>{priceError}</div>}
      <Ticker prices={prices} krwRate={krwRate} dailyChanges={dailyChanges} lang={lang} />
      <Nav page={page} navigate={navigate} lang={lang} setLang={setLang} user={user} setUser={setUser} setShowLogin={setShowLogin} cart={cart} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      <Footer lang={lang} navigate={navigate} />
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} lang={lang} />
      <Toast toasts={toasts} />
    </div>
  );
}
