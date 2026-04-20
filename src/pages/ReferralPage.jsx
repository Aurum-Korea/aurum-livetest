import { useState, useMemo } from 'react';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { SectionHead, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { GATES, AGP_CREDITS, TOTAL_CREDITS, fKRW } from '../lib/constants';

const CURRENT_USER = {
  memberId: 'FY-MMXXVI-1247',
  referralLink: 'aurum.kr/i/woosung-k-7g4q9p',
  gatesPassed: 2,
  currentAnnualGMV: 21_800_000,
};

function InviteLinkStrip() {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    try { navigator.clipboard?.writeText(CURRENT_USER.referralLink); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div style={{ background: T.card, border: `1px solid ${T.goldBorderS}`, padding: '22px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.goldB}, ${T.gold}, ${T.goldB}, transparent)` }} />
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.24em', marginBottom: 10 }}>
        YOUR REFERRAL LINK · 무제한 사용
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', background: T.deep, border: `1px solid ${T.goldBorder}`, padding: '14px 16px', fontFamily: T.mono, fontSize: 13, color: T.goldB, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {CURRENT_USER.referralLink}
        </div>
        <button onClick={handleCopy} style={{ background: copied ? T.green : T.gold, color: T.bg, padding: '0 22px', fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', cursor: 'pointer', transition: 'all 0.2s', border: 'none', minWidth: 100 }}>
          {copied ? '✓ 복사됨' : '복사 · COPY'}
        </button>
        <button style={{ background: 'transparent', color: T.gold, border: `1px solid ${T.goldBorder}`, padding: '0 18px', fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', cursor: 'pointer' }}>
          카카오 공유
        </button>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em', marginTop: 12, lineHeight: 1.6 }}>
        {CURRENT_USER.memberId} · MEMBER ID · UNLIMITED INVITES · LIFETIME TRACKING
      </div>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <>
      <TickerBar />
      <QuietNav page="referral" />

      {/* HERO */}
      <div style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.34em', marginBottom: 22 }}>
          THE GMV GROWTH ENGINE · UNLIMITED INVITES
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(38px, 6.5vw, 64px)', fontWeight: 400, color: T.text, lineHeight: 1.08, margin: '0 0 16px', letterSpacing: '-0.015em' }}>
          친구를 초대할수록 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>더 빨리 문이 열립니다.</em>
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(18px, 2.8vw, 24px)', color: T.goldD, fontWeight: 300, marginBottom: 30 }}>
          The more you bring, the faster the gates open.
        </div>
        <div style={{ fontFamily: T.sansKr, fontSize: 15, color: T.sub, lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
          초대한 친구의 구매는 <strong style={{ color: T.text }}>당신의 GMV로 카운트</strong>됩니다.<br />
          GMV가 티어 문턱을 넘을수록 Aurum 가격 할인이 커집니다.
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '30px auto 40px', padding: '0 24px' }}>
        <InviteLinkStrip />
      </div>

      {/* § I · FOUR GMV SOURCES */}
      <div style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 24px' }}>
        <SectionHead num="I" ko="GMV의 네 가지 원천" en="GMV · Four Sources" />
        <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.75, marginBottom: 32, maxWidth: 680 }}>
          GMV는 회원님이 Aurum 생태계에서 만들어낸 모든 거래의 합산입니다. 본인 구매 + 추천 구매 — 네 가지 모두 카운트됩니다.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { lbl: '내 실물 매수', en: 'My Physical', desc: '금·은 바, 코인 직접 구매액', mine: true },
            { lbl: '내 GoldPath', en: 'My GoldPath', desc: '월간 자동이체 누적 총액', mine: true },
            { lbl: '추천 실물', en: 'Referral Physical', desc: '초대한 친구의 실물 매수액', mine: false },
            { lbl: '추천 GoldPath', en: 'Referral GoldPath', desc: '초대한 친구의 GoldPath 월 약정', mine: false },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.card, border: `1px solid ${s.mine ? T.goldBorderS : T.goldBorder}`,
              padding: '22px 18px', textAlign: 'center', position: 'relative',
              animation: `fade-up 0.5s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.06}s both`,
            }}>
              {s.mine && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />}
              <div style={{ fontFamily: T.mono, fontSize: 9, color: s.mine ? T.gold : T.goldD, letterSpacing: '0.2em', marginBottom: 12 }}>0{i + 1}</div>
              <div style={{ fontFamily: T.serifKr, fontSize: 15, color: T.text, fontWeight: 600, marginBottom: 3 }}>{s.lbl}</div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD, marginBottom: 12 }}>{s.en}</div>
              <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        {/* Equation strip */}
        <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: '22px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, flexWrap: 'wrap', textAlign: 'center' }}>
          {[
            { t: '내 실물', type: 'term' },
            { t: '+', type: 'op' },
            { t: '내 GoldPath', type: 'term' },
            { t: '+', type: 'op' },
            { t: '추천 실물', type: 'term' },
            { t: '+', type: 'op' },
            { t: '추천 GoldPath', type: 'term' },
            { t: '=', type: 'eq' },
            { t: 'Total GMV', type: 'total' },
          ].map((item, i) => (
            <span key={i} style={{
              fontFamily: item.type === 'eq' ? T.serif : (item.type === 'op' ? T.serif : (item.type === 'total' ? T.mono : T.sansKr)),
              fontStyle: item.type === 'eq' ? 'italic' : 'normal',
              fontSize: item.type === 'op' ? 28 : item.type === 'eq' ? 22 : item.type === 'total' ? 14 : 12,
              fontWeight: item.type === 'total' ? 700 : 400,
              color: item.type === 'op' || item.type === 'eq' ? T.goldD : item.type === 'total' ? T.goldB : T.sub,
              letterSpacing: item.type === 'total' ? '0.14em' : '0.06em',
              lineHeight: 1,
            }}>{item.t}</span>
          ))}
        </div>
      </div>

      {/* § II · 5-TIER LADDER */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead num="II" ko="5단계 멤버십" en="Bronze · Silver · Gold · Platinum · Sovereign" />
          <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.75, marginBottom: 30, maxWidth: 680 }}>
            연간 총 GMV (본인 + 초대 합산)가 각 문턱을 넘을 때 해당 티어가 열립니다. 한번 열린 티어는 평생 유지.
          </div>
          <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: '24px 26px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 90px 70px', gap: 14,
              padding: '10px 0', borderBottom: `1px solid ${T.goldBorder}`, marginBottom: 6,
              fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em',
            }}>
              <span></span><span>TIER</span><span style={{ textAlign: 'right' }}>GMV 문턱</span><span style={{ textAlign: 'right' }}>할인</span>
            </div>
            {GATES.map((g, i) => {
              const hit = CURRENT_USER.currentAnnualGMV >= g.gmv;
              const isCurrent = hit && (i === GATES.length - 1 || CURRENT_USER.currentAnnualGMV < GATES[i + 1].gmv);
              return (
                <div key={g.n} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 90px 70px', gap: 14,
                  padding: '14px 0', borderBottom: i < GATES.length - 1 ? `1px solid ${T.border}` : 'none',
                  alignItems: 'center', opacity: hit ? 1 : 0.55,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: hit ? (g.apex ? T.gold : T.goldGlow) : 'transparent',
                    border: `1px solid ${hit ? (g.apex ? T.goldB : T.goldBorderS) : T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: T.serif, fontStyle: 'italic', fontSize: 14,
                    color: hit ? (g.apex ? T.bg : T.goldB) : T.muted, fontWeight: 500, position: 'relative',
                  }}>
                    {g.n}
                    {isCurrent && <span style={{ position: 'absolute', right: -6, top: -2, width: 7, height: 7, borderRadius: '50%', background: T.green, boxShadow: `0 0 8px ${T.green}`, animation: 'pulse 1.5s infinite' }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: T.serifKr, fontSize: 14, color: hit ? T.text : T.muted, fontWeight: 500 }}>{g.ko}</div>
                    <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD, marginTop: 1 }}>{g.en}</div>
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: hit ? T.goldB : T.muted, letterSpacing: '0.08em', textAlign: 'right' }}>{fKRW(g.gmv)}</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: hit ? (g.apex ? T.goldB : T.gold) : T.muted, fontWeight: 600, textAlign: 'right' }}>−{g.disc.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* § III · 90-DAY PROMO */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px' }}>
        <SectionHead num="III" ko="90일 승급 프로모" en="Every signup · one tier up · for 90 days" />
        <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.75, marginBottom: 28, maxWidth: 680 }}>
          신규 가입자는 자신의 티어보다 <strong style={{ color: T.text }}>한 단계 위 할인율을 90일간 적용</strong>받습니다. Aurum을 처음 시작할 때 가장 큰 혜택.
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.goldBorderS}`, padding: '26px 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.green}, ${T.gold}, ${T.green}, transparent)` }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr 80px', gap: 14, padding: '10px 0', marginBottom: 8, borderBottom: `1px solid ${T.goldBorder}`, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em' }}>
            <span>가입 티어 · APPLY AT</span><span></span><span>90일 적용 · YOU GET</span><span style={{ textAlign: 'right' }}>할인</span>
          </div>
          {GATES.map((g, i) => {
            const next = GATES[i + 1];
            const appliedDisc = next ? next.disc : g.disc;
            const appliedName = next ? next : g;
            const maxed = !next;
            return (
              <div key={g.n} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr 80px', gap: 14, padding: '16px 0', borderBottom: i < GATES.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: T.serifKr, fontSize: 14, color: T.text, fontWeight: 500 }}>{g.ko}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em', marginTop: 2 }}>{g.en} · {g.monthlyMin}</div>
                </div>
                <div style={{ textAlign: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 20, color: T.gold, lineHeight: 1 }}>→</div>
                <div>
                  <div style={{ fontFamily: T.serifKr, fontSize: 15, color: maxed ? T.muted : T.goldB, fontWeight: 600 }}>
                    {maxed ? (
                      <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.muted }}>최고 티어 — 승급 없음</span>
                    ) : (
                      <>
                        {appliedName.ko}
                        <span style={{ fontFamily: T.mono, fontSize: 8, color: T.green, letterSpacing: '0.22em', padding: '2px 6px', border: `1px solid rgba(74,222,128,0.3)`, marginLeft: 8, verticalAlign: 'middle' }}>90D</span>
                      </>
                    )}
                  </div>
                  {!maxed && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em', marginTop: 2 }}>{appliedName.en} rate · 90 days</div>}
                </div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: maxed ? T.muted : T.goldB, fontWeight: 600, textAlign: 'right' }}>−{appliedDisc.toFixed(1)}%</div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, padding: '12px 14px', background: T.deep, border: `1px dashed ${T.goldBorder}`, fontFamily: T.sansKr, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
            ⓘ 90일 후, 실제 GMV에 따른 정규 티어로 전환됩니다. 그때까지 승급된 할인율로 Aurum 가격 적용.
          </div>
        </div>
      </div>

      {/* § IV · GOLDPATH CREDITS */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px' }}>
        <SectionHead num="IV" ko="GoldPath 보너스 크레딧" en="Free gold credits · GoldPath subscribers only" />
        <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.75, marginBottom: 24, maxWidth: 680 }}>
          GoldPath (월 자동 적립) 구독자는 할인에 더해, 각 티어를 통과할 때 <strong style={{ color: T.text }}>무료 금 크레딧</strong>을 받습니다. 누적 최대 <strong style={{ color: T.goldB }}>{fKRW(TOTAL_CREDITS)}</strong>.
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: '24px 26px' }}>
          {AGP_CREDITS.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 110px', gap: 14, padding: '14px 0', borderBottom: i < AGP_CREDITS.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.apex ? T.gold : T.goldGlow, border: `1px solid ${c.apex ? T.goldB : T.goldBorderS}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: c.apex ? T.bg : T.goldB, fontWeight: 500 }}>{c.gate}</div>
              <div>
                <div style={{ fontFamily: T.serifKr, fontSize: 14, color: T.text, fontWeight: 500 }}>{c.desc}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em', marginTop: 2 }}>TIER {c.gate} · 실물 금 적립</div>
              </div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: c.apex ? T.goldB : T.gold, fontWeight: 600, textAlign: 'right' }}>+{fKRW(c.credit)}</div>
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `2px solid ${T.goldBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em' }}>
            <span style={{ color: T.gold }}>TOTAL · 최대 누적 크레딧</span>
            <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 26, color: T.goldB, fontWeight: 700 }}>{fKRW(TOTAL_CREDITS)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PrimaryCTA onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Aurum', text: '실물 금 · 싱가포르 보관', url: 'https://aurum.kr/i/woosung-k-7g4q9p' }).catch(() => {});
            } else {
              try { navigator.clipboard?.writeText('https://aurum.kr/i/woosung-k-7g4q9p'); } catch (e) {}
            }
          }}>카카오로 공유하기</PrimaryCTA>
          <GhostCTA to="/terminal">내 초대 기록 보기</GhostCTA>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 22, letterSpacing: '0.22em' }}>
          UNLIMITED INVITES · LIFETIME GMV TRACKING
        </div>
      </div>

      <QuietFooter />
    </>
  );
}
