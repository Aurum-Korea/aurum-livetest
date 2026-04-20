import { useState, useMemo } from 'react';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { T } from '../lib/tokens';
import { GATES } from '../lib/constants';

// ═══════════════════════════════════════════════════════════════════════
// /referral · v10b · Palette G · Neo-Seoul
//
// Aesthetic: Y2K cyber-pop. Hot pink + electric blue chroma gradients.
// Contrast surface from the rest of the site (quiet gold) — deliberate.
// This is the viral acquisition surface, it should feel DIFFERENT.
// ═══════════════════════════════════════════════════════════════════════

// ─── Palette G · Neo-Seoul tokens ────────────────────────────────────────
const P = {
  bg:       '#0b0b14',
  bg1:      '#13131f',
  bg2:      '#1b1b2b',
  bgDeep:   '#050510',
  hot:      '#ff3d8a',
  hotB:     '#ff6aa8',
  hotD:     '#d4206a',
  blue:     '#00e5ff',
  blueB:    '#7ff0ff',
  blueD:    '#0099bf',
  chrome:   '#d4dcff',
  chromeD:  '#9aa5c4',
  text:     '#f4f4ff',
  sub:      '#a8a8c0',
  muted:    '#6a6a85',
  border:   'rgba(255,61,138,0.15)',
  borderB:  'rgba(0,229,255,0.20)',
  glowP:    'rgba(255,61,138,0.12)',
  glowB:    'rgba(0,229,255,0.10)',
};

const CURRENT_USER = {
  memberId: 'FY-MMXXVI-1247',
  link: 'aurum.kr/i/woosung-k-7g4q9p',
  inviteCount: 4,
  gmvFromReferrals: 18_400_000,
  gatesPassed: 2,
};

