import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';

function Photo({ type = 'corridor', caption, tag, height = 420 }) {
  const compositions = {
    corridor: (
      <svg viewBox="0 0 1200 600" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="lineGold" x1="0%" x2="100%"><stop offset="0%" stopColor="#6a5a3a" stopOpacity="0.1"/><stop offset="50%" stopColor="#C5A572" stopOpacity="0.4"/><stop offset="100%" stopColor="#6a5a3a" stopOpacity="0.1"/></linearGradient>
          <radialGradient id="spotG" cx="50%" cy="50%"><stop offset="0%" stopColor="#E3C187" stopOpacity="0.6"/><stop offset="100%" stopColor="#C5A572" stopOpacity="0"/></radialGradient>
        </defs>
        {[...Array(7)].map((_, i) => <line key={i} x1="0" y1={100 + i * 65} x2="1200" y2={100 + i * 65} stroke="url(#lineGold)" strokeWidth="0.4" />)}
        {[...Array(9)].map((_, i) => <line key={`a${i}`} x1={i * 150} y1="50" x2="600" y2="300" stroke="rgba(197,165,114,0.08)" strokeWidth="0.5" />)}
        {[...Array(9)].map((_, i) => <line key={`b${i}`} x1={i * 150} y1="550" x2="600" y2="300" stroke="rgba(197,165,114,0.08)" strokeWidth="0.5" />)}
        <circle cx="600" cy="300" r="140" fill="url(#spotG)" />
        <circle cx="600" cy="300" r="22" fill="#E3C187" opacity="0.9" filter="blur(1.5px)" />
      </svg>
    ),
    bars: (
      <svg viewBox="0 0 1200 600" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {[0,1,2,3,4].map(i => (
            <linearGradient key={i} id={`barG${i}`} x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#2a2418"/><stop offset="40%" stopColor="#C5A572"/><stop offset="60%" stopColor="#E3C187"/><stop offset="100%" stopColor="#6a5a3a"/>
            </linearGradient>
          ))}
        </defs>
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={200 + i * 30} y={280 - i * 25} width="700" height="60" fill={`url(#barG${i})`} stroke="#8a7d6b" strokeWidth="0.3" opacity={0.88 - i * 0.12} />
        ))}
      </svg>
    ),
    audit: (
      <svg viewBox="0 0 1200 600" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <rect x="200" y="200" width="800" height="260" fill="none" stroke="#C5A572" strokeWidth="0.5" opacity="0.4" />
        <rect x="460" y="280" width="280" height="100" fill="url(#barG0)" opacity="0.7" />
        <defs>
          <linearGradient id="barG0" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#2a2418"/><stop offset="50%" stopColor="#C5A572"/><stop offset="100%" stopColor="#6a5a3a"/>
          </linearGradient>
        </defs>
        <circle cx="300" cy="400" r="80" fill="none" stroke="#C5A572" strokeWidth="1" opacity="0.3" />
        <circle cx="900" cy="400" r="80" fill="none" stroke="#C5A572" strokeWidth="1" opacity="0.3" />
        <line x1="300" y1="320" x2="900" y2="320" stroke="#C5A572" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.4" />
      </svg>
    ),
    mark: (
      <svg viewBox="0 0 1200 600" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="coinBig" cx="32%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#F2D4A0"/>
            <stop offset="28%" stopColor="#E3C187"/>
            <stop offset="62%" stopColor="#C5A572"/>
            <stop offset="88%" stopColor="#8a7448"/>
            <stop offset="100%" stopColor="#4a3a20"/>
          </radialGradient>
        </defs>
        <ellipse cx="600" cy="520" rx="200" ry="25" fill="#000" opacity="0.5" />
        <circle cx="600" cy="300" r="200" fill="url(#coinBig)" />
        <circle cx="600" cy="300" r="160" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1" />
        <circle cx="600" cy="300" r="175" fill="none" stroke="rgba(255,228,180,0.22)" strokeWidth="0.6" />
        <text x="600" y="330" textAnchor="middle" fontFamily="'Cormorant Garamond',Georgia,serif" fontStyle="italic" fontWeight="600" fontSize="112" fill="rgba(40,26,12,0.82)" letterSpacing="-0.02em">Au</text>
        <text x="600" y="400" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="14" letterSpacing="0.3em" fill="rgba(40,26,12,0.5)" fontWeight="700">999.9</text>
      </svg>
    ),
  };

  return (
    <div style={{
      height, position: 'relative', overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 25% 40%, rgba(197,165,114,0.09) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 65%, rgba(197,165,114,0.05) 0%, transparent 50%),
        linear-gradient(135deg, #161310 0%, #0d0b08 50%, #06050a 100%)
      `,
      border: `1px solid ${T.goldBorder}`,
      marginBottom: 20,
    }}>
      {compositions[type]}
      {tag && (
        <div style={{ position: 'absolute', bottom: 18, left: 22, fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.26em' }}>
          {tag}
        </div>
      )}
      {caption && (
        <div style={{ position: 'absolute', bottom: 18, right: 22, fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD }}>
          {caption}
        </div>
      )}
    </div>
  );
}

export default function WhyPage() {
  return (
    <>
      <TickerBar />
      <QuietNav page="why" />

      {/* I · Hero */}
      <div style={{ padding: '100px 24px 60px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.34em', color: T.goldD, textTransform: 'uppercase', marginBottom: 28 }}>
          The thesis · 네 가지 힘 · One direction
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 400, color: T.text, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.015em' }}>
          왜 지금, <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>왜 금인가.</em>
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(18px, 2.8vw, 26px)', color: T.goldD, fontWeight: 300 }}>
          Why gold, why now.
        </div>
      </div>

      {/* II · The four forces */}
      <div style={{ maxWidth: 1060, margin: '0 auto 100px', padding: '0 24px' }}>
        {[
          {
            n: 'I', ko: '한국 프리미엄 · 구조적 20%', en: 'The Korea Premium · structural',
            stat: '+20.1%', statLbl: '소매 현물가 대비',
            body: '한국 개인 구매자는 국제 현물가보다 평균 20% 높게 삽니다. VAT 10%, 수입 프리미엄, 유통 마진. 이 구조는 50년간 유지되었고 바뀌지 않습니다.',
            bodyEn: 'Fifty years old. Structural. Will not fix itself.',
          },
          {
            n: 'II', ko: '중앙은행 매입 · 세대적 추세', en: 'Central bank buying · generational',
            stat: '220t', statLbl: 'Q3 2025 · 분기별 매입',
            body: '중국·인도·폴란드·터키 등 주요 중앙은행은 2024년부터 분기당 200톤 이상 매입. 2008년 이래 최고 속도. 달러 보유고의 대안을 찾고 있습니다.',
            bodyEn: 'Central banks are the most informed gold buyers in the world. They are signaling something.',
          },
          {
            n: 'III', ko: '원화의 구매력 · 역사적 약화', en: 'KRW purchasing power',
            stat: '−53%', statLbl: '2000년 대비 구매력',
            body: '₩100,000은 2000년 당시 구매력의 47%. 같은 기간 금은 23배 상승. 한국만의 문제가 아닙니다 — 모든 법정화폐에서 일어나는 구조적 현상입니다.',
            bodyEn: 'Not a Korean failure. Every fiat compounds downward against gold.',
          },
          {
            n: 'IV', ko: '복리의 수학 · 매달 한 그램', en: 'The math of compounding',
            stat: '23×', statLbl: '금 가격 · 2000년 이후',
            body: '월 ₩200K를 10년 적립 시 약 152g (연 10% 성장 가정). 같은 금액을 2.8% 적금으로 보유 시 약 ₩28M. 복리는 조용하지만 가장 강력합니다.',
            bodyEn: 'Month by month, the grams accumulate. At ten years the gap is no longer small.',
          },
        ].map((force, i) => (
          <div key={i} style={{ borderTop: i ? `1px solid ${T.border}` : 'none', padding: '60px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40 }} className="force-grid">
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 10 }}>FORCE · {force.n}</div>
                <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px, 3.6vw, 36px)', fontWeight: 500, color: T.text, lineHeight: 1.15, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                  {force.ko}
                </h2>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD, marginBottom: 32 }}>
                  {force.en}
                </div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 78, color: T.gold, fontWeight: 600, lineHeight: 1, marginBottom: 6 }}>
                  {force.stat}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  {force.statLbl}
                </div>
              </div>
              <div>
                <Prose>{force.body}</Prose>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.goldD, lineHeight: 1.65, borderLeft: `2px solid ${T.gold}`, paddingLeft: 16, marginTop: 24 }}>
                  {force.bodyEn}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 820px) {
          .force-grid { grid-template-columns: 1fr 1.3fr !important; gap: 60px !important; }
        }
      `}</style>

      {/* III · What this is NOT */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead num="V" ko="아닌 것 · What this is not" en="Four distinctions we insist upon" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { ko: '암호화폐 논리가 아닙니다', desc: '금은 300년 된 자산입니다. 비트코인과 비교되는 것을 거부합니다.' },
              { ko: '거래 수단이 아닙니다', desc: 'Aurum은 단타 매매를 지원하지 않습니다. 최소 보유 기간은 없지만, 매월 이체가 철학입니다.' },
              { ko: '인플레이션 헤지만은 아닙니다', desc: '금은 인플레이션이 낮을 때도 상승합니다. 실제 엔진은 통화 체제 자체에 대한 불신입니다.' },
              { ko: '상품이 아닙니다', desc: '이것은 세대 간 실물 보관 서비스입니다. 고객은 후원자이고, 관계는 영구적입니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
                <h3 style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, margin: '0 0 12px', lineHeight: 1.3 }}>
                  {item.ko}
                </h3>
                <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.75 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IV · A history in three moments */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px' }}>
        <SectionHead num="VI" ko="세 순간의 역사" en="A history in three moments" />

        <div style={{ marginTop: 40 }}>
          {[
            { year: '1985', title: 'Plaza Accord', ko: '달러 평가절하의 정책화', body: '5개국이 달러 가치를 의도적으로 낮추기 위한 합의에 서명. 통화 가치가 협상의 대상이 된 순간. 금은 이 시점부터 "정치적 약속의 외부에 있는 자산"으로서의 지위를 강화했습니다.' },
            { year: '2008', title: 'Global Financial Crisis', ko: '중앙은행이 실타래를 놓친 해', body: 'Fed가 대차대조표를 4배 확대. 양적완화가 "임시 정책"에서 "상시 도구"로 전환된 순간. 이후 모든 주요 중앙은행이 동일한 경로를 따랐습니다. 이 시점부터 중앙은행들이 서로의 국채를 덜 사고 금을 더 사기 시작했습니다.' },
            { year: '2022', title: 'Russia reserve seizure', ko: '보유고가 영구하지 않다는 학습', body: '서구는 러시아의 $3천억 달러 외환보유고를 동결. 이후 비서구 중앙은행들은 "달러 보유고도 정치적 자산"이라는 인식을 수용. 금 매입이 가속화된 기간은 정확히 이때부터입니다.' },
          ].map((moment, i) => (
            <div key={i} style={{ padding: '30px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 30, alignItems: 'start' }} className="moment-grid">
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 44, color: T.gold, fontWeight: 500, lineHeight: 1 }}>
                  {moment.year}
                </div>
                <div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD, letterSpacing: '0.04em', marginBottom: 4 }}>
                    {moment.title}
                  </div>
                  <h3 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, fontWeight: 500, margin: '0 0 14px', lineHeight: 1.25 }}>
                    {moment.ko}
                  </h3>
                  <Prose>{moment.body}</Prose>
                </div>
              </div>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 600px) { .moment-grid { grid-template-columns: 1fr !important; gap: 14px !important; } }`}</style>
      </div>

      {/* V · Photo mark */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 0' }}>
        <Photo type="mark" tag="FIG. VI — ENGRAVED MARK · 10K SOLID GOLD" caption="Gate III · patron mark detail" height={420} />
      </div>

      {/* VI · Founder note */}
      <div style={{ padding: '100px 24px 60px', maxWidth: 860, margin: '0 auto' }}>
        <SectionHead num="VII" ko="저희가 Aurum을 만든 이유" en="A note from Brian Lee · GC" />

        <div style={{ fontFamily: T.serifKr, fontSize: 20, color: T.text, lineHeight: 1.75, fontWeight: 300, margin: '0 0 22px', borderLeft: `2px solid ${T.gold}`, paddingLeft: 24 }}>
          한국 가족 오피스가 금을 보유하려 할 때 마주치는 세 가지 문제를 저희는 오래 지켜봤습니다. 20% 소매 프리미엄. 보관 장소의 불투명성. 세대 전승 구조의 부재.
        </div>

        <div style={{ fontFamily: T.serifKr, fontSize: 18, color: T.sub, lineHeight: 1.85, fontWeight: 300, margin: '0 0 22px', borderLeft: `2px solid ${T.gold}`, paddingLeft: 24 }}>
          Aurum은 세 문제를 동시에 해결하는 구조입니다. 싱가포르 FTZ로 프리미엄 제거, Malca-Amit 분배 보관으로 투명성, Founders 프로그램으로 세대 전승.
        </div>

        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16, color: T.goldD, lineHeight: 1.65, margin: '0 0 28px', borderLeft: `2px solid ${T.gold}`, paddingLeft: 24 }}>
          Not a fintech. A custody relationship built for one hundred years.
        </div>

        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.goldD, letterSpacing: '0.22em', textTransform: 'uppercase', paddingTop: 20, borderTop: `1px solid ${T.goldBorder}` }}>
          — Brian Lee · 이브라이언 · General Counsel
        </div>
      </div>

      {/* VII · CTA */}
      <div style={{ padding: '60px 24px 120px', textAlign: 'center' }}>
        <GhostCTA to="/signup">Claim your invite →</GhostCTA>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 20, letterSpacing: '0.22em' }}>
          FOUNDERS · 500 SEATS · BY INVITATION
        </div>
      </div>

      <QuietFooter />
    </>
  );
}
