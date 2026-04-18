import { T, useIsMobile } from '../lib/index.jsx';

export default function Footer({ lang, navigate }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';

  const navCols = [
    { title: ko ? '매장' : 'Shop', links: [
      { label: ko ? '금 바·코인' : 'Gold Bars & Coins', page: 'shop' },
      { label: ko ? '은 바'      : 'Silver Bars',       page: 'shop' },
      { label: ko ? 'AGP 적금'   : 'AGP Plan',          page: 'agp' },
    ]},
    { title: ko ? '정보' : 'Info', links: [
      { label: ko ? '보관 방식'    : 'Storage',      page: 'storage' },
      { label: ko ? '왜 금인가'   : 'Why Gold',     page: 'why' },
      { label: ko ? '교육 센터'   : 'Learn',        page: 'learn' },
      { label: ko ? '파운더스 클럽' : 'Founders',   page: 'founders' },
      { label: ko ? 'AGP 론치'    : 'AGP Launch',   page: 'campaign-agp-launch' },
    ]},
    { title: ko ? '계정' : 'Account', links: [
      { label: ko ? '내 보유자산' : 'My Holdings',   page: 'dashboard' },
      { label: ko ? '주문 내역'   : 'Order History', page: 'orders' },
      { label: ko ? '계정 설정'   : 'Account',       page: 'account' },
    ]},
    { title: ko ? '법률' : 'Legal', links: [
      { label: ko ? '이용약관' : 'Terms',   page: null },
      { label: ko ? '개인정보' : 'Privacy', page: null },
      { label: 'AML/KYC',                   page: null },
    ]},
  ];

  const lnkStyle = (hasPage) => ({
    fontFamily: T.sans, fontSize: 12, color: '#555', marginBottom: 8,
    cursor: hasPage ? 'pointer' : 'default', transition: 'color 0.15s',
  });

  return (
    <footer style={{ background: '#0a0a0a', borderTop: `1px solid ${T.border}`, padding: isMobile ? '32px 16px 20px' : '48px 60px 24px', marginTop: 'auto' }}>
      {/* Main grid: brand + 4 nav cols all in one row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.6fr 1fr 1fr 1fr 1fr', gap: isMobile ? 20 : 40, marginBottom: isMobile ? 24 : 36 }}>

        {/* Brand col — spans 2 on mobile */}
        <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontSize: 10, color: T.gold }}>AU</div>
            <span style={{ fontFamily: T.serif, fontSize: 14, color: T.gold, letterSpacing: '0.26em' }}>AURUM KOREA</span>
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 11, color: '#555', lineHeight: 1.7, maxWidth: 260 }}>
            Aurum Korea Pte Ltd. 싱가포르 등록 귀금속 딜러.<br />AML/CFT 준수. 모든 금속은 Malca-Amit Singapore FTZ에 완전 배분 보관.
          </p>
          <p style={{ fontFamily: T.mono, fontSize: 10, color: '#444', marginTop: 8 }}>support@aurumkorea.com</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            {['Singapore FTZ', "Lloyd's Insured", 'LBMA Approved'].map((b, i) => (
              <span key={i} style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, border: `1px solid ${T.border}`, padding: '3px 7px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{b}</span>
            ))}
          </div>
        </div>

        {/* 4 nav columns — all inline with brand */}
        {navCols.map((col, ci) => (
          <div key={ci}>
            <h4 style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 12px' }}>{col.title}</h4>
            {col.links.map((lnk, j) => (
              <div key={j}
                onClick={lnk.page ? () => navigate(lnk.page) : undefined}
                style={lnkStyle(!!lnk.page)}
                onMouseEnter={e => { if (lnk.page) e.currentTarget.style.color = T.gold; }}
                onMouseLeave={e => { if (lnk.page) e.currentTarget.style.color = '#555'; }}
              >{lnk.label}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 4 }}>
        <span style={{ fontFamily: T.sans, fontSize: 10, color: '#333' }}>© 2026 Aurum Korea Pte Ltd. All rights reserved.</span>
        <span style={{ fontFamily: T.sans, fontSize: 10, color: '#333' }}>{ko ? '투자에는 위험이 따릅니다. 과거 수익률은 미래 성과를 보장하지 않습니다.' : 'Investing involves risk. Past performance does not guarantee future results.'}</span>
      </div>
    </footer>
  );
}
