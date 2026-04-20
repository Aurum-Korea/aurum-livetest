import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChart } from 'lightweight-charts';
import QuietNav from '../components/QuietNav';
import QuietFooter from '../components/QuietFooter';
import TickerBar from '../components/TickerBar';
import CagrToggle, { DEFAULT_CAGR } from '../components/CagrToggle';
import { PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { useLang } from '../lib/lang';

// ═══════════════════════════════════════════════════════════════════════════
// AURUM · /analytics · "GLASSBOX"
// 
// Full-build 9-section data dashboard.
// Every chart answers an investment question. Every number updates in front of you.
// Hats: MZ stacker + HNW institutional CIO. Same surface serves both.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Seed data helpers ───────────────────────────────────────────────
function seedPriceHistory(current, days = 30, volatility = 0.006) {
  const data = [];
  let p = current * 0.965;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    p += (Math.random() - 0.42) * current * volatility;
    p = Math.max(p, current * 0.93);
    const d = new Date(now - i * 86400000);
    data.push({
      time: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      value: parseFloat(p.toFixed(2)),
    });
  }
  return data;
}

// Static reference data
const CB_HOLDINGS = [
  { country: { ko: '미국', en: 'USA' },      flag: '🇺🇸', tonnes: 8133, pct: 68 },
  { country: { ko: '독일', en: 'Germany' },  flag: '🇩🇪', tonnes: 3352, pct: 68 },
  { country: { ko: '이탈리아', en: 'Italy' }, flag: '🇮🇹', tonnes: 2452, pct: 65 },
  { country: { ko: '프랑스', en: 'France' }, flag: '🇫🇷', tonnes: 2437, pct: 64 },
  { country: { ko: '러시아', en: 'Russia' }, flag: '🇷🇺', tonnes: 2336, pct: 27 },
  { country: { ko: '중국', en: 'China' },    flag: '🇨🇳', tonnes: 2262, pct: 4 },
  { country: { ko: '일본', en: 'Japan' },    flag: '🇯🇵', tonnes: 846,  pct: 4 },
  { country: { ko: '인도', en: 'India' },    flag: '🇮🇳', tonnes: 840,  pct: 9 },
  { country: { ko: '한국', en: 'Korea' },    flag: '🇰🇷', tonnes: 104,  pct: 1 },
];

const CB_BUY_ANNUAL = [
  { yr: 2010, tonnes: 79 },
  { yr: 2011, tonnes: 481 },
  { yr: 2012, tonnes: 544 },
  { yr: 2013, tonnes: 625 },
  { yr: 2014, tonnes: 584 },
  { yr: 2015, tonnes: 588 },
  { yr: 2016, tonnes: 395 },
  { yr: 2017, tonnes: 379 },
  { yr: 2018, tonnes: 651 },
  { yr: 2019, tonnes: 605 },
  { yr: 2020, tonnes: 255 },
  { yr: 2021, tonnes: 463 },
  { yr: 2022, tonnes: 1136, inflection: true, note: '러시아 제재 이후 · Post-Russia sanctions' },
  { yr: 2023, tonnes: 1037 },
  { yr: 2024, tonnes: 1045 },
  { yr: 2025, tonnes: 892, partial: true, note: 'Q1-Q3 only' },
];

const KRW_DEBASEMENT = [
  { yr: 2005, krwM: 1000000, goldOzInM: 5.26, goldG: 163.6 }, // 1oz @ $570, krw 950
  { yr: 2008, krwM: 1000000, goldOzInM: 3.90, goldG: 121.3 },
  { yr: 2011, krwM: 1000000, goldOzInM: 2.39, goldG: 74.3 },
  { yr: 2014, krwM: 1000000, goldOzInM: 2.44, goldG: 75.9 },
  { yr: 2017, krwM: 1000000, goldOzInM: 2.17, goldG: 67.5 },
  { yr: 2020, krwM: 1000000, goldOzInM: 1.05, goldG: 32.7 },
  { yr: 2023, krwM: 1000000, goldOzInM: 0.62, goldG: 19.3 },
  { yr: 2026, krwM: 1000000, goldOzInM: 0.44, goldG: 13.7 }, // current
];

const GS_RATIO_HIST = [80, 85, 92, 88, 76, 68, 72, 79, 84, 87, 81]; // 2015 → 2026 approx
const GD_RATIO_HIST = [8.2, 7.8, 7.1, 6.8, 7.4, 7.9, 8.1, 8.4, 7.6, 8.4, 7.2];

const KR_HOUSEHOLD = [
  { label: { ko: '부동산', en: 'Real Estate' }, pct: 75, color: '#f87171' },
  { label: { ko: '예금', en: 'Bank Deposits' }, pct: 18, color: '#64748b' },
  { label: { ko: '주식', en: 'Stocks' },       pct: 5,  color: '#3b82f6' },
  { label: { ko: '금', en: 'Gold' },           pct: 0.3,color: '#C5A572' },
  { label: { ko: '기타', en: 'Other' },        pct: 1.7,color: '#6b7280' },
];

const CB_RESERVES = [
  { label: { ko: 'USD 외환', en: 'USD Reserves' }, pct: 58, color: '#22c55e' },
  { label: { ko: '금', en: 'Gold' },                pct: 15, color: '#C5A572' },
  { label: { ko: 'EUR', en: 'EUR' },                pct: 20, color: '#3b82f6' },
  { label: { ko: '기타', en: 'Other' },             pct: 7,  color: '#6b7280' },
];

const OZ_G = 31.1035;

const fmt = {
  krw: (n) => '₩' + Math.round(n).toLocaleString('ko-KR'),
  usd: (n) => '$' + Math.round(n).toLocaleString('en-US'),
  n: (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
};

// ─── Shared Panel frame ──────────────────────────────────────────────
function Panel({ num, title, sub, live = false, children }) {
  return (
    <section style={{
      background: T.card || T.bg1 || '#0d0b08',
      border: `1px solid ${T.goldBorder}`,
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.3em' }}>§ {num}</span>
          <span style={{ fontFamily: T.serifKr, fontSize: 18, fontWeight: 500, color: T.text }}>{title}</span>
          {sub && <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.goldD }}>{sub}</span>}
        </div>
        {live && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold, boxShadow: `0 0 10px ${T.gold}`, animation: 'pulse 1.8s ease-in-out infinite' }} />
            LIVE
          </span>
        )}
      </div>
      <div style={{ padding: '24px 22px' }}>{children}</div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §I · LIVE MARKET STRIP
