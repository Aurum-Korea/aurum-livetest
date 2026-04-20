import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import AUSquare from '../components/AUSquare';
import AurumWordmark from '../components/AurumWordmark';
import QuietFooter from '../components/QuietFooter';
import CagrToggle, { DEFAULT_CAGR } from '../components/CagrToggle';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { AGP_CREDITS, TOTAL_CREDITS, fUSD, OZ_G, KR_RETAIL_MARKUP, SAVINGS_APY, fmtManEok } from '../lib/constants';


/* ═══════════════════════════════════════════════════════════════════════════
   AURUM · /terminal · Authenticated members dashboard
   V2 Terminal register. Pure data surface, LAUNCHING Q2 2026 badges per
   governance doc. Reactive-motion unified from /founders audit:
   every panel responds to user input, not just ambient animation.
   Q2 note: corporate mark reverts to AU-in-a-square (generic) per user.
   ═══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// LAUNCHING Q2 BADGE · locked spec from exec pack
// ═══════════════════════════════════════════════════════════════════════════
function LaunchBadge({ text = 'LAUNCHING Q2 2026' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px',
      border: `1px dashed rgba(197,165,114,0.3)`,
      fontFamily: T.mono, fontSize: 8, color: T.goldD,
      letterSpacing: '0.22em', fontWeight: 500,
      textTransform: 'uppercase', whiteSpace: 'nowrap',
      verticalAlign: 'middle', marginLeft: 8,
    }}>{text}</span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMINAL BAR — ticker + command strip + session clock
// ═══════════════════════════════════════════════════════════════════════════
function TerminalBar() {
  const [now, setNow] = useState(new Date());
  const [spotFlash, setSpotFlash] = useState(null); // 'up' | 'dn' | null
  const [spot, setSpot] = useState(4842.10);
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    // Live spot tick simulation — every 4-8 seconds price moves
    const tick = setInterval(() => {
      setSpot(s => {
        const delta = (Math.random() - 0.45) * 2.5;
        const next = Math.max(4800, Math.min(4880, s + delta));
        setSpotFlash(delta > 0 ? 'up' : 'dn');
        setTimeout(() => setSpotFlash(null), 1200);
        return Number(next.toFixed(2));
      });
    }, 5500);
    return () => { clearInterval(clock); clearInterval(tick); };
  }, []);

  const ticks = [
    { sym: 'XAUUSD', val: spot.toFixed(2), d: '+0.78%', up: true, flash: true },
    { sym: 'XAUKRW', val: Math.round(spot * 1440.20 / 31.1035).toLocaleString(), d: '+1.22%', up: true },
    { sym: 'USDKRW', val: '1,440.20', d: '+0.31%', up: true },
    { sym: 'KR-PREM', val: '20.1%', d: '+0.4bp', up: true },
    { sym: 'CB-Q3', val: '220t', d: '+28%', up: true },
    { sym: 'FNDR', val: '253/500', d: 'G·I', up: true },
    { sym: 'AGP-C', val: '2848/5K', d: 'DROP', up: true },
    { sym: 'KOSPI', val: '2,604', d: '−0.6%', up: false },
  ];
  return (
    <div style={{ background: T.deepBlack, borderBottom: `1px solid ${T.goldBorder}`, fontFamily: T.mono }}>
      {/* Ticker row */}
      <div style={{ overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)', height: 28 }}>
        <div style={{ display: 'flex', animation: 'ticker-scroll 55s linear infinite', whiteSpace: 'nowrap' }}>
          {[...ticks, ...ticks, ...ticks].map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '0 16px',
              borderRight: '1px solid rgba(255,255,255,0.04)', height: 28, gap: 8,
              animation: t.flash && spotFlash ? `price-flash-${spotFlash} 1.2s ease-out` : 'none',
            }}>
              <span style={{ fontSize: 9, color: T.goldD, letterSpacing: '0.1em' }}>{t.sym}</span>
              <span style={{ fontSize: 10, color: T.text }}>{t.val}</span>
              <span style={{ fontSize: 9, color: t.up ? T.green : T.red }}>{t.d}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Command strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', height: 40, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Q2 REVERSAL: keeping AU-in-square corp mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AUSquare size={24} />
            <AurumWordmark size={13} />
            <span style={{ fontSize: 8, color: T.goldD, letterSpacing: '0.22em', marginLeft: 4 }}>TERMINAL</span>
          </div>
          <div style={{ width: 1, height: 14, background: T.border }} />
          {[
            { k: 'HOME', id: 'panel-pos' },
            { k: 'POS',  id: 'panel-pos' },
            { k: 'ORDER',id: 'panel-03' },
            { k: 'VAULT',id: 'panel-04' },
            { k: 'HIST', id: 'panel-05' },
            { k: 'ACCT', id: 'panel-acct' },
          ].map(({ k, id }, i) => (
            <button key={i} onClick={() => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} style={{
              background: i === 1 ? T.goldGlow : 'transparent',
              border: `1px solid ${i === 1 ? T.goldBorder : 'transparent'}`,
              color: i === 1 ? T.gold : T.sub, padding: '3px 9px', fontSize: 10,
              letterSpacing: '0.18em', fontFamily: T.mono, cursor: 'pointer',
            }}>{k}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}`, animation: 'pulse 1.8s ease-in-out infinite', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: T.green, letterSpacing: '0.14em' }}>SESSION · AUTH</span>
          <span style={{ fontSize: 9, color: T.muted }}>{now.toISOString().slice(11, 19)} UTC</span>
          <span style={{ fontSize: 9, color: T.goldD, letterSpacing: '0.14em', borderLeft: `1px solid ${T.border}`, paddingLeft: 10 }}>K.J.H</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PANEL SHELL · consistent wrap for every section
// ═══════════════════════════════════════════════════════════════════════════
function Panel({ num, title, sub, live = false, badge = false, children, compact = false, id }) {
  return (
    <div id={id} style={{ marginBottom: compact ? 16 : 20, scrollMarginTop: 120 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${T.goldBorder}`, paddingBottom: 10, marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em' }}>§ {num}</span>
          <span style={{ fontFamily: T.serifKr, fontSize: 18, fontWeight: 500, color: T.text, lineHeight: 1 }}>{title}</span>
          {badge && <LaunchBadge />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {live && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}`, animation: 'pulse 1.8s ease-in-out infinite' }} />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.green, letterSpacing: '0.18em' }}>LIVE</span>
            </span>
          )}
          {sub && <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD }}>{sub}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 01 — POSITION OVERVIEW · user's grams, KRW value, next debit
// ═══════════════════════════════════════════════════════════════════════════
function PositionOverview() {
  const [spot, setSpot] = useState(4842.10);
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    const id = setInterval(() => {
      setSpot(s => {
        const delta = (Math.random() - 0.45) * 2.2;
        const next = Math.max(4820, Math.min(4870, s + delta));
        setFlash(delta > 0 ? 'up' : 'dn');
        setTimeout(() => setFlash(null), 1200);
        return Number(next.toFixed(2));
      });
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const grams = 42.37;
  const avgCostUSD = 4720;
  const currentValueUSD = grams * spot / 31.1035;
  const costBasisUSD = grams * avgCostUSD / 31.1035;
  const gainUSD = currentValueUSD - costBasisUSD;
  const gainPct = (gainUSD / costBasisUSD) * 100;
  const gainKRW = gainUSD * 1440.20;

  return (
    <Panel id="panel-pos" num="01" title="포지션 · Position" sub="gold · allocated · Malca-Amit SGP" live>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, background: T.border }}>
        {/* Holdings */}
        <div style={{ background: T.card, padding: '22px 20px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 10 }}>ALLOCATED · GRAMS</div>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 46, color: T.goldB, fontWeight: 500, lineHeight: 1 }}>{grams.toFixed(2)}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, marginTop: 6, letterSpacing: '0.16em' }}>g · 999.9 · 6 bars</div>
        </div>
        {/* Current value */}
        <div style={{ background: T.card, padding: '22px 20px', animation: flash ? `price-flash-${flash} 1.2s ease-out` : 'none' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 10 }}>CURRENT VALUE</div>
          <div style={{ fontFamily: T.mono, fontSize: 24, color: T.text, fontWeight: 600 }}>
            ₩{Math.round(currentValueUSD * 1440.20).toLocaleString()}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>
            ${currentValueUSD.toFixed(2).toLocaleString()} · spot ${spot.toFixed(2)}
          </div>
        </div>
        {/* Unrealized */}
        <div style={{ background: T.card, padding: '22px 20px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 10 }}>UNREALIZED · P&L</div>
          <div style={{ fontFamily: T.mono, fontSize: 24, color: gainPct > 0 ? T.green : T.red, fontWeight: 600 }}>
            {gainPct > 0 ? '+' : ''}{gainPct.toFixed(2)}%
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: gainPct > 0 ? T.green : T.red, opacity: 0.7, marginTop: 4 }}>
            {gainKRW > 0 ? '+' : ''}₩{Math.round(gainKRW).toLocaleString()}
          </div>
        </div>
        {/* Gate */}
        <div style={{ background: T.card, padding: '22px 20px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 10 }}>FOUNDERS · GATE</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 34, color: T.gold, fontWeight: 500, lineHeight: 1 }}>III</div>
            <div style={{ fontFamily: T.serifKr, fontSize: 13, color: T.text, fontWeight: 500 }}>정점</div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, marginTop: 6, letterSpacing: '0.14em' }}>−2.0% · FOREVER</div>
        </div>
      </div>

      {/* Next debit strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, background: T.bg3, border: `1px solid ${T.border}`, borderTop: 'none', padding: '14px 20px', marginTop: 0 }} className="next-strip">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 4 }}>NEXT SCHEDULED DEBIT</div>
            <div style={{ fontFamily: T.mono, fontSize: 14, color: T.text, fontWeight: 500 }}>
              <span style={{ color: T.goldB }}>2026-05-15</span>
              <span style={{ color: T.muted, margin: '0 8px' }}>·</span>
              <span>100만원</span>
              <span style={{ color: T.muted, margin: '0 8px' }}>·</span>
              <span style={{ color: T.gold }}>GoldPath 금환</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => alert('이번 달 debit 일회성 건너뛰기 · Skip next debit only')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '8px 14px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer' }}>SKIP ONCE</button>
            <button onClick={() => {
              const el = document.getElementById('panel-03');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '8px 14px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer' }}>MODIFY</button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 02 — KOREAN ARB TAPE · live price comparison
// ═══════════════════════════════════════════════════════════════════════════
function KoreanArbTape() {
  const [spot, setSpot] = useState(4842.10);
  const [flashIdx, setFlashIdx] = useState(-1);
  useEffect(() => {
    const id = setInterval(() => {
      setSpot(s => {
        const delta = (Math.random() - 0.45) * 2.5;
        return Number(Math.max(4820, Math.min(4870, s + delta)).toFixed(2));
      });
      setFlashIdx(Math.floor(Math.random() * 3));
      setTimeout(() => setFlashIdx(-1), 1200);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const per1g_spot = spot / 31.1035;
  const per1g_aurum_list = per1g_spot * 1.08; // 8% platform margin
  const per1g_aurum_founders = per1g_aurum_list * (1 - 0.02); // Gate III −2%
  const per1g_kr_retail = per1g_spot * 1.20; // KR retail premium

  const rows = [
    { lbl: '국제 현물 · Spot', krw: per1g_spot * 1440.20, note: 'LBMA reference', color: T.sub, tone: 0 },
    { lbl: '한국 소매 · KR retail', krw: per1g_kr_retail * 1440.20, note: '+VAT +수입프리미엄', color: T.red, tone: +20 },
    { lbl: 'Aurum · 일반', krw: per1g_aurum_list * 1440.20, note: 'spot +8.0%', color: T.goldB, tone: +8 },
    { lbl: 'Aurum · Founders III · 나', krw: per1g_aurum_founders * 1440.20, note: 'spot +5.84% · 평생', color: T.green, tone: +5.84, me: true },
  ];

  return (
    <Panel num="02" title="가격 비교 · Korean arb" sub="live · 1g" live>
      <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
        <div className="arb-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 70px', padding: '10px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
          <span>LANE</span><span>PRICE · 1g · KRW</span><span>NOTE</span><span style={{ textAlign: 'right' }}>vs SPOT</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="arb-row" style={{
            display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 70px',
            padding: '14px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : 'none',
            alignItems: 'center', fontFamily: T.mono, fontSize: 12,
            animation: flashIdx === i ? 'price-flash-up 1.2s ease-out' : 'none',
            background: r.me ? 'rgba(74,222,128,0.04)' : 'transparent',
          }}>
            <div>
              <span style={{ color: r.me ? T.green : T.text, fontWeight: r.me ? 600 : 500, fontSize: 13 }}>{r.lbl}</span>
            </div>
            <span className="arb-price" style={{ color: r.color, fontSize: 15, fontWeight: 600 }}>
              ₩{Math.round(r.krw).toLocaleString()}
            </span>
            <span className="arb-note" style={{ color: T.muted, fontSize: 10 }}>{r.note}</span>
            <span className="arb-tone" style={{ color: r.color, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
              {r.tone === 0 ? '—' : `${r.tone > 0 ? '+' : ''}${r.tone}%`}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 560px) {
          .arb-header { grid-template-columns: 1.3fr 1fr 60px !important; font-size: 8px !important; padding: 10px 12px !important; }
          .arb-header span:nth-child(3) { display: none; }
          .arb-row { grid-template-columns: 1.3fr 1fr 60px !important; padding: 12px 12px !important; }
          .arb-note { display: none; }
          .arb-price { font-size: 13px !important; }
          .arb-tone { font-size: 11px !important; }
        }
      `}</style>
      <div style={{ marginTop: 12, padding: '10px 14px', background: T.deepBlack, border: `1px dashed ${T.border}`, fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.6, letterSpacing: '0.06em' }}>
        한국 소매 대비 귀하의 1g 절감: <span style={{ color: T.green, fontWeight: 600 }}>{fmtManEok((per1g_kr_retail - per1g_aurum_founders) * 1440.20)}</span> · 다음 debit(100만원)에서 약 <span style={{ color: T.green, fontWeight: 600 }}>{fmtManEok((per1g_kr_retail - per1g_aurum_founders) * 1440.20 * (1_000_000 / (per1g_aurum_founders * 1440.20)))}</span> 절감 예상.
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 03 — ORDER TICKET · modify subscription mode
// ═══════════════════════════════════════════════════════════════════════════
function OrderTicket() {
  const [monthly, setMonthly] = useState(1_000_000);
  const [day, setDay] = useState(15);
  const [years, setYears] = useState(10);
  const [cagr, setCagr] = useState(DEFAULT_CAGR);
  const pct = (monthly - 200_000) / (5_000_000 - 200_000) * 100;

  const tier = monthly >= 5_000_000 ? { n: 'V', ko: '소브린', gift: '₩5M' }
    : monthly >= 2_000_000 ? { n: 'IV', ko: '플래티넘', gift: '₩1.5M' }
    : monthly >= 1_000_000 ? { n: 'III', ko: '골드', gift: '₩400K' }
    : monthly >= 500_000 ? { n: 'II', ko: '실버', gift: '₩150K' }
    : { n: 'I', ko: '브론즈', gift: '₩50K' };

  const gramsPerMonth = (monthly / (4842.10 * 1440.20 / 31.1035 * 1.08)).toFixed(3);
  const annualGrams = (gramsPerMonth * 12).toFixed(2);

  // Projected end value · monthly compounding at selected CAGR
  const months = years * 12;
  const monthlyRate = Math.pow(1 + cagr, 1/12) - 1;
  let projectedValue = 0;
  for (let m = 0; m < months; m++) {
    const remaining = months - m;
    projectedValue += monthly * Math.pow(1 + monthlyRate, remaining);
  }
  const totalIn = monthly * months;
  const gainPct = totalIn > 0 ? ((projectedValue / totalIn) - 1) * 100 : 0;

  return (
    <Panel id="panel-03" num="03" title="주문 수정 · Modify subscription" sub="slider → live tier reassign">
      <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, display: 'grid', gridTemplateColumns: '1fr', gap: 0 }} className="order-grid">
        {/* Left — form */}
        <div style={{ padding: 24, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 22, marginBottom: 20 }} className="form-two">
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 8 }}>ORDER TYPE</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[{ k: 'AGP', lbl: '적립', on: true }, { k: 'SPOT', lbl: '현물' }].map((o, i) => (
                  <div key={i} style={{ flex: 1, padding: '9px 12px', border: `1px solid ${o.on ? T.gold : T.border}`, background: o.on ? T.goldGlow : 'transparent', textAlign: 'center', fontFamily: T.mono, fontSize: 10, color: o.on ? T.gold : T.sub, letterSpacing: '0.14em' }}>
                    {o.k} · {o.lbl}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 8 }}>SETTLE DAY</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[1, 5, 10, 15, 20, 25].map(d => (
                  <button key={d} onClick={() => setDay(d)} style={{
                    padding: '7px 11px', border: `1px solid ${d === day ? T.gold : T.border}`,
                    background: d === day ? T.goldGlow : 'transparent',
                    fontFamily: T.mono, fontSize: 10, color: d === day ? T.gold : T.sub,
                    minWidth: 36, textAlign: 'center',
                  }}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>MONTHLY · 월 적립액</span>
              <span style={{ fontFamily: T.mono, fontSize: 16, color: T.goldB, fontWeight: 600 }}>₩{(monthly / 10000).toLocaleString()}만</span>
            </div>
            <input type="range" min={200000} max={5000000} step={100000} value={monthly}
              onChange={e => setMonthly(+e.target.value)}
              style={{ '--pct': `${pct}%` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 4, letterSpacing: '0.1em' }}>
              <span>₩200K</span><span>₩5M</span>
            </div>
          </div>

          {/* Horizon */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>HORIZON · 기간</span>
              <span style={{ fontFamily: T.mono, fontSize: 14, color: T.goldB, fontWeight: 600 }}>{years}년</span>
            </div>
            <input type="range" min={1} max={25} step={1} value={years}
              onChange={e => setYears(+e.target.value)}
              style={{ width: '100%', '--pct': `${((years - 1) / (25 - 1)) * 100}%` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 4, letterSpacing: '0.1em' }}>
              <span>1yr</span><span>25yr</span>
            </div>
          </div>

          {/* CAGR toggle */}
          <div style={{ marginBottom: 16 }}>
            <CagrToggle value={cagr} onChange={setCagr} compact />
          </div>

          {/* Tier preview + projection */}
          <div style={{ background: T.deepBlack, border: `1px solid ${T.border}`, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>TIER · AUTO</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.goldB, marginTop: 4, lineHeight: 1 }}>{tier.n}</div>
                <div style={{ fontFamily: T.serifKr, fontSize: 12, color: T.text, marginTop: 2 }}>{tier.ko}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>LAUNCH GIFT</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.gold, marginTop: 4, lineHeight: 1 }}>{tier.gift}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4, letterSpacing: '0.14em' }}>PER FOUNDING COHORT</div>
              </div>
            </div>
            {/* Projection row */}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>PROJECTED @ {(cagr * 100).toFixed(0)}% · {years}yr</span>
                <span style={{ fontFamily: T.mono, fontSize: 14, color: T.goldB, fontWeight: 700 }}>₩{Math.round(projectedValue / 10000).toLocaleString()}만</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>TOTAL IN</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.sub }}>₩{Math.round(totalIn / 10000).toLocaleString()}만 <span style={{ color: T.green || '#4ade80' }}>+{gainPct.toFixed(1)}%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — execute preview */}
        <div style={{ padding: 24, background: 'linear-gradient(180deg, #0a0906, #060504)' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 16 }}>PREVIEW · ACTIVE FROM NEXT CYCLE</div>
          <div style={{ marginBottom: 18 }}>
            {[
              { l: 'Monthly', v: `₩${monthly.toLocaleString()}` },
              { l: 'Debit day', v: `매달 ${day}일` },
              { l: 'Gold / month', v: `≈ ${gramsPerMonth}g @ spot` },
              { l: 'Annual accrual', v: `≈ ${annualGrams}g / year` },
              { l: 'Founders discount', v: '−2.0% · lifetime' },
              { l: 'Vault', v: 'Malca-Amit SGP · allocated' },
              { l: 'Cancel', v: 'any time · 1 click' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${T.border}`, fontFamily: T.mono, fontSize: 11 }}>
                <span style={{ color: T.muted }}>{r.l}</span>
                <span style={{ color: T.text }}>{r.v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Changes applied. Effective next debit cycle.')} style={{ width: '100%', background: T.gold, color: T.bg, padding: 14, fontFamily: T.mono, fontWeight: 700, fontSize: 11, letterSpacing: '0.22em', cursor: 'pointer', border: 'none' }}>
            ▶ APPLY CHANGES
          </button>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: '0.12em', marginTop: 10, textAlign: 'center', lineHeight: 1.6 }}>
            변경은 다음 debit부터 반영됩니다 · 오늘의 스케줄은 영향받지 않습니다
          </div>
        </div>

        <style>{`
          @media (min-width: 860px) {
            .order-grid { grid-template-columns: 1.3fr 1fr !important; }
            .order-grid > div:first-child { border-bottom: none !important; border-right: 1px solid ${T.border} !important; }
            .form-two { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 04 — VAULT STATUS · 6-metric tile grid with LAUNCHING Q2 badges
// ═══════════════════════════════════════════════════════════════════════════
function VaultStatus() {
  const metrics = [
    { lbl: 'ALLOCATED AU · TOTAL', v: '0.00', u: 'kg', d: 'awaiting first bar', badge: true },
    { lbl: 'HOLDERS', v: '0', u: '', d: 'pre-launch', badge: true },
    { lbl: 'AUM', v: '$0', u: 'M', d: 'USD', badge: true },
    { lbl: 'LAST AUDIT', v: 'PENDING', u: '', d: "BRINK'S · Q3 2026 est.", badge: true },
    { lbl: 'INSURED', v: '100', u: '%', d: "LLOYD'S · policy active", badge: false },
    { lbl: 'REDEEM SLA', v: '< 72', u: 'h', d: 'SGP → ICN · committed', badge: false },
  ];
  return (
    <Panel id="panel-04" num="04" title="볼트 상태 · Vault" sub="Malca-Amit FTZ · Changi · live">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: T.border }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: T.card, padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>{m.lbl}</div>
              {m.badge && <LaunchBadge text="Q2 2026" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 30, color: m.badge ? T.goldD : T.gold, fontWeight: 500, lineHeight: 1 }}>{m.v}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD }}>{m.u}</span>
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em', marginTop: 6, textTransform: 'uppercase' }}>{m.d}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 05 — EVENT LOG · empty state per governance
// ═══════════════════════════════════════════════════════════════════════════
function EventLog() {
  return (
    <Panel id="panel-05" num="05" title="이벤트 로그 · Event stream" badge>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, padding: '60px 24px 56px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em', marginBottom: 20 }}>· · ·</div>
        <div style={{ fontFamily: T.serifKr, fontSize: 18, color: T.sub, lineHeight: 1.6, fontWeight: 400, marginBottom: 8 }}>
          이벤트 스트림은 Q2 2026 출시와 함께 시작됩니다.
        </div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD, lineHeight: 1.5 }}>
          Event stream begins with Q2 2026 launch.
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.14em', marginTop: 24, maxWidth: 440, margin: '24px auto 0', lineHeight: 1.7 }}>
          첫 AGP 정산, 실물 인출, 또는 게이트 진입이 발생하면 여기에 실시간으로 표시됩니다.
        </div>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 06 — HOLDINGS LEDGER · per-bar serialized inventory
// ═══════════════════════════════════════════════════════════════════════════
function HoldingsLedger() {
  const bars = [
    { sn: 'AU-KR-000421', wt: '10.00g', pure: '999.9', buy: '2025-11-15', cost: '68만 2,400원', bar: 'PAMP 10g' },
    { sn: 'AU-KR-000498', wt: '10.00g', pure: '999.9', buy: '2025-12-15', cost: '69만 4,200원', bar: 'PAMP 10g' },
    { sn: 'AU-KR-000562', wt: '5.00g',  pure: '999.9', buy: '2026-01-15', cost: '35만 1,800원', bar: 'Argor 5g' },
    { sn: 'AU-KR-000634', wt: '5.00g',  pure: '999.9', buy: '2026-02-15', cost: '35만 8,100원', bar: 'Argor 5g' },
    { sn: 'AU-KR-000716', wt: '6.22g',  pure: '999.9', buy: '2026-03-15', cost: '44만 6,900원', bar: 'Aggregated' },
    { sn: 'AU-KR-000802', wt: '6.15g',  pure: '999.9', buy: '2026-04-15', cost: '44만 9,300원', bar: 'Aggregated' },
  ];
  return (
    <Panel num="06" title="보관 원장 · Holdings ledger" sub="6 records · allocated">
      <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
        <div className="ledger-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 600 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1.1fr 1.1fr 1fr 60px', padding: '10px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <span>SERIAL</span><span>WEIGHT</span><span>PURE</span><span>ACQUIRED</span><span>COST · KRW</span><span>BAR</span><span></span>
          </div>
          {bars.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1.1fr 1.1fr 1fr 60px', padding: '12px 16px', borderBottom: i < bars.length - 1 ? `1px solid ${T.border}` : 'none', fontFamily: T.mono, fontSize: 11, alignItems: 'center' }}>
              <span style={{ color: T.gold, letterSpacing: '0.06em' }}>{b.sn}</span>
              <span style={{ color: T.text }}>{b.wt}</span>
              <span style={{ color: T.muted, fontSize: 10 }}>{b.pure}</span>
              <span style={{ color: T.sub, fontSize: 10 }}>{b.buy}</span>
              <span style={{ color: T.text }}>{b.cost}</span>
              <span style={{ color: T.goldD, fontSize: 10 }}>{b.bar}</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, textAlign: 'right', cursor: 'pointer', letterSpacing: '0.14em' }}>PDF ↗</span>
            </div>
          ))}
          </div>
        </div>
        <div className="ledger-swipe-hint" style={{
          display: 'none', padding: '6px 16px', background: T.deepBlack,
          borderTop: `1px dashed ${T.goldBorder}`,
          fontFamily: T.mono, fontSize: 9, color: T.gold,
          letterSpacing: '0.2em', textAlign: 'center',
        }}>
          ← SWIPE TO SEE ALL COLUMNS →
        </div>
      </div>
      <style>{`
        .ledger-scroll::-webkit-scrollbar { height: 6px; }
        .ledger-scroll::-webkit-scrollbar-track { background: rgba(197,165,114,0.06); }
        .ledger-scroll::-webkit-scrollbar-thumb { background: rgba(197,165,114,0.5); border-radius: 3px; }
        @media (max-width: 640px) {
          .ledger-swipe-hint { display: block !important; }
        }
      `}</style>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.14em' }}>
        <span>TOTAL · 42.37g · allocated in your name</span>
        <span style={{ color: T.gold, cursor: 'pointer' }}>EXPORT ALL → CSV / PDF</span>
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 07 — REDEMPTION PANEL · action bar
// ═══════════════════════════════════════════════════════════════════════════
function RedemptionPanel() {
  return (
    <Panel num="07" title="인출 · Redemption" sub="cash · physical · transfer">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        {[
          { icon: '₩', title: 'KRW 환매', titleEn: 'Cash out', desc: '72시간 이내 원화 입금', sla: 'T+3 · bank' },
          { icon: '▣', title: '실물 인출', titleEn: 'Physical withdrawal', desc: '1g / 10g / 100g · SGP→ICN', sla: '2-3주 · insured' },
          { icon: '↔', title: '계정 이체', titleEn: 'Internal transfer', desc: '다른 Aurum 계정으로', sla: 'instant' },
        ].map((r, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: '22px 20px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.gold, fontWeight: 500, lineHeight: 1 }}>{r.icon}</span>
              <div>
                <div style={{ fontFamily: T.serifKr, fontSize: 15, color: T.text, fontWeight: 500 }}>{r.title}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD }}>{r.titleEn}</div>
              </div>
            </div>
            <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.6, marginBottom: 10 }}>{r.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>{r.sla}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.14em' }}>REQUEST →</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// § 08 — ACCOUNT STRIP · footer utility row
// ═══════════════════════════════════════════════════════════════════════════
function AccountStrip() {
  return (
    <Panel id="panel-acct" num="08" title="계정 · Account" compact>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: T.border }}>
        {[
          { lbl: 'KYC STATUS', v: 'VERIFIED', tone: T.green, sub: 'NICE · KCB PASS' },
          { lbl: 'MEMBER SINCE', v: '2025-09', tone: T.text, sub: '7달째 · streak' },
          { lbl: 'FOUNDERS GATE', v: 'III · 정점', tone: T.gold, sub: '−2.0% · lifetime' },
          { lbl: 'DOCUMENTS', v: '12 PDFs', tone: T.sub, sub: 'audits · invoices · receipts' },
        ].map((r, i) => (
          <div key={i} style={{ background: T.card, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 4 }}>{r.lbl}</div>
            <div style={{ fontFamily: T.mono, fontSize: 13, color: r.tone, fontWeight: 600 }}>{r.v}</div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4, letterSpacing: '0.1em' }}>{r.sub}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TERMINAL FOOTER
// ═══════════════════════════════════════════════════════════════════════════
function TerminalFooter() {
  return (
    <div style={{ background: T.deepBlack, borderTop: `1px solid ${T.goldBorder}`, padding: '24px 20px 16px' }}>
      <div style={{ maxWidth: 1340, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>
        <span>© MMXXVI AURUM · SGP</span>
        <span>BUILD 2026.04.19 · V2.1.0-terminal</span>
        <span>MAS PSPM 2019 · LLOYD'S · BRINK'S</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
export default function TerminalPage() {
  return (
    <div style={{ background: T.deepBlack, color: T.text, minHeight: '100vh' }}>
      <TickerBar />
      <QuietNav page="terminal" />
      <TerminalBar />

      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '24px 16px 60px' }}>
        <PositionOverview />
        <KoreanArbTape />
        <OrderTicket />
        <VaultStatus />
        <EventLog />
        <HoldingsLedger />
        <RedemptionPanel />
        <AccountStrip />
      </div>

      <TerminalFooter />
    </div>
  );
}
