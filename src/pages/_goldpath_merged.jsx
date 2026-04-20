// Auto-extracted GoldPath helper components from old /goldpath page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CagrToggle, { DEFAULT_CAGR } from '../components/CagrToggle';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T_NS as T } from '../lib/tokens';
import { fmtManEok } from '../lib/constants';

const TIERS = [
  { num:'I',   nameKR:'브론즈',   nameEN:'Bronze · the opening',     monthly:'20만원+',    min:200000,   gift:50000,    featured:false,
    perks:['Founding Year 가격 12개월','스테인리스 마크 발급','Founders Club 자동 등록'] },
  { num:'II',  nameKR:'실버',     nameEN:'Silver · the accelerator', monthly:'50만원+',    min:500000,   gift:150000,   featured:false,
    perks:['Founding 500 가격 24개월','시리얼 번호 #001–500','Vault Weekend 초대'] },
  { num:'III', nameKR:'골드',     nameEN:'Gold · the prestige',      monthly:'100만원+',   min:1000000,  gift:400000,   featured:true,
    perks:['Founder 우선가 12개월','골드 마크 예약','Concierge 전화 연결'] },
  { num:'IV',  nameKR:'플래티넘', nameEN:'Platinum · the patron',    monthly:'200만원+',   min:2000000,  gift:1500000,  featured:false,
    perks:['Patron 최우선가 평생','10K 솔리드 골드 마크','SG Vault 단독 방문'] },
  { num:'V',   nameKR:'소브린',   nameEN:'Sovereign · the apex',     monthly:'500만원+',   min:5000000,  gift:5000000,  featured:false,
    perks:['Founder Apex 가격 평생 — 최저','전용 금고 배정','패밀리 오피스 서비스'] },
];;

const GMV_BONUSES = [
  { gate:'I',  gmvKR:'₩7.2M',  bonus:'+₩50K',    descKR:'첫 게이트 축하 크레딧' },
  { gate:'II', gmvKR:'₩21.6M', bonus:'+₩150K',   descKR:'성장 가속 크레딧' },
  { gate:'III',gmvKR:'₩50.4M', bonus:'+₩400K',   descKR:'정점 달성 크레딧', apex:true },
  { gate:'IV', gmvKR:'₩93.6M', bonus:'+₩1.0M',   descKR:'볼트 순례 크레딧' },
  { gate:'V',  gmvKR:'₩144M',  bonus:'+₩2.5M',   descKR:'평생 표식 크레딧' },
];;

const AURUM_UP = 0.02;

const KR_MULT  = 1.20;

const fmtKRW = fmtManEok;

