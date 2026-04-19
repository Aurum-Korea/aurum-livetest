// GoldAI.jsx — floating widget with quick-pick menu before AI chat
import { useState, useRef, useEffect } from 'react';

const CHIPS = [
  { ko: '중앙은행이 왜 금을 사나요?', en: 'Why are central banks buying gold?' },
  { ko: '원화 가치가 금 대비 얼마나 하락했나요?', en: 'How much has KRW lost vs gold?' },
  { ko: 'GoldPath란 무엇인가요?',    en: 'What is GoldPath?' },
  { ko: '내 금 포지션 계산',         en: 'Calculate my position' },
];

export default function GoldAI({ lang, prices, krwRate, user, navigate }) {
  const [mode, setMode]       = useState('closed'); // 'closed' | 'picker' | 'chat'
  const [msgs, setMsgs]       = useState([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const ko = lang === 'ko';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: q };
    setMsgs(m => [...m, userMsg]);
    setLoading(true);
    const context = {
      goldUSD:        prices?.gold?.toFixed(2) || '—',
      silverUSD:      prices?.silver?.toFixed(2) || '—',
      krwRate:        krwRate?.toFixed(0) || '—',
      koreaRetailKRW: prices?.gold ? Math.round(prices.gold * krwRate * 1.20).toLocaleString('ko-KR') : '—',
      aurumPriceKRW:  prices?.gold ? Math.round(prices.gold * krwRate * 1.08).toLocaleString('ko-KR') : '—',
      savingsKRW:     prices?.gold ? Math.round(prices.gold * krwRate * 0.12).toLocaleString('ko-KR') : '—',
      userName:       user?.name || null,
    };
    const history = [...msgs, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content }));
    try {
      const res  = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: history, context }) });
      const data = await res.json();
      setMsgs(m => [...m, { role:'assistant', content: data.text || '오류가 발생했습니다.' }]);
    } catch {
      setMsgs(m => [...m, { role:'assistant', content: ko ? '연결 오류. 잠시 후 다시 시도하세요.' : 'Connection error. Please retry.' }]);
    } finally { setLoading(false); }
  };

  const W = 'min(360px, calc(100vw - 32px))';
  const MONO   = "'JetBrains Mono','Courier New',monospace";
  const SERIF  = "'Cormorant Garamond',Georgia,serif";
  const SANS   = "'Pretendard','Outfit',sans-serif";
  const gold   = '#C5A572';
  const goldDim= '#8a7d6b';
  const bg     = '#0d0b08';
  const border = 'rgba(197,165,114,0.35)';

  const MENU_ITEMS = [
    {
      icon: '✦',
      label: ko ? 'Gold AI' : 'Gold AI',
      sub:   ko ? '금 가격·절감액·AGP 질문' : 'Ask about gold, savings, AGP',
      color: gold,
      action: () => setMode('chat'),
    },
    {
      icon: 'F',
      label: 'Founders Club',
      sub:   ko ? '게이트 혜택·멤버십 안내' : 'Gates, lifetime discounts',
      color: '#E3C187',
      action: () => { navigate?.('founders-promo'); setMode('closed'); },
    },
    {
      icon: 'A',
      label: 'AGP 적금',
      sub:   ko ? '월 적립·실물 금 전환' : 'Monthly gold accumulation',
      color: gold,
      action: () => { navigate?.('agp'); setMode('closed'); },
    },
  ];

  return (
    <div style={{ position:'fixed', bottom:28, right:24, zIndex:9998, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:0 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(197,165,114,0.3)}50%{box-shadow:0 0 0 8px rgba(197,165,114,0)}}`}</style>

      {/* Quick-pick popup */}
      {mode === 'picker' && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:-1 }} onClick={() => setMode('closed')} />
          <div style={{ width: W, background:bg, border:`1px solid ${border}`, marginBottom:10, boxShadow:'0 16px 48px rgba(0,0,0,0.7)', animation:'fadeUp 0.18s ease' }}>
            <div style={{ padding:'10px 14px', borderBottom:`1px solid rgba(197,165,114,0.1)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:13, color:gold, letterSpacing:'0.06em' }}>Aurum Korea</span>
              <button onClick={() => setMode('closed')} style={{ background:'none', border:'none', color:goldDim, cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px' }}>×</button>
            </div>
            {MENU_ITEMS.map((item, i) => (
              <button key={i} onClick={item.action} style={{
                width:'100%', background:'none', border:'none', borderBottom: i < MENU_ITEMS.length-1 ? `1px solid rgba(197,165,114,0.08)` : 'none',
                padding:'14px 16px', display:'flex', alignItems:'center', gap:14, cursor:'pointer',
                textAlign:'left', transition:'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,114,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{ width:34, height:34, border:`1px solid rgba(197,165,114,0.35)`, background:'rgba(197,165,114,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:SERIF, fontStyle:'italic', fontSize:15, color:item.color }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily:SANS, fontSize:14, fontWeight:600, color:'#f5f0e8', marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontFamily:MONO, fontSize:10, color:goldDim, letterSpacing:'0.06em' }}>{item.sub}</div>
                </div>
                <span style={{ marginLeft:'auto', color:goldDim, fontSize:12 }}>→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* AI chat panel */}
      {mode === 'chat' && (
        <div style={{ width:W, height:520, background:bg, border:`1px solid ${border}`, display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,0.7)', marginBottom:10, animation:'fadeUp 0.2s ease' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid rgba(197,165,114,0.15)`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <span className="live-dot" />
            <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:17, color:gold, letterSpacing:'0.04em' }}>Gold AI</span>
            <span style={{ flex:1 }} />
            <button onClick={() => setMode('picker')} style={{ background:'none', border:'none', color:goldDim, cursor:'pointer', fontFamily:MONO, fontSize:9, letterSpacing:'0.1em', padding:'0 6px' }}>← MENU</button>
            <button onClick={() => setMode('closed')} style={{ background:'none', border:'none', color:goldDim, cursor:'pointer', fontSize:16, padding:'0 0 0 4px', lineHeight:1 }}>×</button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
            {msgs.length === 0 && (
              <div style={{ marginTop:8 }}>
                <p style={{ fontFamily:SANS, fontSize:13, color:'#a0a0a0', lineHeight:1.7, marginBottom:14 }}>
                  {ko ? '금 시세, 한국 대비 절감액, AGP, Founders Gate에 대해 질문하세요.' : 'Ask about gold prices, Korea savings, AGP, or Founders Gates.'}
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {CHIPS.map((c, i) => (
                    <button key={i} onClick={() => send(ko ? c.ko : c.en)} style={{ background:'rgba(197,165,114,0.07)', border:`1px solid rgba(197,165,114,0.25)`, color:gold, fontFamily:MONO, fontSize:10, letterSpacing:'0.05em', padding:'5px 10px', cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(197,165,114,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(197,165,114,0.07)'}
                    >{ko ? c.ko : c.en}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role==='user'?'flex-end':'flex-start', maxWidth:'85%', background: m.role==='user'?'rgba(197,165,114,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${m.role==='user'?'rgba(197,165,114,0.3)':'rgba(255,255,255,0.06)'}`, padding:'8px 12px', fontFamily:SANS, fontSize:13, color:'#f5f0e8', lineHeight:1.65, whiteSpace:'pre-wrap' }}>{m.content}</div>
            ))}
            {loading && (
              <div style={{ alignSelf:'flex-start', display:'flex', gap:4, padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                {[0,1,2].map(i => (<span key={i} style={{ width:5, height:5, borderRadius:'50%', background:gold, display:'inline-block', animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }} />))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:'10px 12px', borderTop:`1px solid rgba(197,165,114,0.12)`, display:'flex', gap:8, flexShrink:0 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
              placeholder={ko ? '질문을 입력하세요...' : 'Ask a question...'}
              style={{ flex:1, background:'rgba(255,255,255,0.04)', border:`1px solid rgba(197,165,114,0.2)`, color:'#f5f0e8', padding:'8px 12px', fontSize:13, fontFamily:SANS, outline:'none' }} />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{ background: input.trim()&&!loading ? gold : 'rgba(197,165,114,0.15)', border:'none', color:'#0d0b08', padding:'8px 14px', cursor:'pointer', fontFamily:MONO, fontSize:11, fontWeight:700 }}>→</button>
          </div>
          <div style={{ padding:'5px 14px 8px', textAlign:'center', flexShrink:0 }}>
            <span style={{ fontFamily:MONO, fontSize:8, color:goldDim, letterSpacing:'0.14em' }}>FOR INFORMATION ONLY · NOT FINANCIAL ADVICE</span>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setMode(m => m === 'closed' ? 'picker' : 'closed')}
        style={{ width:52, height:52, borderRadius:'50%', background:bg, border:`1px solid rgba(197,165,114,${mode!=='closed'?'0.9':'0.5'})`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.5)', animation: mode==='closed'?'pulseRing 3s ease-in-out infinite':'none', transition:'all 0.25s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='rgba(197,165,114,0.9)'}
        onMouseLeave={e => e.currentTarget.style.borderColor=`rgba(197,165,114,${mode!=='closed'?'0.9':'0.5'})`}>
        <span style={{ fontFamily:SERIF, fontStyle:'italic', fontSize:16, color:gold, fontWeight:600, letterSpacing:'0.02em' }}>AU</span>
      </button>
    </div>
  );
}