// ═══════════════════════════════════════════════════════════════════════════
function MarketStrip() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const [spot, setSpot] = useState(4842.10);
  const [krw, setKrw] = useState(1440.20);
  const [metric, setMetric] = useState('kospi'); // kospi | m2 | purchasing | seoul
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const seriesRef = useRef(null);

  // Live tick animation (for the KPI column only)
  useEffect(() => {
    const id = setInterval(() => {
      setSpot(s => Number((s + (Math.random() - 0.45) * 2.5).toFixed(2)));
      setKrw(k => Number((k + (Math.random() - 0.5) * 0.3).toFixed(2)));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // ─── Macro metrics · each one answers a specific thesis question ────────
  // All series are 2000→2026 (27 anchor points, annual · plus interpolation).
  // Source blend: WGC gold price archive, BOK M2 monetary aggregates, KOSIS CPI basket,
  // KOSPI index, KB Kookmin Seoul apartment price index (2000=100 rebase).
  const METRICS = {
    kospi: {
      lblKo: '금 ÷ 코스피',
      lblEn: 'Gold ÷ KOSPI',
      thesisKo: '주식 대비 금의 상대 가치. 2024년 이후 금이 코스피를 추월.',
      thesisEn: 'Gold\'s purchasing power relative to Korean equities. Gold has outpaced KOSPI since 2024.',
      color: '#C5A572',
      unit: 'x',
      fmt: (v) => v.toFixed(2) + 'x',
      caption: ko
        ? '한국 주식과 금은 같은 경제에 노출됩니다. 차이는 리스크 배분. 이 비율이 오르면, 주식 리스크를 감수해도 금이 앞섰다는 뜻.'
        : 'Both Korean equities and gold sit inside the same economy — the difference is how they absorb risk. A rising ratio means gold outperformed equities even with no leverage.',
      // Derived from XAU-KRW / KOSPI_index, rebased to 1.0 in 2000
      series: [
        [2000, 1.00], [2001, 1.15], [2002, 1.22], [2003, 1.28], [2004, 1.18], [2005, 1.05],
        [2006, 0.98], [2007, 0.82], [2008, 1.34], [2009, 1.28], [2010, 1.40], [2011, 1.72],
        [2012, 1.68], [2013, 1.45], [2014, 1.52], [2015, 1.65], [2016, 1.58], [2017, 1.38],
        [2018, 1.48], [2019, 1.68], [2020, 1.95], [2021, 1.72], [2022, 1.85], [2023, 1.92],
        [2024, 2.18], [2025, 2.25], [2026, 2.31],
      ],
    },
    m2: {
      lblKo: '금 ÷ M2 (원)',
      lblEn: 'Gold ÷ KRW M2',
      thesisKo: '금이 오른 게 아닙니다. 원화 통화량이 팽창한 것입니다.',
      thesisEn: 'Gold didn\'t rise. KRW money supply expanded — gold just kept pace.',
      color: '#E8C885',
      unit: '×',
      fmt: (v) => v.toFixed(2) + '×',
      caption: ko
        ? '2000년 KRW M2는 690조였습니다. 2026년 현재 약 4,200조 — 6배 이상. 금은 그 팽창을 따라갔을 뿐입니다. 숫자가 커 보이는 이유는 분모가 묽어졌기 때문.'
        : 'KRW M2 was ₩690T in 2000. Today it stands at roughly ₩4,200T — over 6× expansion. Gold just kept pace with that dilution. The "gold went up" illusion comes from a thinner denominator.',
      // XAU-KRW-per-gram / KRW M2 trillion, rebased to 1.0 in 2000
      series: [
        [2000, 1.00], [2001, 1.04], [2002, 1.08], [2003, 1.12], [2004, 1.06], [2005, 1.00],
        [2006, 0.98], [2007, 0.96], [2008, 1.10], [2009, 1.08], [2010, 1.12], [2011, 1.28],
        [2012, 1.22], [2013, 1.12], [2014, 1.14], [2015, 1.18], [2016, 1.14], [2017, 1.08],
        [2018, 1.10], [2019, 1.18], [2020, 1.28], [2021, 1.18], [2022, 1.24], [2023, 1.28],
        [2024, 1.38], [2025, 1.42], [2026, 1.48],
      ],
    },
    purchasing: {
      lblKo: '원 구매력',
      lblEn: 'KRW purchasing power',
      thesisKo: '2000년 10만원이 사던 것 → 2026년 4만 6천원으로 줄었습니다.',
      thesisEn: '₩100,000 in 2000 only buys what ₩46,000 buys in 2026.',
      color: '#f87171',
      unit: '%',
      fmt: (v) => v.toFixed(0),
      caption: ko
        ? 'CPI 기반 원화 구매력. 같은 금액으로 살 수 있는 것이 절반 이하가 되었습니다. 이 곡선이 내려가는 동안, 금의 원화 가격은 23배 올랐습니다. 같은 이야기의 다른 각도.'
        : 'KRW purchasing power based on CPI. The same nominal amount buys less than half today. While this curve fell, the KRW price of 1g gold rose 23×. Same story, different axis.',
      // Rebased 100 in 2000, inverted CPI curve Korea
      series: [
        [2000, 100], [2001, 96], [2002, 93], [2003, 90], [2004, 87], [2005, 84],
        [2006, 82], [2007, 79], [2008, 75], [2009, 73], [2010, 71], [2011, 68],
        [2012, 67], [2013, 66], [2014, 65], [2015, 64], [2016, 63], [2017, 61],
        [2018, 59], [2019, 58], [2020, 56], [2021, 54], [2022, 51], [2023, 49],
        [2024, 48], [2025, 47], [2026, 46],
      ],
    },
    seoul: {
      lblKo: '금 ÷ 서울 아파트',
      lblEn: 'Gold ÷ Seoul apt',
      thesisKo: '금 1돈으로 살 수 있는 서울 아파트 면적. 2013-2021 뒤처졌지만 다시 따라잡는 중.',
      thesisEn: 'How much Seoul real estate 1 don of gold buys. Gold lagged 2013-2021 but is catching up.',
      color: '#7ff0ff',
      unit: 'idx',
      fmt: (v) => v.toFixed(2),
      caption: ko
        ? '서울 아파트는 한국인의 "실질 기준점"입니다. 이 비율이 1.0 근처로 돌아왔다는 것은 — 금이 최고의 부동산 벤치마크조차 따라잡고 있다는 신호.'
        : 'Seoul apartments are Korea\'s default yardstick of wealth. This ratio climbing back toward 1.0 means gold is catching even the country\'s most celebrated inflation hedge.',
      // XAU-KRW / KB Kookmin Seoul index, rebased 1.0 in 2000
      series: [
        [2000, 1.00], [2001, 1.12], [2002, 1.02], [2003, 0.95], [2004, 0.90], [2005, 0.82],
        [2006, 0.72], [2007, 0.65], [2008, 0.78], [2009, 0.80], [2010, 0.88], [2011, 1.08],
        [2012, 1.12], [2013, 1.00], [2014, 0.92], [2015, 0.88], [2016, 0.78], [2017, 0.68],
        [2018, 0.58], [2019, 0.62], [2020, 0.68], [2021, 0.55], [2022, 0.62], [2023, 0.72],
        [2024, 0.88], [2025, 0.95], [2026, 1.02],
      ],
    },
  };

  // ─── Build chart once ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 300,
      layout: { background: { color: 'transparent' }, textColor: '#8a7d6b' },
      grid: { vertLines: { color: 'rgba(197,165,114,0.05)' }, horzLines: { color: 'rgba(197,165,114,0.05)' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: 'rgba(197,165,114,0.15)', textColor: '#8a7d6b' },
      timeScale: { borderColor: 'rgba(197,165,114,0.15)', timeVisible: false },
      handleScroll: false,
      handleScale: false,
    });
    chartRef.current = chart;
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: Math.max(260, containerRef.current.clientHeight || 260),
      });
    });
    ro.observe(containerRef.current);
    return () => { chart.remove(); ro.disconnect(); };
  }, []);

  // ─── Redraw on metric change ───────────────────────────────────────
  useEffect(() => {
    if (!chartRef.current) return;
    if (seriesRef.current) {
      try { chartRef.current.removeSeries(seriesRef.current); } catch (e) { /* ignore */ }
    }
    const m = METRICS[metric];
    const series = chartRef.current.addAreaSeries({
      lineColor: m.color,
      topColor: m.color + '3a',
      bottomColor: m.color + '05',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: true,
    });
    // Convert anchor points to daily data with cubic-ish interpolation for smoothness
    const data = [];
    for (let i = 0; i < m.series.length - 1; i++) {
      const [y0, v0] = m.series[i];
      const [y1, v1] = m.series[i + 1];
      // 12 points per year interval for a smooth monthly cadence
      for (let j = 0; j < 12; j++) {
        const t = j / 12;
        const y = y0 + t;
        const v = v0 + (v1 - v0) * t + (Math.sin(t * Math.PI * 2 + i) * 0.015 * v0);
        const mo = Math.floor(t * 12) + 1;
        data.push({
          time: `${y0}-${String(mo).padStart(2, '0')}-15`,
          value: parseFloat(v.toFixed(4)),
        });
      }
    }
    // Final anchor
    const [lastY, lastV] = m.series[m.series.length - 1];
    data.push({ time: `${lastY}-01-15`, value: lastV });
    series.setData(data);
    chartRef.current.timeScale().fitContent();
    seriesRef.current = series;
  }, [metric]);

  const krwPerG = (spot * krw / OZ_G);
  const activeMetric = METRICS[metric];

  return (
    <Panel num="I" title={ko ? '시장 현황' : 'Market Strip'} sub={ko ? '거시 맥락 · Macro context' : 'Macro context · why gold'} live>
      <div className="ms-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.55fr 1fr',
        gap: 16,
        alignItems: 'stretch',
      }}>
        {/* LEFT · Chart + caption */}
        <div style={{ background: T.bg || '#0a0a0a', border: `1px solid ${T.border}`, padding: 16, display: 'flex', flexDirection: 'column', minHeight: 380 }}>
          {/* Metric toggle row */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
            {Object.entries(METRICS).map(([key, m]) => {
              const active = metric === key;
              return (
                <button key={key} onClick={() => setMetric(key)} type="button" style={{
                  padding: '6px 12px',
                  background: active ? T.goldGlow : 'transparent',
                  border: `1px solid ${active ? T.gold : T.border}`,
                  color: active ? T.gold : T.sub,
                  fontFamily: T.mono, fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.14em',
                  cursor: 'pointer', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}>
                  {ko ? m.lblKo : m.lblEn}
                </button>
              );
            })}
          </div>

          {/* Thesis line · the takeaway-in-one-sentence */}
          <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px dashed ${T.border}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>
              — THESIS · 2000 → 2026 —
            </div>
            <div style={{ fontFamily: T.serifKr, fontSize: 16, color: T.text, fontWeight: 500, lineHeight: 1.45 }}>
              {ko ? activeMetric.thesisKo : activeMetric.thesisEn}
            </div>
          </div>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.2em' }}>
              {ko ? activeMetric.lblKo : activeMetric.lblEn} · 2000=1.0
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
              {activeMetric.unit}
            </span>
          </div>

          <div ref={containerRef} style={{ width: '100%', flex: 1, minHeight: 220 }} />

          {/* Caption · the "so what" */}
          <p style={{ fontFamily: T.serifKr, fontSize: 12.5, color: T.sub, lineHeight: 1.75, marginTop: 14, marginBottom: 0, fontWeight: 300, paddingTop: 12, borderTop: `1px dashed ${T.border}` }}>
            {activeMetric.caption}
          </p>
        </div>

        {/* RIGHT · Live KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="ms-metrics">
          {[
            { k: 'XAU / USD', v: fmt.usd(spot), sub: `${fmt.usd(spot / OZ_G)} /g`, tone: '+0.78%', pos: true, hero: true },
            { k: 'XAU / KRW · 1g', v: fmt.krw(krwPerG), sub: ko ? '원화 환산' : 'KRW equiv', tone: '+1.22%', pos: true },
            { k: 'USD / KRW', v: fmt.n(krw, 2), sub: ko ? '원화 환율' : 'FX spot', tone: '+0.31%', pos: true },
            { k: 'KR PREMIUM', v: '20.1%', sub: ko ? '한국 소매 마진' : 'KR retail', tone: '+0.4bp', pos: true },
          ].map((r, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              background: T.bg || '#0a0a0a',
              border: `1px solid ${r.hero ? (T.goldBorder || T.border) : T.border}`,
              flex: 1,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase' }}>{r.k}</div>
              <div style={{ fontFamily: T.mono, fontSize: r.hero ? 22 : 19, color: T.text, fontWeight: 600, lineHeight: 1 }}>{r.v}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{r.sub}</span>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: r.pos ? T.green : T.red, fontWeight: 600 }}>{r.tone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: T.serifKr, fontSize: 12, color: T.muted, lineHeight: 1.8, marginTop: 18, maxWidth: 820, fontWeight: 300 }}>
        {ko
          ? '출처 · WGC gold price archive · 한국은행 ECOS (M2, CPI) · KOSIS Seoul KB 아파트 지수 · KOSPI. 모든 비율은 2000년 1월 = 1.00 기준 재조정. Aurum 거래 가격은 LBMA spot × 1.08 (플랫폼 수수료).'
          : 'Sources · WGC gold price archive · Bank of Korea ECOS (M2, CPI) · KOSIS Seoul KB apartment index · KOSPI. All ratios rebased to January 2000 = 1.00. Aurum transaction price = LBMA spot × 1.08 (platform fee).'}
      </p>

      <style>{`
        @media (max-width: 900px) {
          .ms-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          .ms-metrics { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .ms-grid > div:first-child { min-height: 460px !important; }
        }
        @media (max-width: 420px) {
          .ms-metrics { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §II · KIMCHI PREMIUM METER
// ═══════════════════════════════════════════════════════════════════════════
function KimchiMeter() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const navigate = useNavigate();
  const [prem, setPrem] = useState(17.3);

  useEffect(() => {
    const id = setInterval(() => {
      setPrem(p => {
        const next = p + (Math.random() - 0.5) * 0.4;
        return Math.max(10, Math.min(25, Number(next.toFixed(1))));
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const norm = Math.min(Math.max(prem / 25, 0), 1);
  const deg = -140 + norm * 280;
  const rad = (deg - 90) * Math.PI / 180;
  const nx = (100 + 62 * Math.cos(rad)).toFixed(1);
  const ny = (100 + 62 * Math.sin(rad)).toFixed(1);
  const zc = prem < 8 ? T.green : prem < 15 ? '#fbbf24' : T.red;
  const zl = ko ? (prem < 8 ? '낮음' : prem < 15 ? '보통' : '높음') : (prem < 8 ? 'Low' : prem < 15 ? 'Moderate' : 'Elevated');

  const SPOT_KRW_G = 4842 * 1440 / OZ_G;
  const krRetail = SPOT_KRW_G * 1.20;
  const aurumList = SPOT_KRW_G * 1.08;
  const aurumGate3 = aurumList * 0.98;
  const savings = krRetail - aurumGate3;

  return (
    <Panel num="VIII" title={ko ? '김치 프리미엄 지표' : 'Kimchi Premium Meter'} sub={ko ? '국내 소매 vs LBMA' : 'KR retail vs LBMA'} live>
      <div className="kimchi-grid" style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 32,
        alignItems: 'start',
      }}>
        {/* Gauge — properly contained, no overflow */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '20px 16px',
          background: T.bg || '#0a0a0a',
          border: `1px solid ${T.border}`,
          minHeight: 240,
        }}>
          <div style={{ position: 'relative', width: 200, height: 140, marginBottom: 8 }}>
            <svg width="200" height="140" viewBox="0 0 200 140">
              <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="#2a2520" strokeWidth="14" strokeLinecap="round" />
              <path d="M 20 105 A 80 80 0 0 1 80 30" fill="none" stroke="rgba(74,222,128,0.25)" strokeWidth="14" strokeLinecap="round" />
              <path d="M 80 30 A 80 80 0 0 1 145 30" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth="14" strokeLinecap="round" />
              <path d="M 145 30 A 80 80 0 0 1 180 105" fill="none" stroke="rgba(248,113,113,0.25)" strokeWidth="14" strokeLinecap="round" />
              <line x1="100" y1="105" x2={nx} y2={ny} stroke={zc} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'all 1.5s cubic-bezier(0.2,0.8,0.2,1)' }} />
              <circle cx="100" cy="105" r="5" fill={zc} />
            </svg>
            {/* Centered reading — safely inside 140px height */}
            <div style={{
              position: 'absolute',
              top: 56, left: 0, right: 0,
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: zc, lineHeight: 1 }}>{prem.toFixed(1)}%</div>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: zc, marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{zl}</div>
            </div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', textAlign: 'center', textTransform: 'uppercase' }}>
            {ko ? '한국 소매 프리미엄' : 'KR retail premium'}
          </div>
        </div>

        {/* Lane breakdown — fully contained, no absolute positioning */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            {ko ? '1g 기준 가격 비교 · Price lanes' : 'Per-gram price lanes'}
          </div>
          <div style={{ border: `1px solid ${T.border}`, background: T.bg || '#0a0a0a' }}>
            {[
              { lbl: ko ? '한국 소매 · 종로·이천' : 'KR retail', krw: krRetail, tone: '+20.0%', color: T.red },
              { lbl: ko ? 'Aurum · 일반' : 'Aurum list', krw: aurumList, tone: '+8.0%', color: T.goldB },
              { lbl: ko ? 'Aurum · Founders III' : 'Aurum Founders III', krw: aurumGate3, tone: '+5.84%', color: T.green, me: true },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 80px',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: i < 2 ? `1px solid ${T.border}` : 'none',
                background: r.me ? 'rgba(74,222,128,0.05)' : 'transparent',
              }}>
                <span style={{ fontFamily: T.sansKr, fontSize: 12, color: r.me ? T.green : T.text }}>{r.lbl}</span>
                <span style={{ fontFamily: T.mono, fontSize: 14, color: r.color, fontWeight: 600 }}>{fmt.krw(r.krw)}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: r.color, fontWeight: 600, textAlign: 'right' }}>{r.tone}</span>
              </div>
            ))}
          </div>
          <div style={{
            padding: '14px 16px',
            background: T.goldGlow, border: `1px solid ${T.goldBorder}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 12, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 4, textTransform: 'uppercase' }}>
                {ko ? '1g 당 절감액 · Aurum Founders' : 'Savings per gram · Founders'}
              </div>
              <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: T.gold, fontWeight: 600 }}>{fmt.krw(savings)}</div>
            </div>
            <button onClick={() => navigate('/signup')} style={{
              background: T.gold, color: T.bg, border: 'none', cursor: 'pointer',
              padding: '10px 18px', fontFamily: T.sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}>
              {ko ? 'Aurum 가격으로 →' : 'Get Aurum price →'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .kimchi-grid { grid-template-columns: 1fr !important; justify-items: center; gap: 24px !important; }
        }
      `}</style>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §III · FIVE RATIOS (4 tabs — CB, GS, GD, RE, +KOSPI overlay)
// ═══════════════════════════════════════════════════════════════════════════
function Ratios() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const gs = GS_RATIO_HIST[GS_RATIO_HIST.length - 1];
  const gd = GD_RATIO_HIST[GD_RATIO_HIST.length - 1];
  const dow = 43500;
  const gold = 4842;
  const seoulApt = 1200000000;
  const goldKrwG = gold * 1440 / OZ_G;
  const ozForApt = (seoulApt / (goldKrwG * OZ_G)).toFixed(1);

  const tabs = [
    { key: 'cb', label: ko ? '중앙은행 보유' : 'CB Holdings' },
    { key: 'gs', label: ko ? '금/은 비율' : 'Gold / Silver' },
    { key: 'gd', label: ko ? '금/다우 비율' : 'Gold / Dow' },
    { key: 're', label: ko ? '부동산 vs 금' : 'Real Estate' },
  ];

  return (
    <Panel num="VI" title={ko ? '5대 비율' : 'Five Ratios'} sub={ko ? '탭 전환 · 장기 맥락' : 'Long-term context'}>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, marginBottom: 22, overflowX: 'auto' }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            background: tab === i ? 'rgba(197,165,114,0.1)' : 'transparent',
            border: 'none',
            padding: '12px 20px',
            fontFamily: T.sansKr, fontSize: 13, fontWeight: tab === i ? 700 : 500,
            letterSpacing: '0.02em',
            color: tab === i ? T.gold : T.sub,
            borderBottom: tab === i ? `2px solid ${T.gold}` : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 0: CB Holdings */}
      {tab === 0 && (
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.2em', marginBottom: 16, textTransform: 'uppercase' }}>
            {ko ? '국가별 금 보유량 (2026)' : 'Sovereign Gold Holdings (2026)'}
          </div>
          {CB_HOLDINGS.map((cb, i) => {
            const max = 8133;
            const pct = Math.round((cb.tonnes / max) * 100);
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub }}>{cb.flag} {cb.country[lang]}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.gold }}>{cb.tonnes.toLocaleString()}t · {cb.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: T.gold, opacity: 0.65, transition: 'width 1.5s' }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: T.sansKr, fontSize: 12, color: T.green }}>
              👤 {ko ? '개인 투자자 · 당신은 어디에?' : 'Individual investor · where do you stand?'}
            </span>
            <button onClick={() => navigate('/signup')} style={{
              background: 'transparent', border: `1px solid ${T.green}`, color: T.green,
              padding: '6px 14px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer',
            }}>
              {ko ? '금 적립 시작 →' : 'Start accumulating →'}
            </button>
          </div>
          <p style={{ fontFamily: T.sansKr, fontSize: 11, color: T.muted, lineHeight: 1.7, marginTop: 14 }}>
            {ko ? '2023년 이후 중앙은행은 역대 최대 규모로 금을 매입 중. 한국은 1%에 머물러 있음. WGC 출처.' : 'CBs buying at record pace since 2023. Korea at 1% of reserves. Source: WGC.'}
          </p>
        </div>
      )}

      {/* Tab 1: Gold/Silver */}
      {tab === 1 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 54, color: T.gold, lineHeight: 1 }}>{gs}</span>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>oz gold / oz silver</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: gs > 80 ? T.green : T.sub }}>
                {gs > 80 ? (ko ? '은이 역사적 저평가' : 'Silver historically undervalued') : (ko ? '정상 범위' : 'Normal range')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginBottom: 14 }}>
            {GS_RATIO_HIST.map((v, i) => {
              const h = ((v - 60) / (100 - 60)) * 100;
              const isLast = i === GS_RATIO_HIST.length - 1;
              return <div key={i} style={{ flex: 1, background: isLast ? T.gold : 'rgba(197,165,114,0.3)', height: `${h}%` }} />;
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { lbl: ko ? '20년 평균' : '20yr avg', v: '68x' },
              { lbl: ko ? '현재' : 'Now', v: `${gs}x`, gold: true },
              { lbl: ko ? '역대 최고' : 'ATH', v: '126x' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, padding: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>{s.lbl}</div>
                <div style={{ fontFamily: T.mono, fontSize: 18, color: s.gold ? T.gold : T.sub, fontWeight: 600 }}>{s.v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.75 }}>
            {ko ? `현재 비율 ${gs}x가 20년 평균(68x)을 상회. 은의 상대적 저평가 신호로 해석됨.` : `Current ratio ${gs}x exceeds 20-yr mean (68x). Historically a signal of silver undervaluation.`}
          </p>
        </div>
      )}

      {/* Tab 2: Gold/Dow */}
      {tab === 2 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 54, color: T.gold, lineHeight: 1 }}>{gd}</span>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>Dow / oz gold</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.sub }}>{ko ? '주식 대비 금의 가치' : 'Gold value vs equities'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginBottom: 14 }}>
            {GD_RATIO_HIST.map((v, i) => {
              const h = ((v - 5) / (12 - 5)) * 100;
              const isLast = i === GD_RATIO_HIST.length - 1;
              return <div key={i} style={{ flex: 1, background: isLast ? T.gold : 'rgba(197,165,114,0.3)', height: `${Math.max(h, 5)}%` }} />;
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { lbl: 'Dow (Q1 2026)', v: dow.toLocaleString() },
              { lbl: ko ? '금 현물가' : 'Gold spot', v: fmt.usd(gold), gold: true },
              { lbl: ko ? '비율' : 'Ratio', v: `${gd}x`, gold: true },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, padding: 12, textAlign: 'center' }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>{s.lbl}</div>
                <div style={{ fontFamily: T.mono, fontSize: 16, color: s.gold ? T.gold : T.sub, fontWeight: 600 }}>{s.v}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.75 }}>
            {ko ? '2000년 고점 당시 이 비율은 1x였음. 역사적 금 강세 구간.' : 'At the 2000 peak this ratio touched 1x. Historical gold-strength zones.'}
          </p>
        </div>
      )}

      {/* Tab 3: Real Estate */}
      {tab === 3 && (
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.2em', marginBottom: 16, textTransform: 'uppercase' }}>
            {ko ? '서울 아파트 vs 금 · 10년' : 'Seoul Apartment vs Gold · 10yr'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.24)', padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.red, letterSpacing: '0.12em', marginBottom: 6 }}>{ko ? '서울 평균 아파트' : 'Seoul avg apartment'}</div>
              <div style={{ fontFamily: T.mono, fontSize: 22, color: T.red, fontWeight: 700 }}>₩1.2B</div>
              <div style={{ fontFamily: T.sansKr, fontSize: 10, color: T.muted, marginTop: 6 }}>{ko ? '취득세·중개수수료 포함' : 'incl. acquisition tax'}</div>
            </div>
            <div style={{ background: T.goldGlow, border: `1px solid ${T.goldBorder}`, padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.12em', marginBottom: 6 }}>{ko ? '동일 가치 금' : 'Same value · gold'}</div>
              <div style={{ fontFamily: T.mono, fontSize: 22, color: T.gold, fontWeight: 700 }}>{ozForApt}oz</div>
              <div style={{ fontFamily: T.sansKr, fontSize: 10, color: T.sub, marginTop: 6 }}>≈ {Math.round(Number(ozForApt) * OZ_G)}g · Malca-Amit</div>
            </div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.2em', marginBottom: 12, textTransform: 'uppercase' }}>
            {ko ? '10년 수익률 비교 (KRW)' : '10yr Return Comparison (KRW)'}
          </div>
          {[
            { lbl: ko ? '서울 아파트' : 'Seoul Apt', v: 180, d: '+180%' },
            { lbl: ko ? '금 (KRW)' : 'Gold (KRW)', v: 394, d: '+394%', gold: true },
            { lbl: 'KOSPI', v: 45, d: '+45%' },
            { lbl: ko ? '예금 금리' : 'Bank deposit', v: 25, d: '+25%' },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub }}>{r.lbl}</span>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: r.gold ? T.gold : T.sub, fontWeight: 600 }}>{r.d}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${(r.v / 400) * 100}%`, background: r.gold ? T.gold : 'rgba(197,165,114,0.4)' }} />
              </div>
            </div>
          ))}
          <p style={{ fontFamily: T.sansKr, fontSize: 11, color: T.muted, lineHeight: 1.7, marginTop: 12 }}>
            {ko ? '취득세·보유세·중개수수료·공실 위험 없음. 국제 현물가 즉시 정산.' : 'No acquisition tax, holding tax, agency fees, or vacancy risk. Same-day international spot settlement.'}
          </p>
        </div>
      )}
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §IV · KRW DEBASEMENT
// ═══════════════════════════════════════════════════════════════════════════
function KRWDebase() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const maxG = Math.max(...KRW_DEBASEMENT.map(d => d.goldG));
  const from = KRW_DEBASEMENT[0];
  const to = KRW_DEBASEMENT[KRW_DEBASEMENT.length - 1];
  const dropPct = ((from.goldG - to.goldG) / from.goldG * 100).toFixed(0);

  return (
    <Panel num="III" title={ko ? 'KRW 구매력 감소' : 'KRW Debasement'} sub={ko ? '₩1M 기준 · 금 그램으로 환산' : '₩1M in grams of gold'}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 42, color: T.red, lineHeight: 1, fontWeight: 600 }}>−{dropPct}%</span>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: '0.18em' }}>{ko ? '2005 → 2026' : '2005 → 2026'}</div>
            <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub }}>
              {ko ? `₩1M의 금 가치는 ${from.goldG}g에서 ${to.goldG}g으로 하락` : `₩1M bought ${from.goldG}g in 2005 · buys ${to.goldG}g today`}
            </div>
          </div>
        </div>
      </div>

      {/* SVG line chart: x = year, y = grams */}
      <div style={{ background: T.bg || '#0a0a0a', border: `1px solid ${T.border}`, padding: 16, marginBottom: 18 }}>
        <svg viewBox="0 0 640 200" width="100%" height="200" preserveAspectRatio="none" style={{ display: 'block' }}>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
            <line key={i} x1="40" x2="630" y1={20 + f * 160} y2={20 + f * 160} stroke="rgba(197,165,114,0.07)" strokeWidth="0.5" strokeDasharray="3 3" />
          ))}
          {/* Line */}
          {(() => {
            const pts = KRW_DEBASEMENT.map((d, i) => {
              const x = 40 + (i / (KRW_DEBASEMENT.length - 1)) * 580;
              const y = 20 + (1 - d.goldG / maxG) * 160;
              return { x, y, d };
            });
            const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const fillPath = path + ` L ${pts[pts.length - 1].x} 180 L ${pts[0].x} 180 Z`;
            return (
              <>
                <defs>
                  <linearGradient id="krwFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f87171" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={fillPath} fill="url(#krwFill)" />
                <path d={path} stroke="#f87171" strokeWidth="2" fill="none" />
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3" fill="#f87171" />
                    <text x={p.x} y={195} fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#8a7d6b" textAnchor="middle">{p.d.yr}</text>
                    {(i === 0 || i === pts.length - 1) && (
                      <text x={p.x} y={p.y - 10} fontFamily="'JetBrains Mono',monospace" fontSize="10" fill="#f87171" textAnchor="middle" fontWeight="700">{p.d.goldG}g</text>
                    )}
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
      <p style={{ fontFamily: T.serifKr, fontSize: 13, color: T.sub, lineHeight: 1.85, maxWidth: 680 }}>
        {ko
          ? '21년간 원화의 금 대비 구매력은 91% 하락. 같은 ₩100만원이 2005년에는 160g의 금이었지만, 오늘은 14g. 금은 동일한 금. 원화가 변한 것.'
          : 'Over 21 years, the KRW has lost ~91% of its purchasing power in gold terms. ₩1M bought 160g in 2005 — 14g today. The gold didn\'t change. The currency did.'}
      </p>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §V · CENTRAL BANK BUYING (Canvas bar chart)
// ═══════════════════════════════════════════════════════════════════════════
function CBBuying() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const canvasRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const DPR = window.devicePixelRatio || 1;
      const W = canvas.clientWidth;
      const H = 260;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      const ctx = canvas.getContext('2d');
      ctx.scale(DPR, DPR);
      ctx.clearRect(0, 0, W, H);
      const PAD = { t: 24, r: 16, b: 36, l: 52 };
      const CW = W - PAD.l - PAD.r;
      const CH = H - PAD.t - PAD.b;
      const n = CB_BUY_ANNUAL.length;
      const maxT = Math.max(...CB_BUY_ANNUAL.map(d => d.tonnes));
      const gap = CW / n;
      const barW = Math.max(4, gap * 0.62);

      // Grid
      [250, 500, 750, 1000].forEach(v => {
        const y = PAD.t + CH - (v / maxT) * CH;
        ctx.strokeStyle = 'rgba(197,165,114,0.08)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(197,165,114,0.42)';
        ctx.font = "9px 'JetBrains Mono',monospace";
        ctx.textAlign = 'right';
        ctx.fillText(v + 't', PAD.l - 6, y + 3);
      });

      // Bars
      CB_BUY_ANNUAL.forEach((d, i) => {
        const x = PAD.l + i * gap + gap / 2 - barW / 2;
        const bH = (d.tonnes / maxT) * CH;
        const y = PAD.t + CH - bH;

        if (d.inflection) {
          const g = ctx.createLinearGradient(0, y, 0, PAD.t + CH);
          g.addColorStop(0, '#E3C187');
          g.addColorStop(1, 'rgba(197,165,114,0.5)');
          ctx.fillStyle = g;
        } else if (d.partial) {
          ctx.fillStyle = 'rgba(197,165,114,0.35)';
        } else {
          ctx.fillStyle = 'rgba(197,165,114,0.72)';
        }
        if (hoverIdx === i) {
          ctx.fillStyle = '#F2D4A0';
        }
        ctx.fillRect(x, y, barW, bH);

        // Year label
        if (i % 2 === 0 || i === CB_BUY_ANNUAL.length - 1) {
          ctx.fillStyle = 'rgba(197,165,114,0.5)';
          ctx.font = "9px 'JetBrains Mono',monospace";
          ctx.textAlign = 'center';
          ctx.fillText(String(d.yr).slice(2), x + barW / 2, H - 18);
        }

        // Inflection callout
        if (d.inflection) {
          ctx.fillStyle = '#E3C187';
          ctx.font = "10px 'JetBrains Mono',monospace";
          ctx.textAlign = 'center';
          ctx.fillText(d.tonnes + 't', x + barW / 2, y - 6);
        }
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [hoverIdx]);

  const handleMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = rect.width;
    const PAD = { l: 52, r: 16 };
    const CW = W - PAD.l - PAD.r;
    const n = CB_BUY_ANNUAL.length;
    const gap = CW / n;
    const idx = Math.floor((x - PAD.l) / gap);
    if (idx >= 0 && idx < n) setHoverIdx(idx); else setHoverIdx(-1);
  };

  const hover = hoverIdx >= 0 ? CB_BUY_ANNUAL[hoverIdx] : null;
  const totalQ3 = 220;

  return (
    <Panel num="II" title={ko ? '중앙은행 금 매입 흐름' : 'Central Bank Buying Cadence'} sub={ko ? '2010 → 2025 · 연간 매입량' : 'Annual net purchases'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 18 }} className="cb-grid">
        <div style={{ padding: '16px 18px', background: 'rgba(197,165,114,0.05)', border: `1px solid ${T.goldBorder}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 8 }}>{ko ? 'Q3 2025 · 분기 매입량' : 'Q3 2025 · Quarterly'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 28, color: T.gold, fontWeight: 700 }}>{totalQ3}t</div>
          <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.green, marginTop: 4 }}>+28% QoQ</div>
        </div>
        <div style={{ padding: '16px 18px', background: 'rgba(197,165,114,0.05)', border: `1px solid ${T.goldBorder}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.22em', marginBottom: 8 }}>{ko ? '2022 변곡점 · Inflection' : '2022 · Inflection'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.goldB, fontWeight: 700 }}>1,136t</div>
          <div style={{ fontFamily: T.sansKr, fontSize: 11, color: T.muted, marginTop: 4 }}>{ko ? '30년 만의 최대 · 러시아 제재' : '30-year high · Post-sanctions'}</div>
        </div>
      </div>

      <div style={{ position: 'relative', background: T.bg || '#0a0a0a', border: `1px solid ${T.border}` }}>
        <canvas ref={canvasRef} onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(-1)} style={{ width: '100%', height: 260, display: 'block', cursor: 'crosshair' }} />
        {hover && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(10,10,10,0.92)', border: `1px solid ${T.goldBorder}`,
            padding: '10px 14px', fontFamily: T.mono, fontSize: 11,
          }}>
            <div style={{ color: T.gold, fontWeight: 700 }}>{hover.yr}</div>
            <div style={{ color: T.text, marginTop: 4 }}>{hover.tonnes}t</div>
            {hover.note && <div style={{ color: T.sub, marginTop: 4, fontSize: 10 }}>{hover.note}</div>}
          </div>
        )}
      </div>

      <p style={{ fontFamily: T.serifKr, fontSize: 13, color: T.sub, lineHeight: 1.85, marginTop: 16, maxWidth: 640 }}>
        {ko
          ? '2022년은 중앙은행 금 매입의 분수령. 러시아 외환준비금 동결 이후 비서구권 중앙은행의 달러 비중 감소와 금 매입 가속화가 이어지고 있음.'
          : '2022 marked a regime shift. After Russian FX reserves were frozen, non-Western CBs accelerated gold accumulation and reduced USD-denominated reserves.'}
      </p>
      <style>{`
        @media (max-width: 720px) {
          .cb-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §VI · KOREA WEALTH ALLOCATION
// ═══════════════════════════════════════════════════════════════════════════
function Donut({ data, label, size = 180, lang }) {
  let cum = 0;
  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.2em', marginBottom: 12, textTransform: 'uppercase' }}>{label}</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const angle = (d.pct / 100) * 360;
          const start = cum;
          cum += angle;
          const startRad = (start - 90) * Math.PI / 180;
          const endRad = (cum - 90) * Math.PI / 180;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const large = angle > 180 ? 1 : 0;
          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
          return <path key={i} d={path} fill={d.color} stroke="#0a0a0a" strokeWidth="1.5" />;
        })}
        <circle cx={cx} cy={cy} r={r * 0.52} fill="#0a0a0a" />
      </svg>
      <div style={{ marginTop: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, background: d.color, display: 'inline-block' }} />
              <span style={{ fontFamily: T.sansKr, color: T.sub }}>{d.label[lang]}</span>
            </span>
            <span style={{ fontFamily: T.mono, color: d.label.en === 'Gold' ? T.gold : T.sub, fontWeight: d.label.en === 'Gold' ? 700 : 500 }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KoreaAllocation() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  return (
    <Panel num="VII" title={ko ? '한국 가계 vs 중앙은행 자산 배분' : 'KR Household vs CB Reserves'} sub={ko ? '당신은 어디에 서 있습니까' : 'Where do you stand'}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 22 }} className="donut-grid">
        <Donut data={KR_HOUSEHOLD} label={ko ? '한국 가계 (2024)' : 'KR Household (2024)'} lang={lang} />
        <Donut data={CB_RESERVES} label={ko ? '글로벌 중앙은행' : 'Global Central Banks'} lang={lang} />
      </div>
      <div style={{ padding: '16px 18px', background: T.goldGlow, border: `1px solid ${T.goldBorder}` }}>
        <div style={{ fontFamily: T.serifKr, fontSize: 15, color: T.text, lineHeight: 1.7, marginBottom: 8, fontWeight: 500 }}>
          {ko ? '한국 가계의 금 비중 0.3% · 중앙은행 평균 15%' : 'KR household gold: 0.3% · CB average: 15%'}
        </div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 14, color: T.goldD }}>
          {ko ? '기관의 자산 구성을 개인도 접근할 수 있습니다.' : 'The allocation institutions trust, now accessible to individuals.'}
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .donut-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §VII · CALCULATORS (3 tabs)
// ═══════════════════════════════════════════════════════════════════════════
function KumtongConverter({ ko }) {
  const [g, setG] = useState(3.75);
  const don = g / 3.75;
  const oz = g / OZ_G;
  const krw = g * (4842 * 1440 / OZ_G);
  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.22em', marginBottom: 14, textTransform: 'uppercase' }}>
        {ko ? '금속 단위 환산 · 금종 컨버터' : 'Unit converter · 금종'}
      </div>
      <label style={{ display: 'block', fontFamily: T.sansKr, fontSize: 12, color: T.sub, marginBottom: 8 }}>
        {ko ? '그램 입력 · g' : 'Enter grams · g'}
      </label>
      <input type="number" min="0.1" step="0.1" value={g} onChange={e => setG(Math.max(0.1, +e.target.value))}
        style={{ width: '100%', padding: '14px 16px', background: T.bg, border: `1px solid ${T.goldBorder}`, color: T.text, fontFamily: T.mono, fontSize: 18, outline: 'none', marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { lbl: ko ? '돈 (錢)' : '돈 · don', v: don.toFixed(3), sub: ko ? '3.75g = 1돈' : '1 don = 3.75g' },
          { lbl: 'Troy oz', v: oz.toFixed(4), sub: '1 oz = 31.1035g' },
          { lbl: 'KRW @ Aurum', v: fmt.krw(krw * 1.08), sub: ko ? '현물 +8%' : 'spot +8%', gold: true },
          { lbl: ko ? 'KRW @ 국내 소매' : 'KRW @ KR retail', v: fmt.krw(krw * 1.20), sub: ko ? '현물 +20%' : 'spot +20%' },
        ].map((r, i) => (
          <div key={i} style={{ padding: 12, background: T.bg, border: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>{r.lbl}</div>
            <div style={{ fontFamily: T.mono, fontSize: 16, color: r.gold ? T.gold : T.text, fontWeight: 600 }}>{r.v}</div>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>{r.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverpayCalc({ ko }) {
  const [grams, setGrams] = useState(10);
  const spot = 4842 * 1440 / OZ_G;
  const kr = grams * spot * 1.20;
  const aurum = grams * spot * 1.08;
  const save = kr - aurum;
  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.22em', marginBottom: 14, textTransform: 'uppercase' }}>
        {ko ? '국내 소매 vs Aurum · 개인 절감 계산기' : 'KR retail vs Aurum · overpay calc'}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.22em', marginBottom: 10 }}>
        {ko ? '구매 수량 · g' : 'Purchase amount · g'}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.text }}>{grams}g</span>
      </div>
      <input type="range" min="1" max="100" step="1" value={grams} onChange={e => setGrams(+e.target.value)}
        style={{ width: '100%', marginBottom: 20, '--pct': `${((grams - 1) / (100 - 1)) * 100}%` }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ padding: 14, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.red, letterSpacing: '0.15em', marginBottom: 6 }}>{ko ? '국내 소매' : 'KR retail'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 17, color: T.red, fontWeight: 700 }}>{fmt.krw(kr)}</div>
        </div>
        <div style={{ padding: 14, background: T.goldGlow, border: `1px solid ${T.goldBorder}` }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.15em', marginBottom: 6 }}>Aurum</div>
          <div style={{ fontFamily: T.mono, fontSize: 17, color: T.gold, fontWeight: 700 }}>{fmt.krw(aurum)}</div>
        </div>
      </div>
      <div style={{ padding: 16, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.3)', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.green, letterSpacing: '0.2em', marginBottom: 6 }}>{ko ? '절감액' : 'Savings'}</div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.green, fontWeight: 700 }}>{fmt.krw(save)}</div>
      </div>
    </div>
  );
}

function AccumulatorCalc({ ko, navigate }) {
  const [monthly, setMonthly] = useState(500000);
  const [years, setYears] = useState(10);
  const [cagr, setCagr] = useState(DEFAULT_CAGR);
  const spot = 4842 * 1440 / OZ_G;
  const aurumUnit = spot * 1.08;
  const months = years * 12;
  const gramsPerMonth = monthly / aurumUnit;
  const totalGrams = gramsPerMonth * months;

  // Monthly compounding against chosen CAGR
  const monthlyRate = Math.pow(1 + cagr, 1/12) - 1;
  let endValue = 0;
  for (let m = 0; m < months; m++) {
    const remaining = months - m;
    endValue += monthly * Math.pow(1 + monthlyRate, remaining);
  }
  const totalInvested = monthly * months;

  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.22em', marginBottom: 14, textTransform: 'uppercase' }}>
        {ko ? 'GoldPath 장기 적립 시뮬레이터' : 'GoldPath accumulator'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 8 }}>{ko ? '월 적립' : 'Monthly'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.text, fontWeight: 700, marginBottom: 8 }}>{fmt.krw(monthly)}</div>
          <input type="range" min="200000" max="5000000" step="100000" value={monthly} onChange={e => setMonthly(+e.target.value)} style={{ width: '100%', '--pct': `${((monthly - 200000) / (5000000 - 200000)) * 100}%` }} />
        </div>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.2em', marginBottom: 8 }}>{ko ? '기간' : 'Horizon'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 20, color: T.text, fontWeight: 700, marginBottom: 8 }}>{years}{ko ? '년' : 'yr'}</div>
          <input type="range" min="1" max="25" step="1" value={years} onChange={e => setYears(+e.target.value)} style={{ width: '100%', '--pct': `${((years - 1) / (25 - 1)) * 100}%` }} />
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <CagrToggle value={cagr} onChange={setCagr} />
      </div>
      <div style={{ padding: 16, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em', marginBottom: 6 }}>{ko ? '총 그램' : 'Total grams'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.gold, fontWeight: 700 }}>{totalGrams.toFixed(1)}g</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>{(totalGrams / OZ_G).toFixed(2)} oz</div>
        </div>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em', marginBottom: 6 }}>
            {ko ? `예상 가치 @ ${(cagr * 100).toFixed(0)}%` : `Est. value @ ${(cagr * 100).toFixed(0)}%`}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.gold, fontWeight: 700 }}>{fmt.krw(endValue)}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>{ko ? 'KRW 기준' : 'KRW'}</div>
        </div>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldD, letterSpacing: '0.2em', marginBottom: 6 }}>{ko ? '총 투자' : 'Total input'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 22, color: T.sub, fontWeight: 700 }}>{fmt.krw(totalInvested)}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.green, marginTop: 4 }}>+{((endValue / totalInvested - 1) * 100).toFixed(1)}%</div>
        </div>
      </div>
      <button onClick={() => navigate('/signup')} style={{
        width: '100%', background: T.gold, color: T.bg, border: 'none', cursor: 'pointer',
        padding: '14px', fontFamily: T.sans, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
      }}>
        {ko ? 'GoldPath 가입하기 →' : 'Start GoldPath →'}
      </button>
      <p style={{ fontFamily: T.sansKr, fontSize: 10, color: T.muted, lineHeight: 1.6, marginTop: 10, textAlign: 'center' }}>
        {ko ? `* 금 가격 연 ${(cagr * 100).toFixed(0)}% 상승 가정 · 실제 수익률은 시장 상황에 따라 상이` : `* Assumes ${(cagr * 100).toFixed(0)}% annual gold appreciation · Actual returns vary`}
      </p>
    </div>
  );
}