// ─── Scene · shared page background with chroma gradients ────────────────
function Scene({ children }) {
  return (
    <div style={{
      background: P.bg,
      color: P.text,
      fontFamily: "'Noto Serif KR', serif",
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated chroma blobs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 900px 600px at 5% 5%, ${P.glowP}, transparent 55%),
          radial-gradient(ellipse 900px 700px at 100% 30%, ${P.glowB}, transparent 55%),
          radial-gradient(ellipse 600px 400px at 50% 95%, ${P.glowP}, transparent 60%)
        `,
      }} />
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,61,138,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        maskImage: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, transparent, black 30%, black 70%, transparent)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// ─── I · Hero · the hook · benefits at a glance ─────────────────────────
function Hero() {
  return (
    <section style={{ padding: '80px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        display: 'inline-block',
        padding: '6px 14px',
        background: P.bgDeep,
        border: `1px solid ${P.hot}`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: '0.22em',
        color: P.hotB,
        textTransform: 'uppercase',
        marginBottom: 28,
      }}>
        Founding Season · 창립 시즌
      </div>
      <h1 style={{
        fontFamily: "'Noto Serif KR', serif",
        fontSize: 'clamp(44px, 7vw, 92px)',
        fontWeight: 500,
        lineHeight: 1.05,
        margin: 0,
        marginBottom: 20,
        letterSpacing: '-0.02em',
      }}>
        친구 한 명 초대.<br/>
        <em style={{
          fontStyle: 'italic',
          fontFamily: "'Cormorant Garamond', serif",
          background: `linear-gradient(90deg, ${P.hot}, ${P.hotB}, ${P.blue}, ${P.blueB}, ${P.hot})`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          animation: 'chroma 8s linear infinite',
        }}>
          금이 바로 쌓입니다.
        </em>
      </h1>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(18px, 2.4vw, 26px)',
        color: P.blueB,
        marginBottom: 40,
        letterSpacing: '0.02em',
      }}>
        One friend. More grams. Forever.
      </p>

      {/* 3 stats · benefits at a glance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
        marginBottom: 36,
      }}>
        {[
          { lbl: '친구당 · Per invite', v: '5만원', sub: '실물 금 · 두 사람 모두', accent: P.hot },
          { lbl: '무제한 · Unlimited',   v: '∞',        sub: '추천 수 제한 없음',       accent: P.blue },
          { lbl: '내 GMV · Counts toward', v: '100%', sub: '친구 구매 = 내 게이트', accent: `linear-gradient(90deg, ${P.hot}, ${P.blue})` },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '22px 22px',
            background: P.bgDeep,
            border: `1px solid ${P.border}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 48, height: 2,
              background: s.accent,
            }} />
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.28em',
              color: P.sub,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {s.lbl}
            </div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 44,
              color: P.text,
              lineHeight: 1,
              marginBottom: 6,
              fontWeight: 500,
            }}>
              {s.v}
            </div>
            <div style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: 12,
              color: P.chromeD,
            }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* CTA row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => {
          try { navigator.clipboard?.writeText(`https://${CURRENT_USER.link}`); } catch (e) {}
          alert('링크 복사됨 · Link copied');
        }} style={{
          background: `linear-gradient(90deg, ${P.hot}, ${P.hotB})`,
          border: 'none',
          color: P.bgDeep,
          padding: '16px 28px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: `0 4px 24px ${P.glowP}`,
        }}>
          내 초대 링크 복사 →
        </button>
        <button onClick={() => {
          const el = document.getElementById('calc');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }} style={{
          background: 'transparent',
          border: `1px solid ${P.blue}`,
          color: P.blueB,
          padding: '16px 28px',
          fontFamily: "'Outfit', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}>
          계산기 열기 ↓
        </button>
      </div>
      <style>{`
        @keyframes chroma {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </section>
  );
}

// ─── II · Invite link strip · copy + social share ────────────────────────
function InviteStrip() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    try { navigator.clipboard?.writeText(`https://${CURRENT_USER.link}`); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const shareKakao = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Aurum Korea · 금환 GoldPath',
        text: '매달 한 그램. 평생 쌓인다.',
        url: `https://${CURRENT_USER.link}`,
      }).catch(() => {});
    } else {
      copy();
    }
  };

  return (
    <section style={{ padding: '0 24px 72px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        padding: '28px 24px',
        background: P.bg1,
        border: `1px solid ${P.borderB}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${P.hot}, ${P.blue}, ${P.hot}, ${P.blue})`,
          backgroundSize: '200% 100%',
          animation: 'chroma 6s linear infinite',
        }} />
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: P.hotB,
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          내 고유 초대 링크 · Your unique link
        </div>
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{
            flex: '1 1 240px',
            minWidth: 220,
            padding: '14px 18px',
            background: P.bgDeep,
            border: `1px solid ${P.border}`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: P.chrome,
            letterSpacing: '0.04em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {CURRENT_USER.link}
          </div>
          <button onClick={copy} style={{
            minWidth: 110,
            background: copied ? P.blue : `linear-gradient(90deg, ${P.hot}, ${P.hotB})`,
            border: 'none',
            color: P.bgDeep,
            padding: '14px 20px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {copied ? '✓ 복사됨' : '복사'}
          </button>
          <button onClick={shareKakao} style={{
            background: 'transparent',
            border: `1px solid ${P.blue}`,
            color: P.blueB,
            padding: '14px 20px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>
            카카오 공유
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── III · Two products · two paths · split cards ────────────────────────
function TwoPaths() {
  return (
    <section style={{ padding: '0 24px 72px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: P.hotB,
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          § I · Two Products · Two Paths
        </div>
        <h2 style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 'clamp(30px, 4.5vw, 56px)',
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.015em',
          margin: 0,
        }}>
          추천은 <em style={{
            fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', serif",
            background: `linear-gradient(90deg, ${P.hot}, ${P.blue})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>두 가지 보상</em>을 동시에 줍니다.
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {/* GoldPath card — neon */}
        <div style={{
          padding: '32px 28px',
          background: P.bg1,
          border: `1px solid ${P.hot}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 220, height: 220, borderRadius: '50%',
            background: `radial-gradient(circle, ${P.glowP}, transparent 70%)`,
            filter: 'blur(20px)',
          }} />
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.24em',
            color: P.hotB,
            textTransform: 'uppercase',
            marginBottom: 14,
            position: 'relative',
          }}>
            ● GoldPath · 월 적립형
          </div>
          <div style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: 22,
            fontWeight: 500,
            color: P.text,
            marginBottom: 6,
            position: 'relative',
          }}>
            친구가 GoldPath 가입할 때
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 14,
            color: P.chromeD,
            marginBottom: 22,
            position: 'relative',
          }}>
            When your friend starts monthly accumulation.
          </div>
          <div style={{ position: 'relative' }}>
            {[
              { l: '친구 첫 결제 시 · 나',          v: '+₩50K' },
              { l: '친구 첫 결제 시 · 친구',        v: '+₩50K' },
              { l: '친구 월 적립액 · 내 게이트',     v: '→ 100%' },
              { l: '친구 Launch Gift의 10%',        v: '+₩5K~₩500K' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '10px 0', borderBottom: i < 3 ? `1px dashed ${P.border}` : 'none',
              }}>
                <span style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 13, color: P.chrome }}>{r.l}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: P.hotB, fontWeight: 700 }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Founders card — ice */}
        <div style={{
          padding: '32px 28px',
          background: P.bg1,
          border: `1px solid ${P.blue}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 220, height: 220, borderRadius: '50%',
            background: `radial-gradient(circle, ${P.glowB}, transparent 70%)`,
            filter: 'blur(20px)',
          }} />
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.24em',
            color: P.blueB,
            textTransform: 'uppercase',
            marginBottom: 14,
            position: 'relative',
          }}>
            ◆ Founders Club · 게이트 진행
          </div>
          <div style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: 22,
            fontWeight: 500,
            color: P.text,
            marginBottom: 6,
            position: 'relative',
          }}>
            친구 총 구매액이 내 게이트로
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 14,
            color: P.chromeD,
            marginBottom: 22,
            position: 'relative',
          }}>
            Friend's GMV accelerates your own tier.
          </div>
          <div style={{ position: 'relative' }}>
            {[
              { l: '친구 누적 GMV · 내 게이트',  v: '+100%' },
              { l: 'Gate III 도달 시',          v: '+₩400K' },
              { l: 'Gate V 도달 시',            v: '+₩2.5M' },
              { l: '평생 할인율 (Gate V)',      v: '−3.0%' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '10px 0', borderBottom: i < 3 ? `1px dashed ${P.borderB}` : 'none',
              }}>
                <span style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 13, color: P.chrome }}>{r.l}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: P.blueB, fontWeight: 700 }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── IV · Earnings calculator · CAGR-style but in chroma ─────────────────
function EarningsCalc() {
  const [friends, setFriends] = useState(5);
  const [avgMonthly, setAvgMonthly] = useState(500_000);

  const calc = useMemo(() => {
    // Per source model: 4 GMV sources · my physical · my GoldPath · referral physical · referral GoldPath
    // Friend's cumulative GMV counts 100% toward my gate progression.
    // Signup bounty: ₩50K for me, ₩50K for friend, paid once per friend on their first debit.
    const signupBounty = 50_000 * friends;
    // Annual GMV from referrals = their monthly * friends * 12
    const referralGmv = avgMonthly * friends * 12;
    // Full referral GMV applies toward my gate (not 5%)
    const gateCredit = referralGmv;
    // Find tier I'd unlock with that GMV alone
    let unlockedTier = null;
    for (let i = GATES.length - 1; i >= 0; i--) {
      if (gateCredit >= GATES[i].gmv) { unlockedTier = GATES[i]; break; }
    }
    return { signupBounty, referralGmv, gateCredit, unlockedTier };
  }, [friends, avgMonthly]);

  const fmt = (n) => '₩' + Math.round(n).toLocaleString('ko-KR');
  const fmtMan = (n) => {
    if (n >= 100_000_000) {
      const eok = Math.floor(n / 100_000_000);
      const man = Math.round((n % 100_000_000) / 10_000);
      return `₩${eok}억 ${man.toLocaleString()}만`;
    }
    return `₩${Math.round(n / 10_000).toLocaleString()}만`;
  };

  return (
    <section id="calc" style={{ padding: '0 24px 80px', maxWidth: 1280, margin: '0 auto', scrollMarginTop: 100 }}>
      <div style={{ marginBottom: 30 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.3em',
          color: P.blueB,
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          § II · Earnings Calculator
        </div>
        <h2 style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 500,
          lineHeight: 1.12,
          letterSpacing: '-0.01em',
          margin: 0,
        }}>
          얼마나 쌓이는지 <em style={{
            fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', serif",
            background: `linear-gradient(90deg, ${P.hot}, ${P.blue})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>지금 계산</em>
        </h2>
      </div>

      <div style={{
        padding: '28px 24px',
        background: P.bg1,
        border: `1px solid ${P.border}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${P.hot}, ${P.blue})`,
        }} />

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22, marginBottom: 24 }}>
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: P.sub, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                초대한 친구 수 · Friends invited
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: P.hotB, fontWeight: 700 }}>
                {friends}명
              </span>
            </div>
            <input type="range" min="1" max="50" step="1" value={friends}
              onChange={e => setFriends(+e.target.value)}
              style={{ width: '100%', '--pct': `${((friends - 1) / (50 - 1)) * 100}%`, '--thumb': P.hot, '--thumb-glow': 'rgba(255,61,138,0.5)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: P.muted, marginTop: 4 }}>
              <span>1</span><span>50+</span>
            </div>
          </div>
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: P.sub, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                친구 평균 월 적립 · Friend avg monthly
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: P.blueB, fontWeight: 700 }}>
                ₩{(avgMonthly / 10_000).toLocaleString()}만
              </span>
            </div>
            <input type="range" min="200000" max="3000000" step="100000" value={avgMonthly}
              onChange={e => setAvgMonthly(+e.target.value)}
              style={{ width: '100%', '--pct': `${((avgMonthly - 200000) / (3000000 - 200000)) * 100}%`, '--thumb': P.blue, '--thumb-glow': 'rgba(0,229,255,0.5)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: P.muted, marginTop: 4 }}>
              <span>₩20만</span><span>₩300만</span>
            </div>
          </div>
        </div>

        {/* Results · 4 cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
        }}>
          {[
            { lbl: '가입 보너스 · Signup bounty', v: fmt(calc.signupBounty), sub: `${friends}명 × ₩50K`, color: P.hotB },
            { lbl: '친구 연간 GMV', v: fmtMan(calc.referralGmv), sub: '12개월 기준', color: P.chrome },
            { lbl: '내 게이트 크레딧 · 100%', v: fmtMan(calc.gateCredit), sub: '내 게이트에 전액 반영', color: P.blueB },
            { lbl: '내 게이트 · Unlocked', v: calc.unlockedTier ? calc.unlockedTier.ko : '-', sub: calc.unlockedTier ? `Gate ${calc.unlockedTier.n} · −${calc.unlockedTier.disc}%` : '게이트 미달', color: `linear-gradient(90deg, ${P.hot}, ${P.blue})` },
          ].map((r, i) => (
            <div key={i} style={{
              padding: '16px 16px',
              background: P.bgDeep,
              border: `1px solid ${P.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 32, height: 2,
                background: r.color,
              }} />
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.22em',
                color: P.sub,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                {r.lbl}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 17,
                fontWeight: 700,
                color: P.text,
                marginBottom: 4,
                lineHeight: 1,
              }}>
                {r.v}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: P.muted,
                letterSpacing: '0.08em',
              }}>
                {r.sub}
              </div>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 12,
          color: P.chromeD,
          marginTop: 20,
          lineHeight: 1.7,
          textAlign: 'center',
        }}>
          * 추천인 수 제한 없음. 친구가 한 번이라도 결제 시 바로 지급. GMV 크레딧은 친구 매달 결제마다 누적.
        </p>
      </div>
    </section>
  );
}

// ─── V · Your current stats · live summary ──────────────────────────────
function MyStats() {
  return (
    <section style={{ padding: '0 24px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{
        padding: '28px 24px',
        background: P.bg2,
        border: `1px solid ${P.borderB}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 14, flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.3em',
            color: P.blueB,
            textTransform: 'uppercase',
          }}>
            § III · 내 현황 · My stats
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: P.muted,
            letterSpacing: '0.18em',
          }}>
            MEMBER · {CURRENT_USER.memberId}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 14,
        }}>
          {[
            { lbl: '초대 완료 · Invites', v: CURRENT_USER.inviteCount, sub: '누적', c: P.hotB },
            { lbl: '친구 GMV · My credit', v: `₩${(CURRENT_USER.gmvFromReferrals / 10_000).toLocaleString()}만`, sub: '내 게이트 반영', c: P.blueB },
            { lbl: '게이트 통과 · Gates', v: CURRENT_USER.gatesPassed, sub: `of ${GATES.length}`, c: P.chrome },
            { lbl: '다음 게이트 · Next', v: 'Gate III', sub: `${fmtKrwMan(50_400_000 - CURRENT_USER.gmvFromReferrals)} 남음`, c: `linear-gradient(90deg, ${P.hot}, ${P.blue})` },
          ].map((r, i) => (
            <div key={i} style={{
              padding: '16px 16px',
              background: P.bgDeep,
              border: `1px solid ${P.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, width: 32, height: 2, background: r.c,
              }} />
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                letterSpacing: '0.22em', color: P.sub, textTransform: 'uppercase', marginBottom: 8,
              }}>
                {r.lbl}
              </div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                fontSize: 32, fontWeight: 500, color: P.text, lineHeight: 1, marginBottom: 4,
              }}>
                {r.v}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: P.muted, letterSpacing: '0.08em',
              }}>
                {r.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function fmtKrwMan(n) {
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000);
    const man = Math.round((n % 100_000_000) / 10_000);
    return `₩${eok}억 ${man.toLocaleString()}만`;
  }
  return `₩${Math.round(n / 10_000).toLocaleString()}만`;
}

// ─── VI · Final CTA ─────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ padding: '40px 24px 120px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{
        fontFamily: "'Noto Serif KR', serif",
        fontSize: 'clamp(32px, 5vw, 60px)',
        fontWeight: 500,
        lineHeight: 1.1,
        letterSpacing: '-0.015em',
        margin: '0 0 22px',
      }}>
        나눌수록 <em style={{
          fontStyle: 'italic',
          fontFamily: "'Cormorant Garamond', serif",
          background: `linear-gradient(90deg, ${P.hot}, ${P.hotB}, ${P.blue}, ${P.blueB}, ${P.hot})`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          animation: 'chroma 8s linear infinite',
        }}>더 쌓입니다.</em>
      </h2>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(18px, 2.2vw, 24px)',
        color: P.chromeD,
        marginBottom: 40,
      }}>
        The more you share, the more you hold.
      </p>
      <button onClick={() => {
        try { navigator.clipboard?.writeText(`https://${CURRENT_USER.link}`); } catch (e) {}
        alert('링크 복사됨 · Link copied');
      }} style={{
        background: `linear-gradient(90deg, ${P.hot}, ${P.hotB})`,
        border: 'none',
        color: P.bgDeep,
        padding: '20px 44px',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: `0 6px 32px ${P.glowP}`,
      }}>
        내 초대 링크 복사 →
      </button>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function ReferralPage() {
  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
      <TickerBar palette="neo" />
      <QuietNav palette="neo" />
      <Scene>
        <Hero />
        <InviteStrip />
        <TwoPaths />
        <EarningsCalc />
        <MyStats />
        <FinalCTA />
      </Scene>
      <QuietFooter />
    </div>
  );
}
