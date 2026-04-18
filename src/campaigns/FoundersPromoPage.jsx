// FoundersPromoPage.jsx — standalone promo/campaign page (Structural 2B)
// Extracted from FoundersClubPage: level strip + CTA + new member cap counter + gate summary table
import { useState } from 'react';
import { T, useIsMobile } from '../lib/index.jsx';

const FOUNDERS_CAP     = 500;
const SPOTS_REMAINING  = 247;

const GATES_TABLE = [
  { gate: 'Bronze', threshold: '가입',   thresholdEn: 'Sign up', discount: '—',    storage: '0.75% p.a.', bonus: '—' },
  { gate: 'Gate I',   threshold: '$5K / ₩7.2M',   thresholdEn: '$5K / ₩7.2M',   discount: '−1.0%', storage: '0.75% p.a.', bonus: '+₩50K'    },
  { gate: 'Gate II',  threshold: '$15K / ₩21.6M',  thresholdEn: '$15K / ₩21.6M', discount: '−1.5%', storage: '0.50% p.a.', bonus: '+₩150K'   },
  { gate: 'Gate III ✦', threshold: '$35K / ₩50.4M', thresholdEn: '$35K / ₩50.4M', discount: '−2.0%', storage: '0.50% p.a.', bonus: '+₩400K'   },
  { gate: 'Gate IV',  threshold: '$65K / ₩93.6M',  thresholdEn: '$65K / ₩93.6M', discount: '−2.5%', storage: '0.30% p.a.', bonus: '+₩1,000K' },
  { gate: 'Gate V',   threshold: '$100K / ₩144M',  thresholdEn: '$100K / ₩144M', discount: '−3.0%', storage: '0.30% p.a.', bonus: '+₩2,500K' },
];

