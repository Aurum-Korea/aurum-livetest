// GoldAI.jsx — floating AI chat widget (S-02)
// Fixed bottom-right, claude-haiku-4-5-20251001 via /api/chat
import { useState, useRef, useEffect } from 'react';

const CHIPS = [
  { ko: '지금 금 가격은?',     en: 'Current gold price?' },
  { ko: '한국보다 얼마나 저렴?', en: 'vs Korea premium?' },
  { ko: 'AGP 계산',            en: 'AGP calculation' },
  { ko: '게이트 혜택',          en: 'Gate benefits' },
];

export default function GoldAI({ lang, prices, krwRate, user }) {
  const [open, setOpen]       = useState(false);
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
      goldUSD:         prices?.gold?.toFixed(2) || '—',
      silverUSD:       prices?.silver?.toFixed(2) || '—',
      krwRate:         krwRate?.toFixed(0) || '—',
      koreaRetailKRW:  prices?.gold ? Math.round(prices.gold * krwRate * 1.20).toLocaleString('ko-KR') : '—',
      aurumPriceKRW:   prices?.gold ? Math.round(prices.gold * krwRate * 1.08).toLocaleString('ko-KR') : '—',
      savingsKRW:      prices?.gold ? Math.round(prices.gold * krwRate * 0.12).toLocaleString('ko-KR') : '—',
      userName:        user?.name || null,
      userGate:        user?.gate || null,
      userGMV:         user?.gmv || null,
    };

    const history = [...msgs, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, context }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: 'assistant', content: data.text || '오류가 발생했습니다.' }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: ko ? '연결 오류. 잠시 후 다시 시도하세요.' : 'Connection error. Please retry.' }]);
    } finally {
      setLoading(false);
    }
  };

  const W = 'min(380px, calc(100vw - 32px))';

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 24, zIndex: 9998 }}>
      {/* Expanded panel */}
      {open && (
        <div style={{
          width: W, height: 520,
          background: '#0d0b08', border: '1px solid rgba(197,165,114,0.35)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
          marginBottom: 12,
          animation: 'fadeUp 0.2s ease',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(197,165,114,0.15)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 17, color: '#C5A572', letterSpacing: '0.04em' }}>Gold AI</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#8a7d6b', letterSpacing: '0.12em' }}>AURUM × CLAUDE · 정보 제공 목적</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#8a7d6b', cursor: 'pointer', fontSize: 16, padding: '0 0 0 8px', lineHeight: 1 }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.length === 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontFamily: "'Pretendard',sans-serif", fontSize: 13, color: '#a0a0a0', lineHeight: 1.7, marginBottom: 14 }}>
                  {ko ? '금 시세, 한국 대비 절감액, AGP, Founders Gate에 대해 질문하세요.' : 'Ask about gold prices, Korea savings, AGP, or Founders Gates.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CHIPS.map((c, i) => (
                    <button key={i} onClick={() => send(ko ? c.ko : c.en)} style={{
                      background: 'rgba(197,165,114,0.07)', border: '1px solid rgba(197,165,114,0.25)',
                      color: '#C5A572', fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                      letterSpacing: '0.05em', padding: '5px 10px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,165,114,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(197,165,114,0.07)'}
                    >{ko ? c.ko : c.en}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? 'rgba(197,165,114,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.role === 'user' ? 'rgba(197,165,114,0.3)' : 'rgba(255,255,255,0.06)'}`,
                padding: '8px 12px',
                fontFamily: "'Pretendard',sans-serif", fontSize: 13, color: '#f5f0e8', lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
              }}>{m.content}</div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#C5A572', display: 'inline-block', animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(197,165,114,0.12)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={ko ? '질문을 입력하세요...' : 'Ask a question...'}
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,165,114,0.2)', color: '#f5f0e8', padding: '8px 12px', fontSize: 13, fontFamily: "'Pretendard',sans-serif", outline: 'none' }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} style={{
              background: input.trim() && !loading ? '#C5A572' : 'rgba(197,165,114,0.15)',
              border: 'none', color: '#0d0b08', padding: '8px 14px', cursor: 'pointer',
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
            }}>→</button>
          </div>

          {/* Footer */}
          <div style={{ padding: '5px 14px 8px', textAlign: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#8a7d6b', letterSpacing: '0.14em' }}>FOR INFORMATION ONLY · NOT FINANCIAL ADVICE</span>
          </div>
        </div>
      )}

      {/* Collapsed button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#0d0b08', border: '1px solid rgba(197,165,114,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: open ? 'none' : 'pulseRing 3s ease-in-out infinite',
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(197,165,114,0.9)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(197,165,114,0.5)'}
      >
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 16, color: '#C5A572', fontWeight: 600, letterSpacing: '0.02em' }}>AU</span>
      </button>
    </div>
  );
}
