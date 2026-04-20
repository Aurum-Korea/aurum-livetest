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

export default function SecurityPage() {
  return (
    <>
      <TickerBar />
      <QuietNav page="security" />

      {/* I · Hero */}
      <div style={{ padding: '100px 24px 60px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.34em', color: T.goldD, textTransform: 'uppercase', marginBottom: 28 }}>
          The security stack · 다섯 개의 층위
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(40px, 7vw, 68px)', fontWeight: 400, color: T.text, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-0.015em' }}>
          보호의 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>층위.</em>
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(18px, 2.8vw, 26px)', color: T.goldD, fontWeight: 300 }}>
          Layers of protection.
        </div>
      </div>

      {/* II · Nested ring visualization */}
      <div style={{ maxWidth: 720, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <svg viewBox="0 0 480 480" width="100%" height="auto" style={{ maxWidth: 480, animation: 'slow-pulse 6s ease-in-out infinite' }}>
            <defs>
              <radialGradient id="coreG" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#F2D4A0" />
                <stop offset="60%" stopColor="#C5A572" />
                <stop offset="100%" stopColor="#6a5a3a" />
              </radialGradient>
            </defs>
            {/* 5 nested rings · outer to inner */}
            {[
              { r: 220, label: 'LEGAL · Singapore Pte Ltd · allocated title', op: 0.25 },
              { r: 180, label: 'REGULATORY · MAS PSPM 2019', op: 0.35 },
              { r: 140, label: 'AUDIT · Brink\'s quarterly', op: 0.5 },
              { r: 100, label: 'INSURANCE · Lloyd\'s 100%', op: 0.7 },
            ].map((ring, i) => (
              <g key={i}>
                <circle cx="240" cy="240" r={ring.r} fill="none" stroke="#C5A572" strokeWidth="1" strokeDasharray="2 4" opacity={ring.op} />
              </g>
            ))}
            {/* Core · physical gold */}
            <circle cx="240" cy="240" r="60" fill="url(#coreG)" opacity="0.95" />
            <text x="240" y="240" textAnchor="middle" dominantBaseline="middle" fontFamily="'Cormorant Garamond',serif" fontStyle="italic" fontWeight="600" fontSize="25" fill="rgba(40,26,12,0.85)">Au</text>
            {/* Labels around rings */}
            <text x="240" y="40" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#8a7d6b" letterSpacing="2">LEGAL STRUCTURE</text>
            <text x="240" y="80" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#8a7d6b" letterSpacing="2">MAS · REGULATORY</text>
            <text x="240" y="120" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#C5A572" letterSpacing="2">BRINK'S · AUDIT</text>
            <text x="240" y="160" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#C5A572" letterSpacing="2">LLOYD'S · INSURANCE</text>
            <text x="240" y="330" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="11" fill="#E3C187" letterSpacing="3" fontWeight="700">PHYSICAL GOLD · 999.9</text>
            <text x="240" y="352" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#8a7d6b" letterSpacing="2">Malca-Amit FTZ · Singapore</text>
          </svg>
        </div>
        <div style={{ textAlign: 'center', fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.8, fontWeight: 300, maxWidth: 540, margin: '0 auto' }}>
          실물 금은 다섯 개의 법적·운영적 보호 층위에 둘러싸여 있습니다. 각 층은 독립적으로 작동하며, 다른 층이 실패해도 작동을 유지합니다.
        </div>
      </div>

      {/* III · Deep dive Lloyd's */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead num="I" ko="Lloyd's of London · 보험" en="Full replacement value · all risks" />

          <Prose>
            Aurum 고객의 모든 금은 Lloyd's of London 100% 보험 적용. 증서는 Malca-Amit 명의, Aurum은 beneficiary.
          </Prose>

          <div style={{ marginTop: 32, padding: 28, background: T.card, border: `1px solid ${T.goldBorder}`, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.26em', marginBottom: 20 }}>COVERAGE · 요약</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
              {[
                { k: '교체 가치', v: '100%', sub: '시가 기준 전액' },
                { k: '절도 · 공제 없음', v: '$0', sub: '즉시 보상' },
                { k: '정치적 위험', v: '포함', sub: '몰수 · 국유화 포함' },
                { k: '자연재해', v: '포함', sub: '화재 · 지진 · 홍수' },
                { k: '운송 중', v: '포함', sub: '입고 · 출고 · 인출' },
                { k: '보험사 등급', v: 'AA−', sub: 'S&P · Lloyd\'s 전체' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '14px 0', borderBottom: i < 3 ? `1px dashed ${T.border}` : 'none' }}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em', marginBottom: 6 }}>{item.k}</div>
                  <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 24, color: T.goldB, fontWeight: 500, lineHeight: 1 }}>{item.v}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, marginTop: 4, letterSpacing: '0.08em' }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>POLICY NUMBER</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text, marginTop: 2 }}>LMA·MA·SGP·2024·████████ <span style={{ color: T.muted }}>(redacted)</span></div>
              </div>
              <button onClick={() => alert('인증서 PDF · Launching Q2 2026 with real policy disclosure')} style={{ background: 'transparent', border: `1px solid ${T.goldBorder}`, color: T.gold, padding: '10px 18px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer' }}>
                CERTIFICATE PDF ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* IV · Deep dive Brink's */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px' }}>
        <SectionHead num="II" ko="Brink's · 분기 감사" en="Independent verification · every 90 days" />

        <Prose>
          Brink's는 1859년 설립, 세계 최대 귀금속 운송·감사 기업. Aurum·Malca-Amit 양측으로부터 독립된 제3자로서 분기별 실물 재검증을 수행합니다.
        </Prose>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { k: '감사 주기', v: '분기 1회', sub: '1월 · 4월 · 7월 · 10월' },
            { k: '감사 범위', v: '100%', sub: '모든 고객 바 개별 검증' },
            { k: '방식', v: '실물', sub: '무게 · 순도 · 시리얼' },
            { k: '보고 대상', v: '고객', sub: '/terminal 대시보드' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 20, background: T.card, border: `1px solid ${T.goldBorder}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em', marginBottom: 8 }}>{item.k}</div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 26, color: T.goldB, fontWeight: 500, lineHeight: 1, marginBottom: 4 }}>{item.v}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.08em' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: '14px 18px', background: T.deep, border: `1px dashed rgba(197,165,114,0.3)`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: T.mono, fontSize: 8, color: T.goldD,
            letterSpacing: '0.22em', fontWeight: 500,
            padding: '4px 10px', border: `1px dashed rgba(197,165,114,0.3)`,
          }}>
            LAUNCHING Q2 2026
          </span>
          <span style={{ fontFamily: T.sansKr, fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
            첫 번째 Brink's 감사 보고서는 2026년 Q2 이후 /terminal에서 공개됩니다.
          </span>
        </div>
      </div>

      {/* V · Deep dive MAS */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead num="III" ko="MAS · 싱가포르 규제" en="Monetary Authority of Singapore · PSPM 2019" />

          <Prose>
            Aurum Korea Pte Ltd는 싱가포르 MAS에 Precious Stones and Precious Metals Dealer로 등록 (PSPM Act 2019). 법적으로 허용되는 것과 금지되는 것이 명시됩니다.
          </Prose>

          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ background: T.card, border: `1px solid ${T.goldBorderS}`, padding: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 14 }}>할 수 있는 것</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.85 }}>
                {[
                  '고객을 위한 실물 금 매입·보관·매도',
                  'AML/CFT 규정하의 KYC 절차 수행',
                  '고객 자산을 자기 자산과 분리 보관',
                  '공인 감사 기관에 의한 감사',
                ].map((x, i) => (
                  <li key={i} style={{ paddingLeft: 18, position: 'relative', marginBottom: 8 }}>
                    <span style={{ position: 'absolute', left: 0, color: T.gold }}>+</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', marginBottom: 14 }}>할 수 없는 것</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: T.sansKr, fontSize: 13, color: T.muted, lineHeight: 1.85 }}>
                {[
                  '예금 수취 · 은행업 (Aurum은 은행이 아님)',
                  '파생상품 · 옵션 · 선물 거래 제공',
                  '고객 자산의 대출·담보 사용 (재저당 금지)',
                  '투자 자문 · 시장 전망 판매',
                ].map((x, i) => (
                  <li key={i} style={{ paddingLeft: 18, position: 'relative', marginBottom: 8 }}>
                    <span style={{ position: 'absolute', left: 0, color: T.red }}>−</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: '18px 20px', background: T.deep, border: `1px dashed ${T.goldBorder}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 8 }}>FOOTNOTE · 등록 구조</div>
            <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.75 }}>
              같은 구조를 가진 다른 싱가포르 등록 기업들: BullionStar, Silver Bullion Pte Ltd, J. Rotbart & Co. Aurum은 이들과 동일한 규제 감독 하에 운영됩니다.
            </div>
          </div>
        </div>
      </div>

      {/* VI · Photo audit */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px 0' }}>
        <Photo type="audit" tag="FIG. III — QUARTERLY AUDIT" caption="Brink's inspection · 2026 commissioned" height={340} />
      </div>

      {/* VII · Security FAQ */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 24px 100px' }}>
        <SectionHead num="IV" ko="질문에 대한 답" en="Security-specific FAQ" />

        <div style={{ marginTop: 32 }}>
          {[
            { q: 'Malca-Amit이 파산하면 어떻게 됩니까?', a: '당신의 바는 Malca-Amit의 자산이 아닙니다. 싱가포르 Companies Act § 166 하에 custodial assets로 분류되며, 보관사 파산 시 원 소유자 (당신)에게 반환됩니다. 이는 Aurum이 아닌 Malca-Amit의 법적 책임입니다.' },
            { q: 'Aurum이 파산하면 어떻게 됩니까?', a: '마찬가지입니다. Aurum의 고객 자산은 Aurum 대차대조표상 "custodial"로 분류되어 자사 자산과 분리됩니다. Aurum이 해체되면 고객은 Malca-Amit과 직접 연결되거나 다른 사업자로 이관할 수 있습니다. MAS에 사전 등록된 복구 계획이 있습니다.' },
            { q: '싱가포르 정부가 금을 압수할 수 있습니까?', a: '싱가포르는 1965년 독립 이후 개인 귀금속 자산의 압수·국유화 사례가 없습니다. 역사적으로 이런 조치는 공식 전쟁·비상사태 상황에서만 가능하며, FTZ 자산은 특히 법적으로 싱가포르 영토 외부로 간주됩니다. 또한 Lloyd\'s 보험은 정치적 위험을 포함합니다.' },
            { q: '전쟁이 나면 어떻게 됩니까?', a: '싱가포르는 정치적 중립국이고 최근 70년간 국가 단위 분쟁을 겪은 적이 없습니다. 그러나 최악의 시나리오에서도 Lloyd\'s 전쟁 위험 보험이 적용됩니다. 또한 Aurum은 고객의 선택에 따라 보관지 분산 (싱가포르 + 취리히) 옵션을 Gate V 이상 후원자에게 제공합니다.' },
            { q: '금은 얼마나 자주 실물로 검증됩니까?', a: '분기 1회 Brink\'s 감사 + 연 1회 Malca-Amit 내부 감사 = 연간 5회 독립 검증. 각 검증은 전체 Aurum 보유량에 대해 개별 바 단위로 시리얼·무게·순도를 확인합니다. Gate IV 이상 후원자는 본인 바를 직접 볼 수 있습니다.' },
          ].map((item, i) => (
            <details key={i} style={{ borderBottom: `1px solid ${T.border}`, padding: '20px 0' }}>
              <summary style={{ fontFamily: T.serifKr, fontSize: 18, color: T.text, fontWeight: 500, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                <span>{item.q}</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.gold, flexShrink: 0 }}>+</span>
              </summary>
              <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.85, marginTop: 16, maxWidth: 720 }}>
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* VIII · Downloads */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead num="V" ko="문서 · Downloads" en="Public certificates" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 24 }}>
            {[
              { k: "Lloyd's certificate", sub: 'Insurance policy · redacted', size: '2.1 MB · PDF' },
              { k: 'MAS registration', sub: 'PSPM 2019 · Aurum Korea Pte Ltd', size: '0.8 MB · PDF' },
              { k: 'Sample audit report', sub: "Brink's · Q2 2025 · template", size: '3.4 MB · PDF', badge: true },
              { k: 'Malca-Amit custody', sub: 'Service agreement · redacted', size: '1.6 MB · PDF' },
            ].map((doc, i) => (
              <div key={i} style={{ padding: 20, background: T.card, border: `1px solid ${T.goldBorder}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontFamily: T.serifKr, fontSize: 15, color: T.text, fontWeight: 500, lineHeight: 1.3 }}>{doc.k}</div>
                  {doc.badge && (
                    <span style={{
                      fontFamily: T.mono, fontSize: 7, color: T.goldD,
                      letterSpacing: '0.22em', fontWeight: 500,
                      padding: '2px 6px', border: `1px dashed rgba(197,165,114,0.3)`, whiteSpace: 'nowrap',
                    }}>Q2 2026</span>
                  )}
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.5, marginBottom: 12 }}>{doc.sub}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em' }}>{doc.size}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.14em' }}>DOWNLOAD ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IX · CTA */}
      <div style={{ padding: '100px 24px 120px', textAlign: 'center' }}>
        <GhostCTA to="/signup">Claim your invite →</GhostCTA>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 20, letterSpacing: '0.22em' }}>
          FOUNDERS · 500 SEATS · BY INVITATION
        </div>
      </div>

      <QuietFooter />
    </>
  );
}
