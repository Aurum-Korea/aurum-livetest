import { Link } from 'react-router-dom';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { T } from '../lib/tokens';

// ═══════════════════════════════════════════════════════════════════════════
// /start · BRIDGE PAGE · Museum v2 blended
//
// Single job: let each visitor self-identify and walk through the right door
// in 3 seconds. No pitching. No tier grid. No pricing above the fold.
//
// Left room (I · The Study): quiet gold · Founders · 이미 쌓으셨습니까
// Right room (II · The Daily): Neo-Seoul chroma · GoldPath · 쌓고 계신 중
// ═══════════════════════════════════════════════════════════════════════════

// Neo-Seoul palette (mirrors /referral) — scoped to GoldPath side only
const NS = {
  hot:     '#ff3d8a',
  hotB:    '#ff6aa8',
  blue:    '#00e5ff',
  blueB:   '#7ff0ff',
  chrome:  '#d4dcff',
  chromeD: '#9aa5c4',
  hotBorder: 'rgba(255,61,138,0.25)',
  hotGlow:   'rgba(255,61,138,0.12)',
  blueGlow:  'rgba(0,229,255,0.10)',
};

function MuseumBridge() {
  return (
    <section style={{ padding: '72px 24px 72px', position: 'relative', overflow: 'hidden' }} className="bridge-section">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.goldB || T.gold}, transparent)` }} />

      <div style={{ textAlign: 'center', marginBottom: 52, maxWidth: 720, margin: '0 auto 52px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.32em', marginBottom: 22, textTransform: 'uppercase' }}>
          — EST. MMXXIV · SINGAPORE · TWO ENGINES —
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(34px, 4.4vw, 56px)', fontWeight: 400, lineHeight: 1.18, letterSpacing: '-0.015em', margin: 0, marginBottom: 18, color: T.text }}>
          한 집. <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>두 개의 방.</em>
        </h1>
        <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldD, lineHeight: 1.6, margin: 0 }}>
          One house. Two rooms. Step into the one that feels like yours.
        </p>
      </div>

      <div className="bridge-rooms" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: `1px solid ${T.goldBorder}`, maxWidth: 1220, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />

        {/* ROOM I · FOUNDERS */}
        <div className="bridge-room-founders" style={{ padding: '48px 42px 44px', minHeight: 560, display: 'flex', flexDirection: 'column', position: 'relative', background: T.deepBlack || '#06050a', borderRight: `1px solid ${T.goldBorder}` }}>
          <div style={{ position: 'absolute', top: 20, right: 30, fontFamily: T.serif, fontStyle: 'italic', fontSize: 92, lineHeight: 1, color: T.gold, opacity: 0.12, fontWeight: 500, pointerEvents: 'none' }}>I</div>

          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.3em', marginBottom: 20, textTransform: 'uppercase', position: 'relative' }}>— ROOM I · THE STUDY —</div>

          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.005em', margin: 0, marginBottom: 10, color: T.text, position: 'relative' }}>
            이미 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 500 }}>쌓으셨습니까?</em>
          </h2>
          <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.goldD, lineHeight: 1.5, marginBottom: 26, position: 'relative' }}>Have you already built?</p>

          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 26, position: 'relative' }}>
            {[
              <>당신은 <strong style={{ color: T.text, fontWeight: 500 }}>포트폴리오</strong>를 관리합니다</>,
              <>금은 <strong style={{ color: T.text, fontWeight: 500 }}>자산 배분</strong>의 한 축입니다</>,
              <>관계 · 영속 · 접근을 중시합니다</>,
            ].map((item, i, arr) => (
              <li key={i} style={{ fontFamily: T.serifKr, fontSize: 13, color: T.sub, fontWeight: 300, lineHeight: 1.6, padding: '7px 0 7px 22px', position: 'relative', borderBottom: i < arr.length - 1 ? `1px dashed ${T.goldBorder}` : 'none' }}>
                <span style={{ position: 'absolute', left: 6, top: 6, color: T.gold, fontSize: 18, lineHeight: 1 }}>·</span>
                {item}
              </li>
            ))}
          </ul>

          <span style={{ display: 'inline-block', padding: '5px 12px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.gold, border: `1px solid ${T.goldBorder}`, marginBottom: 20, alignSelf: 'flex-start', position: 'relative' }}>
            500명 · 평생 · 초대 중심
          </span>

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px dashed ${T.goldBorder}`, marginBottom: 22, position: 'relative' }}>
            <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.gold, marginBottom: 4, fontWeight: 500, lineHeight: 1.1 }}>
              Aurum Founders Club
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.24em', color: T.goldD, textTransform: 'uppercase' }}>
              파운더스 · EST. MMXXIV
            </div>
          </div>

          <Link to="/founders" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 26px', fontFamily: T.sans, fontWeight: 700, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.gold, border: `1px solid ${T.gold}`, background: 'transparent', alignSelf: 'flex-start', textDecoration: 'none', position: 'relative', transition: 'all 0.3s' }}>
            입장 요청 · Request access →
          </Link>
        </div>

        {/* ROOM II · GOLDPATH · Neo-Seoul */}
        <div className="bridge-room-goldpath" style={{ padding: '48px 42px 44px', minHeight: 560, display: 'flex', flexDirection: 'column', position: 'relative', background: '#141008', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${NS.hotGlow}, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${NS.blueGlow}, transparent 70%)`, filter: 'blur(30px)', pointerEvents: 'none', zIndex: 0 }} />

          <div style={{ position: 'absolute', top: 20, right: 30, fontFamily: T.serif, fontStyle: 'italic', fontSize: 92, lineHeight: 1, color: NS.hot, opacity: 0.18, fontWeight: 500, pointerEvents: 'none', zIndex: 0 }}>II</div>

          <div style={{ fontFamily: T.mono, fontSize: 9, color: NS.hotB, letterSpacing: '0.3em', marginBottom: 20, textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>— ROOM II · THE DAILY —</div>

          <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.005em', margin: 0, marginBottom: 10, color: T.text, position: 'relative', zIndex: 1 }}>
            지금 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: NS.hotB, fontWeight: 500 }}>쌓고 계신 중이십니까?</em>
          </h2>
          <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: NS.blueB, opacity: 0.85, lineHeight: 1.5, marginBottom: 26, position: 'relative', zIndex: 1 }}>Are you building right now?</p>

          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 26, position: 'relative', zIndex: 1 }}>
            {[
              <>당신은 <strong style={{ color: T.text, fontWeight: 500 }}>매달 자동이체</strong>를 굴립니다</>,
              <>금은 <strong style={{ color: T.text, fontWeight: 500 }}>원화 헷지</strong>의 도구입니다</>,
              <>모멘텀 · 커뮤니티 · 공유를 즐깁니다</>,
            ].map((item, i, arr) => (
              <li key={i} style={{ fontFamily: T.serifKr, fontSize: 13, color: NS.chrome, fontWeight: 300, lineHeight: 1.6, padding: '7px 0 7px 22px', position: 'relative', borderBottom: i < arr.length - 1 ? `1px dashed ${NS.hotBorder}` : 'none' }}>
                <span style={{ position: 'absolute', left: 6, top: 6, color: NS.hot, fontSize: 18, lineHeight: 1 }}>·</span>
                {item}
              </li>
            ))}
          </ul>

          <span style={{ display: 'inline-block', padding: '5px 12px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: NS.hotB, border: `1px solid ${NS.hotBorder}`, background: 'rgba(255,61,138,0.04)', marginBottom: 20, alignSelf: 'flex-start', position: 'relative', zIndex: 1 }}>
            5,000명 · 창립 · 무제한 추천
          </span>

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px dashed ${NS.hotBorder}`, marginBottom: 22, position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: T.sans, fontWeight: 800, fontSize: 24, letterSpacing: '0.04em', marginBottom: 4, lineHeight: 1.1,
              background: `linear-gradient(90deg, ${NS.hot}, ${NS.hotB}, ${NS.blue}, ${NS.blueB}, ${NS.hot})`,
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              animation: 'bridge-chroma 8s linear infinite',
            }}>
              GOLDPATH · 금환
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.24em', color: NS.hotB, textTransform: 'uppercase' }}>
              매달 한 그램 · MONTHLY
            </div>
          </div>

          <Link to="/goldpath" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 26px', fontFamily: T.sans, fontWeight: 700, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.bg, border: 'none', background: `linear-gradient(90deg, ${NS.hot}, ${NS.hotB})`, alignSelf: 'flex-start', textDecoration: 'none', position: 'relative', zIndex: 1, transition: 'all 0.3s' }}>
            지금 시작 · Start the path →
          </Link>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.22em', color: T.muted, textTransform: 'uppercase', maxWidth: 1220, margin: '40px auto 0' }}>
        — 어느 쪽도 확신이 서지 않으십니까? <Link to="/why" style={{ color: T.goldD, borderBottom: `1px dotted ${T.goldD}`, paddingBottom: 1, textDecoration: 'none' }}>Aurum이 무엇인지 먼저 보기 →</Link> —
      </div>

      <style>{`
        @keyframes bridge-chroma {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @media (max-width: 860px) {
          .bridge-section { padding-top: 32px !important; padding-bottom: 48px !important; }
          .bridge-rooms { grid-template-columns: 1fr !important; }
          .bridge-room-founders { border-right: none !important; border-bottom: 1px solid ${T.goldBorder} !important; min-height: auto !important; padding: 68px 28px 40px !important; }
          .bridge-room-goldpath { min-height: auto !important; padding: 68px 28px 40px !important; }
          .bridge-room-founders > div:first-child,
          .bridge-room-goldpath > div:nth-child(3) {
            font-size: 64px !important; top: 10px !important; right: 18px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default function StartPage() {
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
      <TickerBar />
      <QuietNav />
      <MuseumBridge />
      <QuietFooter />
    </div>
  );
}
