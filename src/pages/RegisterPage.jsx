// RegisterPage.jsx — Unified 5-step registration
// Step 1: Founders welcome  → Step 2: Account info → Step 3: KYC → Step 4: First service → Step 5: Done
import { useState } from 'react';
import { T, useIsMobile, API } from '../lib/index.jsx';

const FOUNDERS_CAP      = 500;
const SPOTS_REMAINING   = 247;

const GATES = [
  { num: 'I',   discount: '−1.0%', gmv: '₩5.8M' },
  { num: 'II',  discount: '−1.5%', gmv: '₩21.6M' },
  { num: 'III', discount: '−2.0%', gmv: '₩50.4M' },
  { num: 'IV',  discount: '−2.5%', gmv: '₩93.6M' },
  { num: 'V',   discount: '−3.0%', gmv: '₩144M' },
];

export default function RegisterPage({ lang, navigate, setUser, toast }) {
  const isMobile = useIsMobile();
  const ko = lang === 'ko';
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', referral: '',
    idType: 'passport', idNumber: '', agreeTerms: false, agreePrivacy: false, agreeMarketing: false,
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = {
    width: '100%', background: T.bg1, border: `1px solid ${T.border}`,
    color: T.text, padding: '11px 14px', fontSize: 14, outline: 'none',
    fontFamily: T.sans, marginBottom: 12,
  };

  const handleCreateAccount = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    try {
      const user = await API.auth.register({ name: form.name, email: form.email, phone: form.phone });
      setUser({ ...user, kycStatus: 'unverified', gate: 0, gmv: 0 });
      setStep(3);
    } catch {
      toast(ko ? '가입 오류. 다시 시도하세요.' : 'Registration error.', 'error');
    } finally {
      setSubmitting(false); }
  };

  const handleKYC = async () => {
    if (!form.idNumber) return;
    setSubmitting(true);
    try {
      await API.kyc.submit({ idType: form.idType, idNumber: form.idNumber });
      setUser(u => ({ ...u, kycStatus: 'in_review' }));
      setStep(4);
    } catch {
      toast(ko ? 'KYC 제출 오류.' : 'KYC error.', 'error');
    } finally { setSubmitting(false); }
  };

  const filledPct = Math.round((FOUNDERS_CAP - SPOTS_REMAINING) / FOUNDERS_CAP * 100);
  const pad = isMobile ? '32px 16px' : '60px 80px';
  const maxW = 560;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', padding: pad }}>
      <div style={{ maxWidth: maxW, margin: '0 auto' }}>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 36 }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{
              height: 2, flex: n === step ? 2 : 1,
              background: n < step ? T.gold : n === step ? T.gold : T.border,
              opacity: n > step ? 0.4 : 1,
              transition: 'all 0.4s',
            }} />
          ))}
        </div>

        {/* ── STEP 1: Founders Welcome ── */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 16 }}>
              {ko ? 'Founders Club · 지금 가입하면 첫날부터' : 'Founders Club · Your gates start day one'}
            </div>
            <h1 style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: isMobile ? 36 : 48, fontWeight: 400, color: T.text, marginBottom: 8, lineHeight: 1.1 }}>
              {ko ? '한국보다 최대 −3% 저렴하게.' : 'Up to −3% below Korea retail.'}
            </h1>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.8, marginBottom: 28, maxWidth: 460 }}>
              {ko
                ? 'Founders Club 멤버는 실물 구매 및 GoldPath 적립 시 거래 누적(GMV)에 따라 자동으로 할인이 적용됩니다. 한 번 열린 게이트는 닫히지 않습니다.'
                : 'Founders Club members get automatic lifetime discounts on physical purchases and GoldPath savings, scaling with your total transaction volume. Gates never close once opened.'}
            </p>

            {/* Gate strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', border: `1px solid ${T.goldBorder}`, marginBottom: 20 }}>
              {GATES.map((g, i) => (
                <div key={i} style={{
                  padding: '14px 8px', textAlign: 'center',
                  borderRight: i < 4 ? `1px solid ${T.goldBorder}` : 'none',
                  background: g.apex ? 'rgba(74,222,128,0.04)' : 'transparent',
                  borderTop: g.apex ? '2px solid rgba(74,222,128,0.45)' : '2px solid transparent',
                }}>
                  <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: g.apex ? '#4ade80' : T.gold, lineHeight: 1 }}>{g.discount}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textMuted, marginTop: 4 }}>{g.gmv}+</div>
                </div>
              ))}
            </div>

            {/* Cap counter */}
            <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 32, color: T.gold, lineHeight: 1 }}>{SPOTS_REMAINING}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textMuted, letterSpacing: '0.14em', marginTop: 2 }}>{ko ? `/ ${FOUNDERS_CAP} 남은 자리` : `/ ${FOUNDERS_CAP} spots remaining`}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 4, background: 'rgba(197,165,114,0.12)', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${filledPct}%`, background: T.gold }} />
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.goldDim }}>{filledPct}% FILLED</div>
              </div>
            </div>

            {/* Bronze entry card */}
            <div style={{ background: T.bgCard, border: `1px solid ${T.goldBorder}`, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>Bronze (Entry)</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: ko ? '보관료' : 'Storage', val: '0.75% p.a.' },
                  { label: ko ? '할인' : 'Discount', val: ko ? '가입 즉시 시작' : 'Starts at Gate I' },
                  { label: ko ? '보험' : 'Insurance', val: "Lloyd's of London" },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.textMuted, letterSpacing: '0.1em', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(2)} style={{
              width: '100%', background: T.gold, border: 'none', color: '#0d0b08',
              padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans,
            }}>
              {ko ? '가입 시작하기 →' : 'Start Registration →'}
            </button>
            <button onClick={() => navigate('founders')} style={{
              width: '100%', background: 'none', border: 'none', color: T.textMuted,
              padding: '12px', fontSize: 13, cursor: 'pointer', fontFamily: T.sans, marginTop: 8,
            }}>
              {ko ? 'Founders Club 자세히 보기' : 'Learn more about Founders Club'}
            </button>
          </div>
        )}

        {/* ── STEP 2: Account Info ── */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>02 / 05</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 24 : 32, fontWeight: 300, color: T.text, marginBottom: 24 }}>
              {ko ? '기본 정보' : 'Your details'}
            </h2>

            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 4 }}>{ko ? '이름 *' : 'Full name *'}</label>
            <input value={form.name} onChange={e => upd('name', e.target.value)} placeholder={ko ? '홍길동' : 'Full name'} style={inp} />

            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 4 }}>{ko ? '이메일 *' : 'Email *'}</label>
            <input value={form.email} onChange={e => upd('email', e.target.value)} type="email" placeholder="email@example.com" style={inp} />

            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 4 }}>{ko ? '휴대폰' : 'Phone'}</label>
            <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+82 10-0000-0000" style={inp} />

            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 4 }}>{ko ? '추천인 코드 (선택)' : 'Referral code (optional)'}</label>
            <input value={form.referral} onChange={e => upd('referral', e.target.value)} placeholder="aurum-xxxx" style={{ ...inp, marginBottom: 24 }} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: 'none', border: `1px solid ${T.border}`, color: T.textSub, padding: '14px', cursor: 'pointer', fontFamily: T.sans, fontSize: 14 }}>← {ko ? '이전' : 'Back'}</button>
              <button onClick={handleCreateAccount} disabled={!form.name || !form.email || submitting} style={{
                flex: 2, background: form.name && form.email && !submitting ? T.gold : T.border,
                border: 'none', color: form.name && form.email && !submitting ? '#0d0b08' : T.textMuted,
                padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans,
              }}>
                {submitting ? (ko ? '생성 중...' : 'Creating...') : (ko ? '계정 만들기 →' : 'Create account →')}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: KYC ── */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>03 / 05</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 24 : 32, fontWeight: 300, color: T.text, marginBottom: 8 }}>
              {ko ? '본인 확인 (KYC)' : 'Identity verification'}
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub, lineHeight: 1.8, marginBottom: 24 }}>
              {ko ? '한국 금융당국 기준 KYC입니다. 신분증 번호만 입력하면 됩니다. 검토는 1-2 영업일이 소요됩니다.' : 'Required by Korean financial regulations. Enter your ID number. Review takes 1-2 business days.'}
            </p>

            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 4 }}>{ko ? '신분증 종류' : 'ID type'}</label>
            <select value={form.idType} onChange={e => upd('idType', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="passport">{ko ? '여권' : 'Passport'}</option>
              <option value="resident">{ko ? '주민등록증' : 'Resident ID'}</option>
              <option value="driver">{ko ? '운전면허증' : 'Driver\'s license'}</option>
            </select>

            <label style={{ fontFamily: T.sans, fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 4 }}>{ko ? '신분증 번호' : 'ID number'}</label>
            <input value={form.idNumber} onChange={e => upd('idNumber', e.target.value)} placeholder={ko ? '번호를 입력하세요' : 'Enter ID number'} style={{ ...inp, marginBottom: 24 }} />

            <div style={{ background: T.bg1, border: `1px solid ${T.border}`, padding: '12px 14px', marginBottom: 20, fontFamily: T.sans, fontSize: 12, color: T.textSub, lineHeight: 1.7 }}>
              {ko ? '검토 완료 전에도 사이트 전체를 이용할 수 있습니다. KYC 승인 후 결제 및 GoldPath 적립이 활성화됩니다.' : 'You can browse the full site while under review. Payment and GoldPath funding unlock after KYC approval.'}
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button onClick={handleKYC} disabled={!form.idNumber || submitting} style={{
                flex: 2, background: form.idNumber && !submitting ? T.gold : T.border,
                border: 'none', color: form.idNumber && !submitting ? '#0d0b08' : T.textMuted,
                padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans,
              }}>
                {submitting ? (ko ? '제출 중...' : 'Submitting...') : (ko ? 'KYC 제출 →' : 'Submit KYC →')}
              </button>
            </div>
            <button onClick={() => setStep(4)} style={{ width:'100%', background: 'none', border: `1px solid rgba(197,165,114,0.25)`, color: T.textSub, padding: '12px', cursor: 'pointer', fontFamily: T.sans, fontSize: 13, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <span>{ko ? '지금은 건너뛰기 — 나중에 인증하기' : 'Skip for now — verify identity later'}</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: 'rgba(197,165,114,0.5)', letterSpacing:'0.1em' }}>{ko ? '(쇼핑 가능, 결제만 잠금)' : '(Browse freely, purchase locked)'}</span>
            </button>
          </div>
        )}

        {/* ── STEP 4: First Service ── */}
        {step === 4 && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldDim, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>04 / 05</div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: isMobile ? 24 : 32, fontWeight: 300, color: T.text, marginBottom: 8 }}>
              {ko ? '무엇부터 시작하시겠어요?' : 'Where do you want to start?'}
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub, lineHeight: 1.8, marginBottom: 24 }}>
              {ko ? '지금 바로 시작하거나, 나중에 대시보드에서 선택할 수 있습니다.' : 'Start now or choose later from your dashboard.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '⚖️', title: ko ? 'GoldPath 금환 설정' : 'Set up GoldPath', sub: ko ? '월 20만원부터 금 자동 적립' : 'Auto-accumulate from ₩200K/month', route: 'agp-enroll' },
                { icon: '🥇', title: ko ? '실물 구매 둘러보기' : 'Browse physical metals', sub: ko ? '금·은 바 및 금화 즉시 구매' : 'Buy gold & silver bars and coins', route: 'shop' },
                { icon: '📊', title: ko ? '대시보드로 이동' : 'Go to my dashboard', sub: ko ? '계정 현황 및 게이트 진행 확인' : 'See your account and gate progress', route: 'dashboard' },
              ].map((opt, i) => (
                <button key={i} onClick={() => { navigate(opt.route); setStep(5); }} style={{
                  background: T.bg1, border: `1px solid ${T.goldBorder}`,
                  padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', gap: 14, alignItems: 'center',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(197,165,114,0.6)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(197,165,114,0.2)'}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontFamily: T.sansKr, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{opt.title}</div>
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.textSub }}>{opt.sub}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: T.goldDim, fontSize: 18 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 5: Done ── */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 72, height: 72, border: `1px solid ${T.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: T.goldGlow }}>
              <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 28, color: T.gold }}>AU</span>
            </div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 28, fontWeight: 300, color: T.text, marginBottom: 12 }}>
              {ko ? 'Founders Club에 오신 것을 환영합니다' : 'Welcome to Founders Club'}
            </h2>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.gold, letterSpacing: '0.18em', marginBottom: 20 }}>BRONZE · GATE 0 OF 5</div>
            <p style={{ fontFamily: T.sans, fontSize: 14, color: T.textSub, lineHeight: 1.8, maxWidth: 400, margin: '0 auto 32px' }}>
              {ko
                ? 'KYC 검토가 완료되면 거래가 활성화됩니다. 그 전까지 사이트 전체를 자유롭게 이용하세요.'
                : 'Transactions activate after KYC review. Until then, explore the full site freely.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('founders')} style={{ background: T.gold, border: 'none', color: '#0d0b08', padding: '14px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans }}>
                {ko ? 'Founders Club 보기 →' : 'View Founders Club →'}
              </button>
              <button onClick={() => navigate('dashboard')} style={{ background: 'none', border: `1px solid ${T.goldBorder}`, color: T.textSub, padding: '14px 28px', fontSize: 14, cursor: 'pointer', fontFamily: T.sans }}>
                {ko ? '대시보드' : 'Dashboard'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
