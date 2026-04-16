import { useState, useRef, useEffect } from 'react';
import { T, useIsMobile, API } from '../lib/index.jsx';
import { Accordion } from '../components/UI.jsx';

// Pricing constants (internal — not exposed to user)
const SPOT_USD_PER_OZ = 3342.80;
const FX = 1368.00;
const SPOT_KRW_PER_OZ = SPOT_USD_PER_OZ * FX;
const SPOT_KRW_PER_GRAM = SPOT_KRW_PER_OZ / 31.1035;
const _A = 0.02;   // Aurum effective markup
const _K = 1.184;  // Korean retail multiplier vs international

function fKRWShort(n) {
  if (n >= 10000) return '₩' + (n / 10000).toFixed(0) + '만';
  return '₩' + Math.round(n).toLocaleString('ko-KR');
}
function fKRWFull(n) { return '₩' + Math.round(n).toLocaleString('ko-KR'); }

/* ─── Ingot Visual ─────────────────────────────────────────────────────── */
function Ingot() {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: 'relative', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Main ingot */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          position: 'relative',
          width: 340, height: 210,
          background: 'linear-gradient(135deg, #2a2418 0%, #4a3e26 38%, #C5A572 50%, #E3C187 55%, #C5A572 62%, #6a5a3a 80%, #2a2418 100%)',
          borderRadius: 4,
          boxShadow: '0 32px 80px rgba(197,165,114,0.20), 0 0 0 1px rgba(197,165,114,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#1a1814',
          transform: hov
            ? 'perspective(900px) rotateX(4deg) rotateY(-2deg) translateY(-6px)'
            : 'perspective(900px) rotateX(8deg) rotateY(-5deg)',
          transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
          cursor: 'default',
        }}>
        <div style={{ fontFamily: T.serif, fontSize: 11, fontWeight: 600, letterSpacing: '0.45em', color: 'rgba(26,24,20,0.9)', marginBottom: 10 }}>A U R U M</div>
        <div style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: 'rgba(26,24,20,0.95)', letterSpacing: '0.02em' }}>1 oz</div>
        <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 500, color: 'rgba(26,24,20,0.7)', letterSpacing: '0.22em', marginTop: 8 }}>999.9 FINE GOLD</div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: 'rgba(26,24,20,0.55)', letterSpacing: '0.1em', marginTop: 14 }}>SG · MMXXVI</div>
      </div>

      {/* Floating gift chip */}
      <div style={{
        position: 'absolute', top: 38, right: 0,
        background: T.bgElevated,
        border: `1px solid ${T.gold}`,
        padding: '16px 22px',
        boxShadow: '0 22px 50px rgba(0,0,0,0.7), 0 0 30px rgba(197,165,114,0.12)',
        transform: 'rotate(-2.5deg)',
        animation: 'floatY 4.5s ease-in-out infinite',
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, fontWeight: 500, letterSpacing: '0.32em', color: T.goldDim, textTransform: 'uppercase' }}>FOUNDING GIFT</div>
        <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 600, color: T.gold, marginTop: 3, letterSpacing: '-0.005em' }}>
          <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 500, marginRight: 4, color: T.goldDim }}>₩</span>50,000
        </div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, color: T.textMuted, marginTop: 4 }}>in physical metal</div>
      </div>
    </div>
  );
}