function GoldPathCoin({ size = 320 }) {
  const h = Math.round(size * 64 / 220);
  return (
    <svg viewBox="0 0 220 64" width={size} height={h} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`gpcoin-face-${size}`} cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#F2D4A0" />
          <stop offset="28%" stopColor="#E3C187" />
          <stop offset="62%" stopColor="#C5A572" />
          <stop offset="88%" stopColor="#8a7448" />
          <stop offset="100%" stopColor="#4a3a20" />
        </radialGradient>
        <radialGradient id={`gpcoin-rim-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="transparent" />
          <stop offset="92%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
        <linearGradient id={`gpcoin-text-${size}`} x1="0" x2="1">
          <stop offset="0%" stopColor="#E3C187" />
          <stop offset="60%" stopColor="#C5A572" />
          <stop offset="100%" stopColor="#a08050" />
        </linearGradient>
      </defs>
      <ellipse cx="18" cy="34" rx="15" ry="3" fill="#000" opacity="0.3" />
      <circle cx="18" cy="22" r="15" fill={`url(#gpcoin-face-${size})`} />
      <circle cx="18" cy="22" r="15" fill={`url(#gpcoin-rim-${size})`} />
      <circle cx="18" cy="22" r="11" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.5" />
      <circle cx="18" cy="22" r="12.3" fill="none" stroke="rgba(255,228,180,0.22)" strokeWidth="0.3" />
      <text x="18" y="25" textAnchor="middle" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic" fontWeight="500" fontSize="10" fill="rgba(40,26,12,0.82)" letterSpacing="-0.02em">Au</text>
      <text x="18" y="32" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="2.2" letterSpacing="0.2em" fill="rgba(40,26,12,0.5)" fontWeight="700">999.9</text>
      <text x="42" y="26" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic" fontWeight="400" fontSize="22" letterSpacing="0.01em" fill={`url(#gpcoin-text-${size})`}>GoldPath</text>
      <text x="44" y="44" fontFamily="'JetBrains Mono',monospace" fontSize="8" letterSpacing="0.24em" fill="#7a6d58" opacity="0.9" fontWeight="500">금환 · 1g / MONTH</text>
      <line x1="44" y1="30" x2="190" y2="30" stroke="rgba(255,61,138,0.2)" strokeWidth="0.5" />
      <text x="196" y="14" fontFamily="'JetBrains Mono',monospace" fontSize="5" letterSpacing="0.2em" fill="#8a7d6b" opacity="0.7">SGP</text>
    </svg>
  );
}

function HeroCalc() {
  const [monthly, setMonthly] = useState(500_000);
  const [years, setYears] = useState(10);
  const [cagr, setCagr] = useState(DEFAULT_CAGR);

  const SPOT_USD_OZ = 4842.10;
  const KRW_USD = 1440.20;
  const OZ_TO_G = 31.1035;
  const spotKrwG = SPOT_USD_OZ * KRW_USD / OZ_TO_G;
  const aurumUnit = spotKrwG * 1.08;

  const months = years * 12;
  const gramsPerMonth = monthly / aurumUnit;
  const totalGrams = gramsPerMonth * months;

  // Compute CAGR-projected KRW end value (monthly compounding)
  const monthlyRate = Math.pow(1 + cagr, 1/12) - 1;
  let endValue = 0;
  for (let m = 0; m < months; m++) {
    const remaining = months - m;
    endValue += monthly * Math.pow(1 + monthlyRate, remaining);
  }
  const totalIn = monthly * months;
  const gainPct = totalIn > 0 ? ((endValue / totalIn) - 1) * 100 : 0;

  return (
    <div style={{
      background: T.card || T.bg1 || '#0d0b08',
      border: `1px solid ${T.goldBorder}`,
      padding: 22,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
          GoldPath Calculator
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em' }}>● LIVE</span>
      </div>

      {/* Monthly */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>월 적립 · MONTHLY</span>
          <span style={{ fontFamily: T.mono, fontSize: 15, color: T.text, fontWeight: 700 }}>
            ₩{(monthly / 10000).toLocaleString()}만
          </span>
        </div>
        <input type="range" min="200000" max="5000000" step="100000" value={monthly}
          onChange={e => setMonthly(+e.target.value)}
          style={{ width: '100%', '--pct': `${((monthly - 200000) / (5000000 - 200000)) * 100}%` }} />
      </div>

      {/* Horizon */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em' }}>기간 · HORIZON</span>
          <span style={{ fontFamily: T.mono, fontSize: 15, color: T.text, fontWeight: 700 }}>{years}년</span>
        </div>
        <input type="range" min="1" max="25" step="1" value={years}
          onChange={e => setYears(+e.target.value)}
          style={{ width: '100%', '--pct': `${((years - 1) / (25 - 1)) * 100}%` }} />
      </div>

      {/* CAGR toggle */}
      <div style={{ marginBottom: 16 }}>
        <CagrToggle value={cagr} onChange={setCagr} compact />
      </div>

      {/* Result tile */}
      <div style={{ padding: '14px 14px', background: T.goldGlow || 'rgba(255,61,138,0.08)', border: `1px solid ${T.goldBorder}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em', marginBottom: 4 }}>총 그램 · Total</div>
          <div style={{ fontFamily: T.mono, fontSize: 19, color: T.gold, fontWeight: 700, lineHeight: 1 }}>
            {totalGrams.toFixed(1)}
            <span style={{ fontSize: 11, color: T.goldD, marginLeft: 3 }}>g</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em', marginBottom: 4 }}>예상 가치 · @ {(cagr * 100).toFixed(0)}%</div>
          <div style={{ fontFamily: T.mono, fontSize: 19, color: T.gold, fontWeight: 700, lineHeight: 1 }}>
            ₩{Math.round(endValue / 10_000).toLocaleString()}만
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.green || '#4ade80', marginTop: 3 }}>
            +{gainPct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function TierCards({ activeTier, setActiveTier }) {
  return (
    <section style={{ padding: '80px 24px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 12, textTransform: 'uppercase' }}>§ II · 5 Tiers</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, color: T.text, margin: '0 0 10px', lineHeight: 1.2 }}>
            월 얼마로 시작하시겠습니까? <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>더 크게 시작할수록 더 큰 기프트.</span>
          </h2>
          <p style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, maxWidth: 540, margin: '0 auto', lineHeight: 1.85 }}>
            티어를 선택하시면 아래 계산기에 자동 반영됩니다.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="gp-tiers">
          {TIERS.map((tier, i) => {
            const isActive = activeTier === i;
            return (
              <div key={i} onClick={() => setActiveTier(i)} style={{
                background: tier.featured ? `linear-gradient(180deg, ${T.goldGlow}, ${T.bg})` : T.bg,
                border: `1px solid ${isActive ? T.goldBorderS : tier.featured ? T.goldBorder : T.border}`,
                padding: '24px 16px',
                textAlign: 'center',
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer',
                transform: isActive ? 'translateY(-4px)' : 'none',
                boxShadow: isActive ? `0 10px 32px rgba(255,61,138,0.14)` : 'none',
                transition: 'all 0.3s cubic-bezier(0.2,0.8,0.2,1)',
              }}
              className={tier.featured ? 'gp-tier-featured' : ''}
              >
                {tier.featured && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />}
                {tier.featured && <div style={{ position: 'absolute', top: 8, right: 8, fontFamily: T.mono, fontSize: 9, color: T.bg, background: T.gold, padding: '2px 7px', letterSpacing: '0.18em' }}>추천</div>}
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD, marginBottom: 4 }}>{tier.num}</div>
                <div style={{ fontFamily: T.serifKr, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 3 }}>{tier.nameKR}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginBottom: 16 }}>{tier.nameEN.split(' · ')[0]}</div>
                <div style={{ height: 1, background: T.goldBorder, margin: '0 0 16px' }} />
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', color: T.muted, marginBottom: 4, textTransform: 'uppercase' }}>월 납입액</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? T.goldB : T.sub, fontWeight: 600, marginBottom: 14 }}>{tier.monthly}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.16em', color: T.muted, marginBottom: 4, textTransform: 'uppercase' }}>창립 기프트</div>
                <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: isActive ? T.goldB : T.gold, marginBottom: 14, letterSpacing: '-0.01em' }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, marginRight: 2 }}>₩</span>
                  {tier.gift.toLocaleString('ko-KR')}
                </div>
                <div style={{ paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                  {tier.perks.map((perk, pi) => (
                    <div key={pi} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '3px 0', textAlign: 'left' }}>
                      <span style={{ color: T.gold, fontFamily: T.mono, fontSize: 11, flexShrink: 0, marginTop: 1 }}>—</span>
                      <span style={{ fontFamily: T.sansKr, fontSize: 11, color: T.sub, lineHeight: 1.45 }}>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .gp-tiers { grid-template-columns: repeat(2, 1fr) !important; }
          .gp-tier-featured { grid-column: 1 / -1 !important; }
        }
        @media (max-width: 480px) {
          .gp-tiers { grid-template-columns: 1fr !important; }
          .gp-tier-featured { grid-column: auto !important; }
        }
      `}</style>
    </section>
  );
}

function CalcAndRewards({ activeTier, setActiveTier }) {
  const [monthly, setMonthly] = useState(TIERS[activeTier].min);
  const navigate = useNavigate();
  // Canonical spot prices — single source of truth across site
  const SPOT_USD_OZ = 4842.10;
  const KRW_USD = 1440.20;
  const OZ_TO_G = 31.1035;
  const spotKrwG = SPOT_USD_OZ * KRW_USD / OZ_TO_G;
  const aurumUnit = spotKrwG * (1 + AURUM_UP);
  const grams = monthly / aurumUnit;
  const krRetail = grams * spotKrwG * KR_MULT;

  // Compute current tier from monthly
  const currentTierIdx = TIERS.slice().reverse().findIndex(t => monthly >= t.min);
  const currentTier = currentTierIdx >= 0 ? TIERS[TIERS.length - 1 - currentTierIdx] : TIERS[0];
  const currentTierIdxForward = TIERS.indexOf(currentTier);

  // Sync back to tier cards — must use useEffect, NEVER setState during render
  useEffect(() => {
    if (currentTierIdxForward !== activeTier) setActiveTier(currentTierIdxForward);
  }, [currentTierIdxForward, activeTier, setActiveTier]);

  return (
    <section id="gp-calc" style={{ padding: '80px 24px', background: T.bg1 || '#0d0b08', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 12, textTransform: 'uppercase' }}>§ III · Calculator + Growth Rewards</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, color: T.text, margin: 0, lineHeight: 1.2 }}>
            슬라이더를 움직여 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>얼마의 금을 받게 되는지</span> 확인하세요.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'stretch' }} className="gp-calc-grid">

          {/* LEFT: Calculator */}
          <div style={{ background: T.card || T.bg, border: `1px solid ${T.goldBorder}`, padding: '28px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.goldD, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 22 }}>GoldPath Calculator</div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>월 적립액</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.text }}>{fmtKRW(monthly)}</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.sub }}>/ 월</span>
                <span style={{ marginLeft: 'auto', fontFamily: T.sansKr, fontSize: 11, color: T.goldD, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: '3px 10px', whiteSpace: 'nowrap' }}>{currentTier.nameKR} 티어</span>
              </div>
              <input type="range" min="200000" max="5000000" step="100000" value={monthly} onChange={e => setMonthly(+e.target.value)}
                style={{ width: '100%', '--pct': `${((monthly - 200000) / (5000000 - 200000)) * 100}%` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.1em' }}>
                <span>₩200K</span><span>₩1M</span><span>₩2M</span><span>₩3M</span><span>₩5M</span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${T.goldBorder}`, paddingTop: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {[
                { kr: '받게 되실 금', en: 'Metal received', value: `${grams.toFixed(3)} g`, unit: `· ${(grams / OZ_TO_G).toFixed(4)} oz` },
                { kr: '한국 소매 환산', en: 'Korea retail equiv.', value: fmtKRW(krRetail), dim: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderBottom: '1px solid rgba(255,61,138,0.06)' }}>
                  <div>
                    <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub }}>{row.kr}</span>
                    <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.muted, marginLeft: 6 }}>{row.en}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: T.mono, fontSize: row.dim ? 14 : 17, color: row.dim ? T.sub : T.text, fontWeight: 500 }}>{row.value}</span>
                    {row.unit && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, marginLeft: 4 }}>{row.unit}</span>}
                  </div>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${T.goldBorderS || T.goldBorder}`, marginTop: 10, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.gold, fontWeight: 500 }}>+ {currentTier.nameKR} 창립 기프트</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.goldD, marginTop: 2 }}>첫 결제 즉시 실물 금 적립</div>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 22, color: T.goldB, fontWeight: 700 }}>{fmtKRW(currentTier.gift)}</div>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em', color: T.muted, textTransform: 'uppercase' }}>
              <span>SPOT · LONDON FIX</span>
              <span style={{ color: T.gold }}>● LIVE · MMXXVI</span>
            </div>
          </div>

          {/* RIGHT: Growth Rewards */}
          <div style={{ background: T.card || T.bg, border: `1px solid ${T.goldBorder}`, padding: '28px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${T.gold},transparent)` }} />
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.goldD, letterSpacing: '0.26em', textTransform: 'uppercase', marginBottom: 8 }}>GoldPath Growth Rewards</div>
            <p style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.9, margin: '0 0 20px' }}>
              창립 기프트에 더해, GoldPath 누적액이 성장할수록 <strong style={{ color: T.text }}>추가 금 크레딧</strong>이 지급됩니다. 내 구매 + 추천인 누적 모두 반영.
            </p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 17, top: 8, bottom: 8, width: 1, background: `linear-gradient(180deg,${T.gold},${T.goldBorder})`, zIndex: 0 }} />
              {GMV_BONUSES.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < GMV_BONUSES.length - 1 ? '1px solid rgba(255,61,138,0.06)' : 'none', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 10, height: 10, background: row.apex ? T.gold : T.bg, border: `1px solid ${T.gold}`, transform: 'rotate(45deg)', boxShadow: row.apex ? `0 0 10px ${T.gold}` : 'none' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, border: `1px solid ${T.goldBorder}`, padding: '2px 6px', letterSpacing: '0.14em' }}>GATE {row.gate}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 13, color: T.text, fontWeight: 600 }}>{row.gmvKR}</span>
                    </div>
                    <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.4 }}>{row.descKR}</div>
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 14, color: T.green, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.bonus}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
              <button onClick={() => navigate('/signup')} style={{
                width: '100%',
                background: T.goldGlow,
                border: `1px solid ${T.goldBorder}`,
                color: T.gold,
                padding: '12px', cursor: 'pointer',
                fontFamily: T.sansKr, fontSize: 13, letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.goldBorderS || T.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.goldBorder}
              >
                GoldPath 가입하기 →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .gp-calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function SealDivider() {
  return (
    <div style={{ padding: '28px 24px', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ flex: 1, maxWidth: 200, height: 1, background: `linear-gradient(90deg,transparent,${T.goldBorder})` }} />
      <div style={{
        width: 54, height: 54,
        background: 'rgba(255,61,138,0.08)',
        border: `1px solid ${T.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 16px rgba(255,61,138,0.15)`,
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 17, color: T.gold, letterSpacing: '0.04em' }}>Au</span>
      </div>
      <div style={{ flex: 1, maxWidth: 200, height: 1, background: `linear-gradient(-90deg,transparent,${T.goldBorder})` }} />
    </div>
  );
}

function Timeline() {
  const steps = [
    { when: 'Diem Zero · 오늘',    title: '사전예약',              desc: '이메일로 자리 확보. 론치 시 자동 안내.', active: true },
    { when: 'Diem I–III',          title: '본인확인 · 자동이체 설정', desc: '10분 온라인 KYC. 주거래은행 자동이체 등록.' },
    { when: 'Diem VII–XIV',        title: '첫 자동이체',           desc: '설정한 날짜에 첫 결제 정산.' },
    { when: 'Eadem Die · 같은 날', title: '창립 기프트 적립',        desc: '결제 즉시 선택 티어 기프트가 실물 금으로 계정에.' },
    { when: 'Diem XLIV',           title: '자유로운 운용',          desc: '30일 유지 후 기프트 그램은 평생 회원님 자산.' },
  ];
  return (
    <section style={{ padding: '80px 24px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 12, textTransform: 'uppercase' }}>§ IV · Timeline</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, color: T.text, margin: '0 0 10px', lineHeight: 1.2 }}>
            예약부터 적립까지, <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>十四日</span>
          </h2>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD }}>From reservation to your first measure of gold.</div>
        </div>
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 20, top: 14, bottom: 14, width: 1, background: `linear-gradient(180deg,${T.gold},${T.goldBorder})` }} />
          {steps.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', alignItems: 'start', padding: '18px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 12, height: 12, background: row.active ? T.gold : T.bg, border: `1px solid ${T.gold}`, transform: 'rotate(45deg)', boxShadow: row.active ? `0 0 12px ${T.gold}` : 'none', marginTop: 4 }} />
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.goldD, marginBottom: 4 }}>{row.when}</div>
                <div style={{ fontFamily: T.serifKr, fontSize: 16, fontWeight: 500, color: T.text, marginBottom: 4 }}>{row.title}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.85 }}>{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reserve() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => navigate('/signup'), 900);
  };

  return (
    <section style={{ padding: '80px 24px', background: T.bg1 || '#0d0b08', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 12, textTransform: 'uppercase' }}>§ V · Reserve</div>
        <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, color: T.text, margin: '0 0 12px', lineHeight: 1.25 }}>
          지금 이메일을 남기면<br /><span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>론치 첫날 기프트가 자동 적용</span>됩니다.
        </h2>
        <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD, marginBottom: 28 }}>Founding Year · 첫 결제일 기준 우선 적용.</p>

        {submitted ? (
          <div style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: '22px 24px' }}>
            <div style={{ fontFamily: T.serifKr, fontSize: 18, color: T.gold, fontWeight: 600, marginBottom: 6 }}>✓ 예약 완료</div>
            <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.8 }}>가입 페이지로 이동합니다…</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소 · your@email.com" required
              style={{
                flex: '1 1 260px', maxWidth: 360,
                padding: '14px 16px',
                background: T.bg, border: `1px solid ${T.goldBorder}`,
                outline: 'none',
                fontFamily: T.sansKr, fontSize: 14, color: T.text,
              }} />
            <button type="submit" style={{
              background: T.gold, color: T.bg, border: 'none',
              cursor: 'pointer', padding: '14px 22px',
              fontFamily: T.sans, fontSize: 13, fontWeight: 700,
              letterSpacing: '0.08em',
            }}>
              사전예약 →
            </button>
          </form>
        )}

        <div style={{ marginTop: 28, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em', color: T.muted, textTransform: 'uppercase' }}>
          {['창립 한정', 'KakaoTalk 알림', '스팸 없음'].map((x, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: T.gold }}>·</span>{x}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ padding: '80px 24px', textAlign: 'center', background: `radial-gradient(ellipse at 50% 30%, rgba(255,61,138,0.10), transparent 60%), ${T.bg}` }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 500, color: T.text, margin: '0 0 18px', lineHeight: 1.2 }}>
          한 달에 한 그램. <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>오늘 시작하세요.</span>
        </h2>
        <p style={{ fontFamily: T.serifKr, fontSize: 15, color: T.sub, lineHeight: 1.8, fontWeight: 300, maxWidth: 560, margin: '0 auto 32px' }}>
          10분 온라인 가입. 주거래 은행 자동이체. 첫 결제일부터 실물 금.
        </p>
        <PrimaryCTA palette="neo" to="/signup">GoldPath 가입하기 →</PrimaryCTA>
      </div>
    </section>
  );
}

function Disclosure() {
  return (
    <div style={{ background: T.bg1 || '#0d0b08', padding: '28px 24px', borderTop: `1px solid ${T.goldBorder}` }}>
      <p style={{ fontFamily: T.sansKr, fontSize: 11, color: T.muted, lineHeight: 1.85, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        ※ GoldPath 창립 시즌은 Aurum Korea Pte Ltd. (싱가포르, MAS PSPM 2019)의 한국 시장 출시 단계에서 운영되는 한정 프로그램입니다. 최종 약관 및 적용 조건은 출시 시점의 공식 문서를 따릅니다. 투자에는 원금 손실 가능성이 있습니다. 한국 외국환거래법 및 개인정보보호법(PIPA) 준수.
      </p>
    </div>
  );
}

export { TIERS, GMV_BONUSES, AURUM_UP, KR_MULT, fmtKRW, GoldPathCoin, HeroCalc, TierCards, CalcAndRewards, SealDivider, Timeline, Reserve, FinalCTA, Disclosure };
