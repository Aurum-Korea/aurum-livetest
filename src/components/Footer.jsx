import { T, useIsMobile } from '../lib/index.jsx';

export default function Footer({ lang, navigate }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';

  const cols = [
    { title: ko ? '매장' : 'Shop', links: [
      { label: ko ? '금 바·코인'    : 'Gold Bars & Coins', page: 'shop' },
      { label: ko ? '은 바'         : 'Silver Bars',       page: 'shop' },
      { label: ko ? 'AGP 적금 Plan' : 'AGP 적금 Plan',  page: 'agp' },
    ]},
    { title: ko ? '정보' : 'Info', links: [
      { label: ko ? '보관 방식'   : 'Storage',    page: 'storage' },
      { label: ko ? '왜 금인가'  : 'Why Gold',   page: 'why' },
      { label: ko ? '교육 센터'  : 'Learn',      page: 'learn' },
      { label: ko ? '파운더스 클럽' : 'Founders Club', page: 'campaign-founders' },
      { label: ko ? 'AGP 론치 이벤트' : 'AGP Launch', page: 'campaign-agp-launch' },
    ]},
    { title: ko ? '계정' : 'Account', links: [
      { label: ko ? '내 보유자산' : 'My Holdings',    page: 'dashboard' },
      { label: ko ? '주문 내역'   : 'Order History',  page: 'orders' },
      { label: ko ? '계정 설정'   : 'Account',        page: 'account' },
    ]},
    { title: ko ? '법률' : 'Legal', links: [
      { label: ko ? '이용약관' : 'Terms',   page: null },
      { label: ko ? '개인정보' : 'Privacy', page: null },
      { label: 'AML/KYC',                   page: null },
    ]},
  ];

  return (
    <footer style={{ background: '#0a0a0a', borderTop: `1px solid ${T.border}`, padding: isMobile ? '32px 20px 20px' : '52px 80px 28px', marginTop: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 24 : 48, marginBottom: isMobile ? 28 : 40 }}>

        {/* Brand col */}
        <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, border: `1px solid ${T.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontSize: 11, color: T.gold }}>AU</div>
            <span style={{ fontFamily: T.serif, fontSize: 15, color: T.gold, letterSpacing: '0.26em' }}>AURUM KOREA</span>
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 11, color: '#555', lineHeight: 1.75, maxWidth: 280 }}>
            Aurum Korea Pte Ltd. 싱가포르 등록 귀금속 딜러.<br />AML/CFT 준수. 모든 금속은 Malca-Amit Singapore FTZ에 완전 배분 보관.
          </p>
          <p style={{ fontFamily: T.mono, fontSize: 11, color: '#444', marginTop: 10 }}>support@aurumkorea.com</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            {['Singapore FTZ', "Lloyd's Insured", 'LBMA Approved'].map((b, i) => (
              <span key={i} style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim, border: `1px solid ${T.border}`, padding: '4px 8px', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Nav cols */}
        {cols.map((col, ci) => (
          <div key={ci}>
            <h4 style={{ fontFamily: T.sans, fontSize: 10, color: T.textMuted, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 14px' }}>{col.title}</h4>
            {col.links.map((lnk, j) => (
              <div key={j}
                onClick={lnk.page ? () => navigate(lnk.page) : undefined}
                style={{
                  fontFamily: T.sans, fontSize: 12, color: '#555', marginBottom: 9,
                  cursor: lnk.page ? 'pointer' : 'default', transition: 'color 0.15s',
                }}
                onMouseEnter={e => { if (lnk.page) e.currentTarget.style.color = T.gold; }}
                onMouseLeave={e => { if (lnk.page) e.currentTarget.style.color = '#555'; }}
              >{lnk.label}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ fontFamily: T.sans, fontSize: 10, color: '#333' }}>© 2026 Aurum Korea Pte Ltd. All rights reserved.</span>
        <span style={{ fontFamily: T.sans, fontSize: 10, color: '#333' }}>{ko ? '투자에는 위험이 따릅니다. 과거 수익률은 미래 성과를 보장하지 않습니다.' : 'Investing involves risk. Past performance does not guarantee future results.'}</span>
      </div>
    </footer>
  );
}