/* ─── Calculator ───────────────────────────────────────────────────────── */
function FoundingCalculator() {
  const [monthly, setMonthly] = useState(500000);

  const aurumUnit = SPOT_KRW_PER_GRAM * (1 + _A);
  const grams     = monthly / aurumUnit;
  const oz        = grams / 31.1035;
  const krUnit    = SPOT_KRW_PER_GRAM * _K;
  const krCost    = grams * krUnit;

  const pct = ((monthly - 200000) / (3000000 - 200000) * 100).toFixed(1);
  const fmt = n => Math.round(n).toLocaleString('ko-KR');

  return (
    <div style={{
      background: `linear-gradient(180deg, ${T.bgElevated} 0%, ${T.bg3} 100%)`,
      border: `1px solid ${T.goldBorder}`,
      padding: 'clamp(32px,5vw,60px) clamp(24px,5vw,64px)',
      maxWidth: 880, margin: '0 auto',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Gold top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div style={{ position: 'absolute', top: 24, right: 28, fontFamily: T.serif, fontStyle: 'italic', fontSize: 11, letterSpacing: '0.3em', color: T.goldDim, opacity: 0.5, textTransform: 'uppercase' }}>— FOUNDING ESTIMATOR —</div>

      <div style={{ marginBottom: 48 }}>
        <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: T.goldDim, display: 'block', marginBottom: 22 }}>월 적립액 · MONTHLY CONTRIBUTION</label>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 26 }}>
          <span style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 700, color: T.text }}>{monthly.toLocaleString('ko-KR')}</span>
          <span style={{ fontFamily: T.mono, fontSize: 16, color: T.goldDim }}>KRW</span>
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.textSub, marginLeft: 'auto' }}>— per month</span>
        </div>
        <input type="range" min="200000" max="3000000" step="50000" value={monthly}
          style={{ '--pct': pct + '%' }}
          onChange={e => setMonthly(+e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: T.mono, fontSize: 9, color: T.textMuted, letterSpacing: '0.14em' }}>
          <span>₩200K</span><span>₩1M</span><span>₩2M</span><span>₩3M</span>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.goldBorder}`, paddingTop: 36 }}>
        {[
          { label: '받게 되실 금', en: 'Metal received', value: `${grams.toFixed(3)} g`, unit: `· ${oz.toFixed(4)} oz` },
          { label: '한국 소매 환산', en: 'Korea retail equivalent', value: fKRWFull(krCost), unit: '', dim: true },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 0', borderBottom: `1px solid rgba(197,165,114,0.06)` }}>
            <div>
              <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.textSub, fontWeight: 300 }}>{row.label}</span>
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.textMuted, marginLeft: 8 }}>{row.en}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: T.mono, fontSize: 18, color: row.dim ? T.textSub : T.text, fontWeight: 500 }}>{row.value}</span>
              {row.unit && <span style={{ fontFamily: T.mono, fontSize: 11, color: T.goldDim, marginLeft: 6 }}>{row.unit}</span>}
            </div>
          </div>
        ))}

        {/* Gift row */}
        <div style={{ borderTop: `1px solid ${T.goldBorderStrong}`, marginTop: 14, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.gold, fontWeight: 500 }}>+ Founding Gift</div>
          <div style={{ fontFamily: T.mono, fontSize: 26, color: T.gold, fontWeight: 700 }}>₩50,000</div>
        </div>
      </div>

      <div style={{ marginTop: 40, paddingTop: 22, borderTop: `1px solid ${T.goldBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: T.mono, fontSize: 9, letterSpacing: '0.22em', color: T.textMuted, textTransform: 'uppercase' }}>
        <span>SPOT REF · LONDON FIX</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.gold }}>
          <span className="live-dot" />LIVE · MMXXVI
        </span>
      </div>
    </div>
  );
}

