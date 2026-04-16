// BaseUI.jsx — Ticker (scrolling marquee), Nav, LoginModal, Toast
// Same pattern as aurum-test BaseUI.jsx — all UI chrome in one file
import { useState, useEffect, useCallback } from "react";
import { useIsMobile, useNewsData, fDate } from "./lib/index.jsx";

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PRICING CONSTANTS — single source of truth for all pages
//   Ticker + savings panel on Home use these; adjust here only
// ═══════════════════════════════════════════════════════════════════════════════
export const KR_GOLD_PREMIUM     = 0.20;   // 20% Korean retail (VAT + margin)
export const KR_SILVER_PREMIUM   = 0.30;   // 30% Korean retail
export const AURUM_GOLD_PREMIUM  = 0.08;   // 8% Aurum gold premium
export const AURUM_SILVER_PREMIUM = 0.15;  // 15% Aurum silver premium

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function Toast({ toasts }) {
  const colors = { success: ["#080f08","#4ade80"], error: ["#1a0808","#f87171"], info: ["#080a1a","#60a5fa"] };
  return (
    <div style={{ position:"fixed", top:76, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => {
        const [bg, col] = colors[t.type] || colors.success;
        return (
          <div key={t.id} style={{ background:bg, border:`1px solid ${col}`, color:col, padding:"10px 16px", borderRadius:6, fontSize:13, fontFamily:"'Outfit',sans-serif", maxWidth:320, boxShadow:"0 4px 20px rgba(0,0,0,0.5)", backdropFilter:"blur(8px)" }}>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TICKER — scrolling marquee on desktop, horizontal scroll on mobile
//   Same logic as original aurum-test BaseUI.jsx
//   CSS: .ticker-track + @keyframes ticker-scroll in index.css
// ═══════════════════════════════════════════════════════════════════════════════
function Ticker({ lang, prices, krwRate, dailyChanges }) {
  const isMobile = useIsMobile();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const ch = key => dailyChanges?.[key]
      ? `${parseFloat(dailyChanges[key]) >= 0 ? '+' : ''}${dailyChanges[key]}%`
      : '—';
    const up = key => parseFloat(dailyChanges?.[key] || 0) >= 0;

    // 한국금거래소 1돈 매도가 — spot × KRW × (1+0.20) / 31.1035 × 3.75
    const donPrice = Math.round(
      (prices.gold||3342) * krwRate * (1 + KR_GOLD_PREMIUM) / 31.1035 * 3.75
    );

    setItems([
      { label: lang==='ko' ? '금'  : 'XAU/USD',  price: prices.gold||3342,            fmt: v=>`$${v.toFixed(2)}`, change: ch('gold'),     up: up('gold') },
      { label: lang==='ko' ? '은'  : 'XAG/USD',  price: prices.silver||32.15,         fmt: v=>`$${v.toFixed(2)}`, change: ch('silver'),   up: up('silver') },
      { label: lang==='ko' ? '백금': 'XPT/USD',  price: prices.platinum||980,         fmt: v=>`$${v.toFixed(2)}`, change: ch('platinum'), up: up('platinum') },
      { label: 'USD/KRW',                          price: krwRate,                      fmt: v=>`₩${v.toFixed(1)}`, change:'—', up:true, noChange:true },
      { label: lang==='ko' ? '한국금거래소 1돈 매도가' : 'KR Gold/돈',
        price: donPrice, fmt: v=>`₩${v.toLocaleString('ko-KR')}`, change:'—', up:true, noChange:true },
    ]);
  }, [lang, prices, krwRate, dailyChanges]);

  const TickerItem = ({ item }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 32px", borderRight:"1px solid rgba(197,165,114,0.12)", whiteSpace:"nowrap", height:36 }}>
      <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:10, color:"#a09080", letterSpacing:2, textTransform:"uppercase" }}>{item.label}</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"#f5f0e8", fontWeight:600 }}>
        {item.fmt(item.price)}
      </span>
      {!item.noChange && item.change !== '—' && (
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:item.up ? "#4ade80" : "#f87171" }}>{item.change}</span>
      )}
    </div>
  );

  // Mobile: horizontal scroll
  if (isMobile) return (
    <div style={{ background:"#0d0d0d", borderBottom:"1px solid #1e1e1e", padding:"7px 12px", overflow:"hidden" }}>
      <div style={{ display:"flex", gap:6, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", flexShrink:0 }}>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:9, color:"#a09080", textTransform:"uppercase", letterSpacing:1 }}>{item.label}</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#c5a572", fontWeight:600 }}>
              {item.fmt(item.price)}
            </span>
            {!item.noChange && item.change !== '—' && (
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:item.up ? "#4ade80" : "#f87171" }}>{item.change}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop: CSS marquee — items duplicated for seamless infinite loop
  // .ticker-track animation defined in index.css (@keyframes ticker-scroll)
  return (
    <div style={{ background:"#0d0d0d", borderBottom:"1px solid #1e1e1e", height:36, overflow:"hidden", position:"relative" }}>
      {/* Gold accent left border */}
      <div style={{ position:"absolute", left:0, top:0, width:2, height:"100%", background:"linear-gradient(180deg,#c5a572,#8a6914)", zIndex:1 }} />
      <div className="ticker-track">
        {items.map((item, i) => <TickerItem key={`a-${i}`} item={item} />)}
        {items.map((item, i) => <TickerItem key={`b-${i}`} item={item} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAV — campaign links + original aurum-test Nav logic
// ═══════════════════════════════════════════════════════════════════════════════
function Nav({ page, navigate, lang, setLang, user, setUser, setShowLogin, cart }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const check = () => { const w = window.innerWidth; setIsNarrow(w >= 768 && w < 1100); };
    check(); window.addEventListener("resize", check); return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive:true }); return () => window.removeEventListener("scroll", fn);
  }, []);

  const cartCount = cart.reduce((s,i) => s+i.qty, 0);
  const go = k => { navigate(k); setOpen(false); };

  // Nav links — original + campaign pages
  const mainLinks = [
    { key:"campaign-founders",    ko:"Founders Club", en:"Founders Club", dot:true },
    { key:"campaign-agp-launch",  ko:"AGP 론치",       en:"AGP Launch",    dot:true },
    { key:"shop",                 ko:"매장",           en:"Shop"  },
    { key:"why",                  ko:"왜 금인가",      en:"Why Gold" },
    { key:"storage",              ko:"보관",           en:"Storage" },
    { key:"agp",                  ko:"AGP",            en:"AGP" },
    { key:"learn",                ko:"교육",           en:"Learn" },
  ];

  const shouldUseMobileNav = isMobile || window.innerWidth < 960;
  const logoSize = isMobile ? 32 : 38;

  const Logo = () => (
    <div onClick={() => go("home")} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
      <div className="aurum-logo-mark" style={{ width:logoSize, height:logoSize, border:"1px solid rgba(197,165,114,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cormorant Garamond',serif", fontSize:logoSize*0.42, fontWeight:500, color:"#C5A572", letterSpacing:"0.04em", transition:"border-color 0.3s", flexShrink:0 }}>AU</div>
      {!isNarrow && <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:isMobile?16:20, fontWeight:500, letterSpacing:"0.30em", color:"#f5f0e8" }}>AURUM</span>}
    </div>
  );

  const CartBtn = () => (
    <button onClick={() => go("cart")} style={{ background:"none", border:"none", cursor:"pointer", position:"relative", padding:"4px 6px", fontSize:19, lineHeight:1 }}>
      🛒
      {cartCount > 0 && <span style={{ position:"absolute", top:-2, right:-2, background:"#c5a572", color:"#0a0a0a", borderRadius:"50%", width:17, height:17, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono',monospace" }}>{cartCount}</span>}
    </button>
  );

  // Mobile/narrow: hamburger menu
  if (shouldUseMobileNav) return (
    <nav style={{ background:scrolled?"rgba(10,10,10,0.95)":"#0a0a0a", borderBottom:"1px solid #1e1e1e", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100, backdropFilter:scrolled?"blur(12px)":"none", transition:"backdrop-filter 0.3s" }}>
      <Logo />
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <CartBtn />
        <button onClick={() => setOpen(!open)} style={{ background:"none", border:"none", cursor:"pointer", padding:6, display:"flex", flexDirection:"column", gap:5 }}>
          {[0,1,2].map(i => <div key={i} style={{ width:22, height:1.5, background:"#c5a572", transition:"transform 0.3s", transform:open&&i===0?"rotate(45deg) translate(4px,4px)":open&&i===1?"scaleX(0)":open&&i===2?"rotate(-45deg) translate(4px,-4px)":"none" }} />)}
        </button>
      </div>
      {open && (
        <div style={{ position:"fixed", inset:"57px 0 0 0", background:"rgba(10,10,10,0.97)", backdropFilter:"blur(16px)", zIndex:99, display:"flex", flexDirection:"column", padding:"28px 24px", gap:4, overflowY:"auto" }}>
          {mainLinks.map(l => (
            <button key={l.key} onClick={() => go(l.key)} style={{ background:page===l.key?"rgba(197,165,114,0.1)":"transparent", border:page===l.key?"1px solid rgba(197,165,114,0.3)":"1px solid transparent", color:page===l.key?"#c5a572":"#f5f0e8", textAlign:"left", padding:"14px 18px", borderRadius:8, fontSize:16, fontFamily:"'Outfit',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
              {l.dot && <span style={{ width:6, height:6, borderRadius:"50%", background:"#c5a572", animation:"pulse 1.6s ease-in-out infinite", flexShrink:0 }} />}
              {lang==='ko' ? l.ko : l.en}
            </button>
          ))}
          <div style={{ marginTop:20, paddingTop:20, borderTop:"1px solid #1e1e1e", display:"flex", flexDirection:"column", gap:10 }}>
            {user ? (
              <>
                <button onClick={() => { go("dashboard"); }} style={{ background:"transparent", border:"1px solid #282828", color:"#a09080", padding:"12px", borderRadius:8, fontSize:14, fontFamily:"'Outfit',sans-serif", cursor:"pointer", textAlign:"center" }}>
                  {lang==='ko' ? '내 자산 대시보드' : 'My Dashboard'}
                </button>
                <button onClick={() => { setUser(null); setOpen(false); }} style={{ background:"transparent", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", padding:"12px", borderRadius:8, fontSize:14, fontFamily:"'Outfit',sans-serif", cursor:"pointer", textAlign:"center" }}>
                  {lang==='ko' ? '로그아웃' : 'Logout'}
                </button>
              </>
            ) : (
              <button onClick={() => { setShowLogin(true); setOpen(false); }} style={{ background:"linear-gradient(135deg,#c5a572,#8a6914)", border:"none", color:"#fff", padding:"13px", borderRadius:8, fontSize:15, fontWeight:700, fontFamily:"'Outfit',sans-serif", cursor:"pointer", textAlign:"center" }}>
                {lang==='ko' ? '로그인 / 클럽 가입' : 'Login / Join Club'}
              </button>
            )}
            <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
              {['ko','en'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ background:lang===l?"rgba(197,165,114,0.12)":"transparent", border:`1px solid ${lang===l?"rgba(197,165,114,0.4)":"#282828"}`, color:lang===l?"#c5a572":"#6b6b6b", padding:"6px 16px", borderRadius:20, cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif", fontWeight:lang===l?700:400 }}>
                  {l==='ko'?'한국어':'EN'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );

  // Desktop nav
  return (
    <nav style={{ background:scrolled?"rgba(10,10,10,0.95)":"#0a0a0a", borderBottom:"1px solid #1e1e1e", padding:"0 48px", display:"flex", justifyContent:"space-between", alignItems:"center", height:60, position:"sticky", top:0, zIndex:100, backdropFilter:scrolled?"blur(12px)":"none", transition:"backdrop-filter 0.3s" }}>
      <Logo />
      <div style={{ display:"flex", alignItems:"center", gap:isNarrow?16:28 }}>
        {mainLinks.map(l => (
          <button key={l.key} onClick={() => go(l.key)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:isNarrow?12:13, color:page===l.key?"#c5a572":"#a09080", fontWeight:page===l.key?600:400, padding:"4px 0", letterSpacing:0.3, transition:"color 0.2s", display:"flex", alignItems:"center", gap:5, borderBottom:page===l.key?"1px solid #c5a572":"1px solid transparent" }}>
            {l.dot && <span style={{ width:5, height:5, borderRadius:"50%", background:"#c5a572", animation:"pulse 1.6s ease-in-out infinite" }} />}
            {lang==='ko' ? l.ko : l.en}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <CartBtn />
        <div style={{ display:"flex", gap:6 }}>
          {['ko','en'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background:lang===l?"rgba(197,165,114,0.12)":"transparent", border:`1px solid ${lang===l?"rgba(197,165,114,0.4)":"#282828"}`, color:lang===l?"#c5a572":"#6b6b6b", padding:"4px 10px", borderRadius:20, cursor:"pointer", fontSize:11, fontFamily:"'Outfit',sans-serif", fontWeight:lang===l?700:400 }}>
              {l==='ko'?'한국어':'EN'}
            </button>
          ))}
        </div>
        {user ? (
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => go("dashboard")} style={{ background:"transparent", border:"1px solid #282828", color:"#a09080", padding:"7px 14px", borderRadius:6, fontSize:12, fontFamily:"'Outfit',sans-serif", cursor:"pointer" }}>{lang==='ko' ? '내 자산' : 'My Assets'}</button>
            <button onClick={() => setUser(null)} style={{ background:"transparent", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", padding:"7px 12px", borderRadius:6, fontSize:12, fontFamily:"'Outfit',sans-serif", cursor:"pointer" }}>{lang==='ko' ? '로그아웃' : 'Out'}</button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} style={{ background:"linear-gradient(135deg,#c5a572,#8a6914)", border:"none", color:"#fff", padding:"8px 20px", borderRadius:6, fontSize:13, fontWeight:700, fontFamily:"'Outfit',sans-serif", cursor:"pointer" }}>
            {lang==='ko' ? '클럽 가입' : 'Join Club'}
          </button>
        )}
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function LoginModal({ show, onClose, onLogin, lang }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const ko = lang === 'ko';

  const socialLogin = async type => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    onLogin({ id:'usr_'+Date.now(), email:`${type}@demo.com`, name:`${type.charAt(0).toUpperCase()+type.slice(1)} User`, kycStatus:'unverified' });
    setLoading(false);
  };
  const submit = async e => {
    e.preventDefault(); setErr(""); setLoading(true);
    if (!email) { setErr(ko?"이메일을 입력하세요":"Enter email"); setLoading(false); return; }
    if (!pw) { setErr(ko?"비밀번호를 입력하세요":"Enter password"); setLoading(false); return; }
    if (tab==="register" && !terms) { setErr(ko?"약관에 동의해주세요":"Accept terms"); setLoading(false); return; }
    await new Promise(r => setTimeout(r, 900));
    onLogin({ id:'usr_'+Date.now(), email, name: name||email.split('@')[0], kycStatus:'unverified' });
    setLoading(false);
  };

  if (!show) return null;
  const inp = { width:"100%", background:"#1a1a1a", border:"1px solid #282828", borderRadius:8, padding:"12px 14px", color:"#f5f0e8", fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#111111", border:"1px solid #1e1e1e", borderRadius:12, padding:"28px 24px", width:"100%", maxWidth:400, position:"relative", maxHeight:"90vh", overflowY:"auto" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:20, color:"#6b6b6b", cursor:"pointer", lineHeight:1 }}>×</button>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#c5a572", fontWeight:400, marginBottom:20, letterSpacing:"0.05em" }}>AURUM KOREA</div>
        <div style={{ display:"flex", background:"#0a0a0a", borderRadius:8, padding:4, marginBottom:20, gap:4 }}>
          {["login","register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{ flex:1, background:tab===t?"#1e1e1e":"transparent", border:"none", color:tab===t?"#c5a572":"#6b6b6b", padding:"9px", borderRadius:6, cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif", fontWeight:tab===t?600:400, transition:"all 0.15s" }}>
              {t==="login" ? (ko?"로그인":"Sign In") : (ko?"회원가입":"Sign Up")}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
          <button disabled={loading} onClick={() => socialLogin("kakao")} style={{ width:"100%", background:"#FEE500", border:"none", color:"#1a1a1a", padding:"12px", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.7:1 }}>
            <span style={{ fontSize:18 }}>💬</span>{ko?"카카오로 계속하기":"Continue with Kakao"}
          </button>
          <button disabled={loading} onClick={() => socialLogin("naver")} style={{ width:"100%", background:"#03C75A", border:"none", color:"#fff", padding:"12px", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.7:1 }}>
            <span style={{ fontWeight:900, fontSize:16 }}>N</span>{ko?"네이버로 계속하기":"Continue with Naver"}
          </button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
          <div style={{ flex:1, height:1, background:"#282828" }} />
          <span style={{ fontSize:11, color:"#6b6b6b", fontFamily:"'Outfit',sans-serif" }}>{ko?"이메일로 계속":"or with email"}</span>
          <div style={{ flex:1, height:1, background:"#282828" }} />
        </div>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {tab==="register" && <input value={name} onChange={e=>setName(e.target.value)} placeholder={ko?"이름 (실명)":"Full Name"} style={inp} />}
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder={ko?"이메일 주소":"Email address"} style={inp} />
          <input value={pw} onChange={e=>setPw(e.target.value)} type="password" placeholder={ko?"비밀번호":"Password"} style={inp} />
          {tab==="register" && <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={ko?"휴대폰 번호 (선택사항)":"Phone (optional)"} style={inp} />}
          {tab==="register" && (
            <label style={{ display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer", marginTop:4 }}>
              <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{ marginTop:3, accentColor:"#c5a572" }} />
              <span style={{ fontSize:12, color:"#a09080", lineHeight:1.5 }}>{ko?"이용약관 및 개인정보처리방침에 동의합니다.":"I agree to the Terms and Privacy Policy."}</span>
            </label>
          )}
          {err && <p style={{ color:"#f87171", fontSize:12, margin:"4px 0 0", fontFamily:"'Outfit',sans-serif" }}>{err}</p>}
          <button type="submit" disabled={loading} style={{ marginTop:6, width:"100%", background:loading?"#282828":"linear-gradient(135deg,#c5a572,#8a6914)", border:"none", color:loading?"#6b6b6b":"#fff", padding:"13px", borderRadius:8, fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'Outfit',sans-serif", transition:"all 0.2s" }}>
            {loading ? (ko?"처리 중...":"Processing...") : tab==="login" ? (ko?"로그인":"Sign In") : (ko?"계정 만들기":"Create Account")}
          </button>
        </form>
        <p style={{ textAlign:"center", marginTop:10, fontSize:11, color:"#333", fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.3 }}>
          Demo: any email + password
        </p>
      </div>
    </div>
  );
}

export { Ticker, Nav, LoginModal, Toast };