export default function FoundersPromoPage({ lang, navigate, krwRate = 1440, setShowLogin }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [email, setEmail] = useState('');
  const [notifyDone, setNotifyDone] = useState(false);

  const filledPct = ((FOUNDERS_CAP - SPOTS_REMAINING) / FOUNDERS_CAP * 100).toFixed(0);
  const pad = isMobile ? '44px 20px' : '72px 60px';

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text }}>

      {/* ── Member Cap Counter ── */}
      <div style={{ padding: isMobile ? '48px 20px 40px' : '80px 60px 64px', textAlign: 'center', borderBottom: `1px solid ${T.goldBorder}`, background: `radial-gradient(ellipse at 50% 0%,rgba(197,165,114,0.07),transparent 65%)` }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 24 }}>
          {ko ? 'FOUNDERS CLUB · 한정 모집' : 'FOUNDERS CLUB · LIMITED ENROLLMENT'}
        </div>

        {/* Animated spot counter */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 56 : 88, color: T.gold, lineHeight: 1 }}>{SPOTS_REMAINING}</span>
          <span style={{ fontFamily: T.mono, fontSize: isMobile ? 13 : 16, color: T.textMuted, display: 'block', marginTop: 4, letterSpacing: '0.1em' }}>
            {ko ? `/ ${FOUNDERS_CAP} 남은 자리` : `/ ${FOUNDERS_CAP} spots remaining`}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: 480, margin: '0 auto 12px', background: 'rgba(197,165,114,0.1)', height: 6 }}>
          <div style={{ height: '100%', width: `${filledPct}%`, background: `linear-gradient(90deg, ${T.goldDeep}, ${T.gold})`, transition: 'width 1s ease' }} />
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.14em' }}>
          {filledPct}% FILLED
        </div>
      </div>

      {/* ── Level Strip ── */}
      <div style={{ background: T.bg3, borderBottom: `1px solid ${T.goldBorder}` }}>
        <div style={{ textAlign: 'center', padding: isMobile ? '14px 20px 4px' : '18px 20px 4px', borderBottom: `1px solid rgba(197,165,114,0.08)` }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            {ko ? 'LIFETIME DISCOUNT · GMV 누적 시 자동 적용' : 'LIFETIME DISCOUNT · AUTO-APPLIED ON GMV ACCUMULATION'}
          </span>
        </div>
        <div style={{ maxWidth: 1340, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5,1fr)', gap: 0 }}>
          {[
            { num:'I',   label:'시작의 문', labelEn:'The Opening',      discount:1.0, gmv: 5000  },
            { num:'II',  label:'셋의 표식', labelEn:'The Three',        discount:1.5, gmv:15000  },
            { num:'III', label:'정점',      labelEn:'The Apex',          discount:2.0, gmv:35000  },
            { num:'IV',  label:'볼트 순례', labelEn:'Vault Pilgrimage',  discount:2.5, gmv:65000  },
            { num:'V',   label:'평생의 표식',labelEn:'Lifetime Mark',    discount:3.0, gmv:100000 },
          ].map((g, i) => {
            const isOptimal = g.num === 'III';
            const color = i < 2 ? T.goldDim : isOptimal ? '#4ade80' : T.gold;
            return (
              <div key={i} style={{
                textAlign: 'center',
                padding: isMobile ? '14px 8px' : isOptimal ? '28px 14px' : '22px 14px',
                borderRight: !isMobile && i < 4 ? `1px solid ${T.goldBorder}` : 'none',
                borderBottom: isMobile && i < 3 ? `1px solid ${T.goldBorder}` : 'none',
                background: isOptimal ? 'rgba(74,222,128,0.04)' : 'transparent',
                borderTop: isOptimal ? `2px solid rgba(74,222,128,0.5)` : `2px solid transparent`,
                position: 'relative',
              }}>
                {isOptimal && (
                  <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)', padding: '2px 8px', fontFamily: T.mono, fontSize: 8, color: '#4ade80', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>
                    {ko ? '추천' : 'OPTIMAL'}
                  </div>
                )}
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 10 : 13, color: 'rgba(197,165,114,0.25)', marginBottom: 2 }}>{g.num}</div>
                <div style={{ fontFamily: T.mono, fontSize: isMobile ? 18 : isOptimal ? 30 : 24, color, fontWeight: 700, lineHeight: 1 }}>−{g.discount}%</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 9 : 11, color: isOptimal ? 'rgba(74,222,128,0.7)' : 'rgba(197,165,114,0.5)', marginTop: 4 }}>{ko ? g.label : g.labelEn}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textMuted, marginTop: 3, letterSpacing: '0.05em' }}>₩{Math.round(g.gmv * (krwRate || 1440) / 1000000).toFixed(0)}M+</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Gate Summary Table ── */}
      <div style={{ padding: pad, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>
            {ko ? 'GATE 요약' : 'GATE SUMMARY'}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.sans, fontSize: isMobile ? 11 : 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.goldBorder}` }}>
                  {[ko?'게이트':'Gate', ko?'GMV 기준':'GMV Threshold', ko?'가격 할인':'Discount', ko?'보관료':'Storage', ko?'크레딧':'Bonus'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GATES_TABLE.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: row.gate.includes('✦') ? 'rgba(74,222,128,0.03)' : 'transparent' }}>
                    <td style={{ padding: '11px 12px', color: row.gate.includes('✦') ? '#4ade80' : T.gold, fontFamily: T.mono, fontSize: 12, fontWeight: 600 }}>{row.gate}</td>
                    <td style={{ padding: '11px 12px', color: T.textSub }}>{ko ? row.threshold : row.thresholdEn}</td>
                    <td style={{ padding: '11px 12px', color: row.discount === '—' ? T.textMuted : T.gold, fontFamily: T.mono, fontWeight: 700 }}>{row.discount}</td>
                    <td style={{ padding: '11px 12px', color: T.textSub, fontFamily: T.mono, fontSize: 11 }}>{row.storage}</td>
                    <td style={{ padding: '11px 12px', color: row.bonus === '—' ? T.textMuted : '#4ade80', fontFamily: T.mono, fontSize: 11 }}>{row.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: isMobile ? '72px 20px' : '110px 60px', background: `radial-gradient(ellipse at 50% 100%,rgba(197,165,114,0.15),transparent 60%),${T.bg}`, textAlign: 'center', borderTop: `1px solid ${T.goldBorder}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 60 : 130, color: 'rgba(197,165,114,0.022)', whiteSpace: 'nowrap', userSelect: 'none', letterSpacing: '0.12em' }}>FOUNDERS</div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.gold, letterSpacing: '0.2em', marginBottom: 20, textTransform: 'uppercase' }}>— Exclusive · First-Come, First-Served —</div>
          <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 28 : 46, fontWeight: 500, color: T.text, marginBottom: 16, lineHeight: 1.15 }}>
            {ko
              ? <>지금 가입하면<br /><span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>첫날부터 게이트가 시작됩니다</span></>
              : <>Join now and your <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>gates start from day one</span></>}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 36px' }}>
            {ko ? 'Founders Club 멤버십은 한정 모집입니다. 조기 마감 시 재오픈 일정은 미정.' : 'Founders Club membership is limited. No reopening schedule if closed early.'}
          </p>

          {/* Email notify form — only when cap is hit */}
          {SPOTS_REMAINING <= 0 ? (
            <div style={{ maxWidth: 360, margin: '0 auto' }}>
              {notifyDone ? (
                <p style={{ fontFamily: T.sans, fontSize: 14, color: '#4ade80' }}>{ko ? '알림이 등록되었습니다.' : 'You\'ll be notified when spots open.'}</p>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={ko ? '이메일 주소' : 'Email address'} style={{ flex: 1, background: T.bg1, border: `1px solid ${T.goldBorder}`, color: T.text, padding: '13px 14px', fontSize: 13, fontFamily: T.sans, outline: 'none' }} />
                  <button onClick={() => setNotifyDone(true)} style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: '13px 20px', fontFamily: T.sans, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    {ko ? '알림 받기' : 'Notify Me'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch' }}>
              <button onClick={() => navigate('agp-enroll')} style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: '16px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans, minWidth: 220 }}>
                {ko ? '파운더스 클럽 가입 →' : 'Join Founders Club →'}
              </button>
              <button onClick={() => navigate('shop')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.textSub, padding: '16px 36px', fontSize: 15, cursor: 'pointer', fontFamily: T.sans, minWidth: 220 }}>
                {ko ? '실물 구매로 시작' : 'Start with Physical'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