/* ─── Wax Seal Divider ─────────────────────────────────────────────────── */
function WaxSealDivider() {
  return (
    <div className="seal-divider">
      <div className="seal-divider-line" />
      <div className="wax-seal" />
      <div className="seal-divider-line" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOUNDING GIFT PAGE — main export
   ═══════════════════════════════════════════════════════════════════════ */
export default function FoundingGiftPage({ lang, navigate, user, setShowLogin }) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pad = isMobile ? '60px 20px' : '120px 80px';

  const handleReserve = async e => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await API.campaign.signupBonus(email);
      setSubmitted(true);
    } finally { setSubmitting(false); }
  };

  const tiers = [
    { roman: 'I', tag: 'OPEN', name: 'Founding Year', nameEn: '— the open door', gift: '50,000', featured: false, desc: '월 ₩200,000원 이상으로 시작 시. Founding 시즌 회원 전원 자동 적용.', it: '— Founding pricing for twelve months. Stainless mark issued.' },
    { roman: 'II', tag: 'CAPPED', name: 'Founding 500', nameEn: '— the numbered cohort', gift: '200,000', featured: true, desc: '월 ₩500,000원 이상 또는 일시불 $5,000+로 시작 시. 선착순 500명 한정.', it: '— Founders\' rate, twenty-four months. Serialized #001–500. Vault Weekend access.' },
    { roman: 'III', tag: 'UNLOCK', name: 'Aurum Patron', nameEn: '— the apex, earned', gift: '500,000', featured: false, desc: '5명 이상 추천 또는 $250K+ 보유 12개월 충족 시 자동 승급.', it: '— Apex pricing. 10K solid gold mark. Concierge line opened.' },
  ];

  const timeline = [
    { when: 'Diem Zero · 오늘',       title: '사전예약',             desc: '이메일로 자리 확보. 출시 시 자동으로 안내드립니다.', active: true },
    { when: 'Diem I—III',              title: '본인확인 · 자동이체 설정', desc: '10분 온라인 KYC. 주거래은행 자동이체 등록.' },
    { when: 'Diem VII—XIV',            title: '첫 자동이체',           desc: '설정한 날짜에 첫 결제 정산. 그날의 국제 시세로 그램 매입.' },
    { when: 'Eadem Die · 같은 날',     title: 'Founding Gift 적립',   desc: '결제 정산 즉시 Gift가 함께 적립됩니다.' },
    { when: 'Diem XLIV',               title: '자유로운 운용',         desc: '30일 유지 충족 후, Gift 그램은 평생 회원님의 자산.' },
  ];

  const faqItems = [
    { icon: '💰', title: 'Founding Gift는 현금인가요, 금인가요?', content: '금입니다. 적립 시점의 국제 시세 기준 ₩50,000원 가치의 그램이 회원님 계정에 함께 적립됩니다. Aurum이 보관하는 모든 자산은 100% 실물 금·은이며, Gift 그램도 동일하게 싱가포르 보관소에 할당 보관됩니다.' },
    { icon: '🔒', title: 'Gift를 받고 곧바로 해지하면 어떻게 되나요?', content: 'Founding Gift는 첫 결제일 기준 30일간 잠금 상태입니다. 이 기간 내 해지 시 Gift 그램은 자동 회수되며, 원금(첫 결제분)은 그대로 환급됩니다. 30일 이후에는 평생 회원님의 자산입니다.' },
    { icon: '❓', title: '월 ₩200,000원이 부담되면 더 적게 시작할 수 있나요?', content: '현재 Founding Gift 자격은 월 ₩200,000원부터입니다. 더 적은 금액의 일회성 매수도 가능하나, 이 경우 Founding 티어와 Gift 적용 대상이 아닙니다. Founding 시즌 종료 후의 가입 조건은 변경될 수 있습니다.' },
    { icon: '📅', title: 'Founding 시즌은 언제 종료되나요?', content: 'Founding Year 티어는 출시일로부터 6개월간 운영되며, 이 기간이 지나면 닫힙니다. Founding 500 티어는 500명 정원이 채워지는 시점에 종료됩니다 — 6개월 이내에 마감될 가능성이 있습니다.' },
  ];

  return (
    <div style={{ background: T.bg }}>

      {/* ── Hero ── */}
      <div style={{
        padding: isMobile ? '80px 20px 80px' : '140px 80px 130px',
        background: `radial-gradient(ellipse at 75% 30%, rgba(197,165,114,0.10), transparent 55%), linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)`,
        borderBottom: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden',
      }}>
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.serif, fontSize: isMobile ? 140 : 320, fontWeight: 600, letterSpacing: '0.06em', color: 'rgba(197,165,114,0.018)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', zIndex: 0 }}>AURUM</div>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 1fr', gap: isMobile ? 60 : 90, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div className="eyebrow">By Reservation · Founding Season</div>
            <h1 style={{ fontFamily: T.serifKr, fontWeight: 500, fontSize: isMobile ? 40 : 60, lineHeight: 1.18, color: T.text, margin: '0 0 28px', letterSpacing: '-0.005em' }}>
              당신의 시작에<br />한 줌의 <span style={{ color: T.gold, fontFamily: T.serif, fontStyle: 'italic', fontWeight: 500 }}>금</span>을<br />더해 드립니다.
            </h1>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, fontSize: 22, color: T.goldDim, marginBottom: 44, letterSpacing: '0.005em' }}>A founding gesture. In physical form.</div>
            <p style={{ fontFamily: T.sansKr, fontSize: 16, color: T.textSub, lineHeight: 1.85, maxWidth: 510 }}>
              첫 자동이체가 결제되는 날, 정해진 무게의 금이 회원님 계정에 함께 적립됩니다. 추가 결제도, 카드 등록도, 조건도 없습니다. 시작에 대한 한 번의 환대.
            </p>
          </div>
          {!isMobile && <Ingot />}
        </div>
      </div>

      {/* ── Wax seal divider ── */}
      <WaxSealDivider />

      {/* ── How it works (3-step) ── */}
      <div style={{ padding: isMobile ? '40px 20px 80px' : '40px 80px 100px', background: T.bg2 }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 60px 1fr 60px 1fr', gap: 0, alignItems: 'start' }}>
          {[
            { roman: 'I',   title: '예약',    en: 'Reserve', desc: 'Founding 시즌 동안 사전예약하시고, 출시 시 첫 결제 일정을 설정합니다.' },
            null,
            { roman: 'II',  title: '첫 결제', en: 'Settle',  desc: '설정 후 약 14일 이내, 토스·카카오·은행 자동이체로 첫 적립이 완료됩니다.' },
            null,
            { roman: 'III', title: '적립',    en: 'Receive', desc: '결제 정산 즉시 Founding Gift가 회원님 계정에 함께 적립됩니다.' },
          ].map((s, i) => s === null ? (
            <div key={i} style={{ textAlign: 'center', color: T.gold, fontFamily: T.serif, fontSize: 28, opacity: 0.4, fontStyle: 'italic', paddingTop: 18, transform: isMobile ? 'rotate(90deg)' : 'none' }}>—</div>
          ) : (
            <div key={i} style={{ textAlign: 'center', padding: '0 16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, border: `1px solid ${T.goldBorderStrong}`, borderRadius: '50%', marginBottom: 24, fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, color: T.gold, fontWeight: 500, background: T.bg }}>
                {s.roman}
              </div>
              <div style={{ fontFamily: T.serifKr, fontSize: 17, fontWeight: 500, color: T.text, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldDim, marginBottom: 14, letterSpacing: '0.02em' }}>{s.en}</div>
              <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.textSub, lineHeight: 1.7, maxWidth: 220, margin: '0 auto' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Calculator ── */}
      <div style={{ padding: pad }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 18, letterSpacing: '-0.005em', lineHeight: 1.2 }}>당신의 첫 달, <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>계산해 보세요</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>See exactly what you receive on Day One.</div>
          </div>
          <FoundingCalculator />
        </div>
      </div>

      {/* ── Wax seal divider ── */}
      <WaxSealDivider />

      {/* ── Three tiers ── */}
      <div style={{ background: T.bg2, borderTop: `1px solid ${T.goldBorder}`, borderBottom: `1px solid ${T.goldBorder}`, padding: pad }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 18, lineHeight: 1.2 }}>세 가지 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>사전예약 티어</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>Three doors. Each opens differently.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 24 }}>
            {tiers.map((tier, i) => (
              <div key={i} className="tier-card" style={tier.featured ? { borderColor: T.gold, background: `linear-gradient(180deg, ${T.goldGlow} 0%, ${T.bg} 100%)` } : {}}>
                <div style={{ position: 'absolute', top: 18, right: 18, fontFamily: T.mono, fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', padding: '5px 10px', background: tier.featured ? T.gold : 'rgba(197,165,114,0.08)', color: tier.featured ? T.bg : T.goldDim, border: `1px solid ${tier.featured ? T.gold : T.goldBorder}` }}>{tier.tag}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.goldDim, marginBottom: 8 }}>{tier.roman}</div>
                <div style={{ fontFamily: T.serifKr, fontSize: 24, fontWeight: 600, color: T.text, marginBottom: 6 }}>{tier.name}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldDim, marginBottom: 28 }}>{tier.nameEn}</div>
                <div style={{ height: 1, background: T.goldBorder, marginBottom: 24 }} />
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: T.textMuted, marginBottom: 8 }}>FOUNDING GIFT</div>
                <div style={{ fontFamily: T.serif, fontSize: 38, fontWeight: 600, color: T.gold, letterSpacing: '-0.01em', marginBottom: 24 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 14, color: T.goldDim, marginRight: 4 }}>₩</span>{tier.gift}
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.textSub, lineHeight: 1.75, paddingTop: 20, borderTop: `1px solid ${T.goldBorder}` }}>
                  {tier.desc}
                  <span style={{ fontFamily: T.serif, fontStyle: 'italic', display: 'block', marginTop: 10, fontSize: 12, color: T.goldDim }}>{tier.it}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div style={{ padding: pad, background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bg2} 100%)` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 18, lineHeight: 1.2 }}>예약부터 적립까지, <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>十四日</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>From reservation to your first measure of gold.</div>
          </div>
          <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 32, top: 16, bottom: 16, width: 1, background: `linear-gradient(180deg, ${T.gold} 0%, ${T.goldBorder} 100%)` }} />
            {timeline.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'start', padding: '28px 0' }}>
                <div style={{ width: 14, height: 14, marginLeft: 25, marginTop: 8, position: 'relative', zIndex: 2, transform: 'rotate(45deg)', background: row.active ? T.gold : T.bg, border: `1px solid ${T.gold}`, boxShadow: row.active ? '0 0 14px rgba(197,165,114,0.6)' : 'none' }} />
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: T.goldDim, marginBottom: 6 }}>{row.when}</div>
                  <div style={{ fontFamily: T.serifKr, fontSize: 18, fontWeight: 500, color: T.text, marginBottom: 6 }}>{row.title}</div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.textSub, lineHeight: 1.7 }}>{row.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA / Email form ── */}
      <div style={{
        padding: isMobile ? '80px 20px' : '140px 80px 130px',
        background: `radial-gradient(ellipse at 50% 100%, rgba(197,165,114,0.18), transparent 60%), ${T.bg}`,
        textAlign: 'center', borderTop: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 70 : 130, letterSpacing: '0.18em', fontWeight: 400, color: 'rgba(197,165,114,0.025)', pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}>RESERVATIO</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.gold, letterSpacing: '0.32em', marginBottom: 28, textTransform: 'uppercase' }}>— By Reservation Only —</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 32 : 50, fontWeight: 600, color: T.text, marginBottom: 22, letterSpacing: '-0.01em', lineHeight: 1.18 }}>
            지금 자리를 확보하시면<br /><span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>출시 첫날 Gift가 자동 적용</span>됩니다.
          </h2>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 19, color: T.goldDim, marginBottom: 64 }}>Founding Season closes when the cohort fills.</div>

          {submitted ? (
            <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px', background: T.goldGlow, border: `1px solid ${T.goldBorderStrong}` }}>
              <div style={{ fontFamily: T.serif, fontSize: 22, color: T.gold, fontWeight: 600, marginBottom: 8 }}>✓ 예약 완료</div>
              <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>이메일이 등록되었습니다. 출시 시 가장 먼저 알려드립니다.</div>
            </div>
          ) : (
            <form onSubmit={handleReserve} style={{ maxWidth: 540, margin: '0 auto', display: 'flex', gap: 0, border: `1px solid ${T.goldBorderStrong}`, background: T.bg3 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="이메일 주소 · your@email.com" required
                style={{ flex: 1, padding: '22px 24px', background: 'transparent', border: 'none', outline: 'none', fontFamily: T.sansKr, fontSize: 15, color: T.text }} />
              <button type="submit" disabled={submitting} style={{ background: T.gold, color: T.bg, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', padding: '0 36px', fontFamily: T.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', transition: 'background 0.2s' }}>
                {submitting ? '...' : '사전예약'}
              </button>
            </form>
          )}

          <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', fontFamily: T.mono, fontSize: 9, letterSpacing: '0.24em', color: T.textMuted, textTransform: 'uppercase' }}>
            {['Founding Season · 사전예약 한정', '알림 · KakaoTalk', '스팸 없음'].map((t, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: T.gold }}>·</span>{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Wax seal divider ── */}
      <WaxSealDivider />

      {/* ── FAQ ── */}
      <div style={{ padding: pad }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 600, color: T.text, marginBottom: 18, lineHeight: 1.2 }}>자주 묻는 <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>질문</span></h2>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldDim }}>Quietly answered.</div>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>

      {/* ── T&C ── */}
      <div style={{ background: T.bg2, padding: '48px 80px', borderTop: `1px solid ${T.goldBorder}` }}>
        <p style={{ fontFamily: T.sansKr, fontSize: 11, color: T.textMuted, lineHeight: 1.85, maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          ※ Founding Season 안내자료입니다. 최종 약관 및 적용 조건은 출시 시점의 공식 문서를 따릅니다. ₩50,000원 가치는 결제 정산일의 국제 시세 기준으로 산출됩니다. 한국 소매 환산은 시중 평균가를 참조한 것으로, 매장·시점에 따라 차이가 있을 수 있습니다. Aurum 한국 시장 운영은 싱가포르 법인을 통해 이루어지며, 한국 외국환거래법 및 개인정보보호법(PIPA)을 준수합니다. 투자에는 원금 손실 가능성이 있습니다.
        </p>
      </div>
    </div>
  );
}
