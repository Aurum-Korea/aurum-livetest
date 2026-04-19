// PriceChart.jsx — TradingView Lightweight Charts wrapper (S-03)
import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function seedHistory(currentPrice, days = 30) {
  const data = [];
  let p = currentPrice * 0.965;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    p += (Math.random() - 0.42) * currentPrice * 0.006;
    p = Math.max(p, currentPrice * 0.93);
    const d = new Date(now - i * 86400000);
    data.push({
      time: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      value: parseFloat(p.toFixed(2)),
    });
  }
  return data;
}

export default function PriceChart({ price, metal = 'gold', label, height = 160 }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      width:  containerRef.current.clientWidth,
      height,
      layout:      { background: { color: 'transparent' }, textColor: '#8a7d6b' },
      grid:        { vertLines: { color: 'rgba(197,165,114,0.06)' }, horzLines: { color: 'rgba(197,165,114,0.06)' } },
      crosshair:   { mode: 0 },
      rightPriceScale: { borderColor: 'rgba(197,165,114,0.15)', textColor: '#8a7d6b' },
      timeScale:   { borderColor: 'rgba(197,165,114,0.15)', timeVisible: false },
      handleScroll: false,
      handleScale:  false,
    });
    chartRef.current = chart;

    const series = chart.addAreaSeries({
      lineColor:        '#C5A572',
      topColor:         'rgba(197,165,114,0.22)',
      bottomColor:      'rgba(197,165,114,0.01)',
      lineWidth:        2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });
    seriesRef.current = series;

    const data = seedHistory(price || (metal === 'gold' ? 3342 : 32.9));
    series.setData(data);
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current?.clientWidth || 300 });
    });
    ro.observe(containerRef.current);

    return () => { chart.remove(); ro.disconnect(); };
  }, [metal]);

  // Update last bar when live price changes
  useEffect(() => {
    if (!seriesRef.current || !price) return;
    const now = new Date();
    const t = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    seriesRef.current.update({ time: t, value: price });
  }, [price]);

  return (
    <div>
      {label && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#8a7d6b', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      )}
      <div ref={containerRef} style={{ width: '100%', height }} />
    </div>
  );
}
