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

export default function VaultPage() {
  return (
    <>
      <TickerBar />
      <QuietNav page="vault" />

      {/* I · Hero */}
      <div style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.34em', color: T.goldD, textTransform: 'uppercase' }}>
          Est. MMXXIV · Malca-Amit FTZ · Changi
        </div>
      </div>

      <div style={{ padding: '0 24px 80px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 400, color: T.text, lineHeight: 1.2, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
          금은 어디에 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>있습니까?</em>
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 'clamp(18px, 2.5vw, 24px)', color: T.goldD, fontWeight: 300 }}>
          Where does the gold live?
        </div>
      </div>

      {/* II · Photo corridor */}
      <div style={{ maxWidth: 1180, margin: '0 auto 80px', padding: '0 24px' }}>
        <Photo type="corridor" tag="FIG. I — MALCA-AMIT FTZ · CHANGI" caption="vault corridor · commissioned photography" />
      </div>

      {/* III · The address */}
      <div style={{ maxWidth: 860, margin: '0 auto 100px', padding: '0 24px' }}>
        <SectionHead num="I" ko="주소 · The address" en="Why Singapore. Why Changi." />

        <Prose>
          실물 금은 싱가포르 Malca-Amit Free Trade Zone (FTZ)에 보관됩니다. FTZ는 법적으로 국가 영토 밖의 공간 — VAT 없음, 관세 없음, 국가 간 자산으로 취급됩니다.
        </Prose>

        <Prose>
          싱가포르인 이유: MAS는 LBMA와 동등한 귀금속 감독 표준을 적용합니다. 70년간 자본 몰수 이력 없음. LBMA 정제소에서 배송 3일 이내. Malca-Amit은 1963년 스위스 설립, 창이 공항에 3,000평 볼트 운영. 전 세계 주요 은행·정부·가족 오피스가 같은 시설을 사용합니다.
        </Prose>
      </div>

      {/* IV · Allocated vs Unallocated */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '100px 24px', marginBottom: 0 }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <SectionHead num="II" ko="분배 보관 vs 통합 보관" en="Allocated vs Unallocated · the single most important distinction" />

          <Prose>
            금 보관에는 두 가지 방식이 있으며, 그 차이는 법적 소유권의 차이입니다. Aurum은 오직 분배 보관 (allocated) 방식만 사용합니다.
          </Prose>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 40 }}>
            {/* Allocated */}
            <div style={{ background: T.card, border: `1px solid ${T.goldBorderS}`, padding: 28, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.goldB}, transparent)` }} />
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.24em', marginBottom: 12 }}>AURUM · 분배 보관</div>
              <h3 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, fontWeight: 500, margin: '0 0 16px', lineHeight: 1.2 }}>
                당신의 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.goldB, fontWeight: 500 }}>고유한 바</em>
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.8 }}>
                <li style={{ paddingLeft: 18, position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.gold }}>+</span>
                  시리얼 번호가 찍힌 바에 고객 이름 명시
                </li>
                <li style={{ paddingLeft: 18, position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.gold }}>+</span>
                  Aurum 장부와 법적으로 분리된 자산
                </li>
                <li style={{ paddingLeft: 18, position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.gold }}>+</span>
                  Aurum 파산 시에도 고객 소유권 유지
                </li>
                <li style={{ paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: T.gold }}>+</span>
                  분기별 Brink's 감사로 실재 확인
                </li>
              </ul>
            </div>

            {/* Unallocated */}
            <div style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: 28 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.24em', marginBottom: 12 }}>은행 통장 · 통합 보관</div>
              <h3 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.muted, fontWeight: 500, margin: '0 0 16px', lineHeight: 1.2 }}>
                종이 위의 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.red, fontWeight: 400 }}>약속</em>
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: T.sansKr, fontSize: 14, color: T.muted, lineHeight: 1.8 }}>
                <li style={{ paddingLeft: 18, position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.red }}>−</span>
                  공동 풀의 지분만 보유 · 특정 바 없음
                </li>
                <li style={{ paddingLeft: 18, position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.red }}>−</span>
                  은행 대차대조표상의 채권에 해당
                </li>
                <li style={{ paddingLeft: 18, position: 'relative', marginBottom: 10 }}>
                  <span style={{ position: 'absolute', left: 0, color: T.red }}>−</span>
                  은행 파산 시 일반 채권자와 동등 순위
                </li>
                <li style={{ paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: T.red }}>−</span>
                  실제 금의 10배 이상 발행된다는 보고 존재
                </li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 40, padding: '20px 24px', background: T.deep, border: `1px dashed ${T.goldBorder}`, maxWidth: 720 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 8 }}>FOOTNOTE · 1968 런던 금풀 사건</div>
            <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.75 }}>
              1968년, 8개 중앙은행이 운영한 "런던 금풀"이 붕괴했습니다. 종이상 청구권보다 실제 금이 현저히 부족했기 때문입니다. 그 이후로 전 세계 가족 오피스는 분배 보관만을 신뢰합니다.
            </div>
          </div>
        </div>
      </div>

      {/* V · Photo bars */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px 0' }}>
        <Photo type="bars" tag="FIG. II — ALLOCATED STORAGE" caption="1kg cast bars · each serialized" height={360} />
      </div>

      {/* VI · Chain of custody */}
      <div style={{ maxWidth: 860, margin: '0 auto 100px', padding: '60px 24px 0' }}>
        <SectionHead num="III" ko="보관의 사슬 · Chain of custody" en="From refiner to your name · four steps" />

        <div style={{ marginTop: 40 }}>
          {[
            { n: '01', ko: 'LBMA 정제소 출하', en: 'LBMA refiner shipment', desc: 'PAMP · Argor-Heraeus · Valcambi 등 LBMA 인증 정제소에서 순도 999.9 바 출하. 시리얼 번호와 정제 증명서 동봉.' },
            { n: '02', ko: 'Malca-Amit 입고', en: 'Malca-Amit intake', desc: '싱가포르 창이 FTZ 도착 → 무게 측정, 순도 재확인, 시리얼 기록 → Aurum 할당 섹션에 배치.' },
            { n: '03', ko: '고객 할당', en: 'Customer allocation', desc: '바 시리얼 번호가 고객 이름에 영구 연결. Aurum 대차대조표상 "custodial assets" — 자사 자산이 아닌 고객 자산으로 분리 기재.' },
            { n: '04', ko: '분기 감사', en: 'Quarterly audit', desc: "Brink's가 분기마다 독립 실물 검증. 감사 보고서는 /terminal 대시보드에 고객별로 공개." },
          ].map((step, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 24, padding: '24px 0', borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 36, color: T.gold, fontWeight: 500, lineHeight: 1 }}>{step.n}</div>
              <div>
                <div style={{ fontFamily: T.serifKr, fontSize: 18, color: T.text, fontWeight: 500, marginBottom: 4 }}>{step.ko}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD, marginBottom: 10 }}>{step.en}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 14, color: T.sub, lineHeight: 1.75 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VII · Access */}
      <div style={{ background: T.bg1, borderTop: `1px solid ${T.border}`, padding: '100px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <SectionHead num="IV" ko="접근 · Access" en="Who sees what · the security policy" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { who: '모든 후원자', whoEn: 'All patrons', what: '분기 Brink\'s 감사 보고서 · 시리얼 단위 소유권 증명서 · 사진 업데이트' },
              { who: 'Gate IV 후원자', whoEn: 'Gate IV+', what: '연 1회 현장 방문. 자신의 바를 직접 확인. 비공개 만찬. Aurum 경비.' },
              { who: '일반 방문자', whoEn: 'Walk-in', what: '불가. Malca-Amit 보안 정책상 사전 승인 없이는 어떤 경우에도 입장 불가.' },
            ].map((item, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.goldBorder}`, padding: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
                <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, marginBottom: 4 }}>{item.who}</div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 12, color: T.goldD, marginBottom: 14 }}>{item.whoEn}</div>
                <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.7 }}>{item.what}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIII · Photo audit */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px 0' }}>
        <Photo type="audit" tag="FIG. III — QUARTERLY AUDIT" caption="Brink's · independent verification" height={340} />
      </div>

      {/* IX · What if Aurum disappears */}
      <div style={{ maxWidth: 720, margin: '0 auto 60px', padding: '60px 24px 0', textAlign: 'center' }}>
        <SectionHead num="V" ko="Aurum이 사라진다면" en="What if Aurum shuts down?" />

        <Prose>
          당신의 바는 Malca-Amit에 있고, Aurum의 자산이 아닌 당신의 자산입니다. 싱가포르 법률상 custodial assets는 사업자 파산 시 원 소유자에게 반환됩니다. Aurum이 해체되면 Malca-Amit과 직접 연결하거나 다른 사업자에게 이관 — MAS에 사전 등록된 복구 계획의 일부입니다.
        </Prose>
      </div>

      {/* X · CTA */}
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