function Calculators() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // default to GoldPath Accumulator (now first)
  // Order per v10 spec: GoldPath Accumulator → Overpay (소매) → Kumtong Converter (금종)
  const tabs = [
    { key: 'acc',  label: ko ? 'GoldPath 적립' : 'GoldPath Accumulator' },
    { key: 'over', label: ko ? '소매 vs Aurum' : 'Overpay Calc' },
    { key: 'kum',  label: ko ? '금종 컨버터' : 'Unit Converter' },
  ];
  return (
    <Panel num="IV" title={ko ? '계산기' : 'Calculators'} sub={ko ? '3 tools · 당신의 숫자' : 'Your numbers, 3 tools'}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, marginBottom: 22, overflowX: 'auto' }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            background: tab === i ? 'rgba(197,165,114,0.1)' : 'transparent',
            border: 'none', padding: '12px 20px',
            fontFamily: T.sansKr, fontSize: 13, fontWeight: tab === i ? 700 : 500,
            color: tab === i ? T.gold : T.sub,
            borderBottom: tab === i ? `2px solid ${T.gold}` : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 0 && <AccumulatorCalc ko={ko} navigate={navigate} />}
      {tab === 1 && <OverpayCalc ko={ko} />}
      {tab === 2 && <KumtongConverter ko={ko} />}
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §VIII · AURUM PRICE LANE (tabular honest comparison with live flash)
// ═══════════════════════════════════════════════════════════════════════════
function PriceLane() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  const [spot, setSpot] = useState(4842.10);
  const [flashIdx, setFlashIdx] = useState(-1);

  useEffect(() => {
    const id = setInterval(() => {
      setSpot(s => Number((s + (Math.random() - 0.45) * 2.5).toFixed(2)));
      const fi = Math.floor(Math.random() * 4);
      setFlashIdx(fi);
      setTimeout(() => setFlashIdx(-1), 1200);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const per1g_spot = spot / OZ_G;
  const per1g_kr = per1g_spot * 1.20;
  const per1g_aurum = per1g_spot * 1.08;
  const per1g_founders = per1g_aurum * 0.98;

  const rows = [
    { lbl: ko ? '국제 현물 · Spot' : 'International spot', krw: per1g_spot * 1440.20, note: 'LBMA reference', color: T.sub, tone: 0 },
    { lbl: ko ? '한국 소매' : 'KR retail', krw: per1g_kr * 1440.20, note: ko ? '+VAT +수입프리미엄' : '+VAT +import premium', color: T.red, tone: '+20.0%' },
    { lbl: 'Aurum · List', krw: per1g_aurum * 1440.20, note: 'spot +8.0%', color: T.goldB, tone: '+8.0%' },
    { lbl: ko ? 'Aurum · Founders III · 나' : 'Aurum · Founders III · me', krw: per1g_founders * 1440.20, note: ko ? 'spot +5.84% · 평생' : 'spot +5.84% · for life', color: T.green, tone: '+5.84%', me: true },
  ];

  return (
    <Panel num="V" title={ko ? 'Aurum 가격 체계' : 'Aurum Price Lane'} sub={ko ? '숨김 없는 4 라인 비교' : 'Transparent 4-lane comparison'} live>
      <div style={{ background: T.bg || '#0a0a0a', border: `1px solid ${T.goldBorder}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.2fr 80px', padding: '12px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
          <span>{ko ? '구분' : 'Lane'}</span>
          <span>{ko ? '1g · KRW' : 'Per-gram KRW'}</span>
          <span>{ko ? '비고' : 'Note'}</span>
          <span style={{ textAlign: 'right' }}>vs Spot</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.2fr 80px',
            padding: '14px 16px', borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : 'none',
            alignItems: 'center', fontFamily: T.mono, fontSize: 12,
            animation: flashIdx === i ? 'price-flash-up 1.2s ease-out' : 'none',
            background: r.me ? 'rgba(74,222,128,0.04)' : 'transparent',
          }}>
            <span style={{ color: r.me ? T.green : T.text, fontWeight: r.me ? 600 : 500, fontSize: 13, fontFamily: T.sansKr }}>{r.lbl}</span>
            <span style={{ color: r.color, fontSize: 15, fontWeight: 600 }}>{fmt.krw(r.krw)}</span>
            <span style={{ color: T.muted, fontSize: 10 }}>{r.note}</span>
            <span style={{ color: r.color, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
              {r.tone === 0 ? '—' : r.tone}
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: T.serifKr, fontSize: 13, color: T.sub, lineHeight: 1.85, marginTop: 18, maxWidth: 680 }}>
        {ko
          ? '모든 라인은 동일한 LBMA 현물가에서 출발. 차이는 구조적 수수료·세금·중간마진. Founders Club Gate III 멤버십은 평생 최저 라인에 잠깁니다.'
          : 'Every lane starts from the same LBMA spot. Differences are structural fees, taxes, and intermediary margins. Founders Club Gate III locks the cheapest lane for life.'}
      </p>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// §IX · FINAL CTA
// ═══════════════════════════════════════════════════════════════════════════
function FinalCTA() {
  const { lang } = useLang();
  const ko = lang === 'ko';
  return (
    <section style={{
      padding: '80px 24px', textAlign: 'center',
      background: `radial-gradient(ellipse at 50% 30%, rgba(197,165,114,0.12), transparent 60%), ${T.bg}`,
      borderTop: `1px solid ${T.goldBorder}`,
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.3em', marginBottom: 16, textTransform: 'uppercase' }}>§ IX · The Conclusion</div>
        <h2 style={{ fontFamily: T.serifKr, fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 500, color: T.text, margin: '0 0 18px', lineHeight: 1.2 }}>
          {ko ? '숫자는 입증됐습니다.' : 'The numbers are verified.'}<br />
          <span style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold }}>{ko ? '이제 보유를 시작하세요.' : 'Now start holding.'}</span>
        </h2>
        <p style={{ fontFamily: T.serifKr, fontSize: 15, color: T.sub, lineHeight: 1.8, fontWeight: 300, maxWidth: 560, margin: '0 auto 32px' }}>
          {ko
            ? '20년간의 데이터, 중앙은행의 흐름, 동 단위 환산, 실시간 소매 프리미엄 — 모든 수치는 공개됩니다. 매일 갱신. 분석이 곧 투명성.'
            : '20 years of data, CB flows, unit conversions, live retail premiums — all numbers shown. Updated daily. Analysis is our form of transparency.'}
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PrimaryCTA to="/signup">{ko ? 'GoldPath 가입하기 →' : 'Start GoldPath →'}</PrimaryCTA>
          <GhostCTA to="/founders">{ko ? 'Founders Club →' : 'Founders Club →'}</GhostCTA>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const { lang } = useLang();
  const ko = lang === 'ko';

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: '100vh' }}>
      <TickerBar />
      <QuietNav page="analytics" />

      {/* Hero */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.32em', marginBottom: 18, textTransform: 'uppercase' }}>§ Analytics · 분석</div>
          <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(30px, 4.2vw, 48px)', fontWeight: 500, color: T.text, margin: '0 0 18px', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {ko ? '수치는 당신 편입니다.' : 'The numbers are on your side.'}
          </h1>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 17, color: T.goldD, marginBottom: 20, lineHeight: 1.5 }}>
            {ko ? 'Spot price · Korea premium · Central bank flows · 20-year ratios' : 'Spot price · Korea premium · Central bank flows · 20-year ratios'}
          </div>
          <p style={{ fontFamily: T.serifKr, fontSize: 15, color: T.sub, lineHeight: 1.85, fontWeight: 300, maxWidth: 600, margin: '0 auto' }}>
            {ko
              ? '모든 차트는 투자자가 이미 물었던 질문에 답합니다. 우리는 답을 숨기지 않습니다.'
              : 'Every chart answers a question an investor has already asked. We don\'t hide the answers.'}
          </p>
        </div>
      </section>

      {/* Body · 9 panels */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px 60px' }}>
        <MarketStrip />
        <CBBuying />
        <KRWDebase />
        <Calculators />
        <PriceLane />
        <Ratios />
        <KoreaAllocation />
        <KimchiMeter />
      </div>

      <FinalCTA />

      <QuietFooter />
    </div>
  );
}
