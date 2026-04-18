import { useState, useEffect } from 'react';
import { T, useIsMobile, API } from '../lib/index.jsx';
import { ConsentCheckbox, PaymentMethodCard } from '../components/UI.jsx';

const STEPS = [
  { icon: '✍️', kr: '가입',    desc: '10분 내 온라인으로 가입하고 한국 표준 KYC (실명 확인, 휴대폰 인증)를 완료합니다.' },
  { icon: '💰', kr: '입금',    desc: '토스뱅크·한국 주요 은행에서 일회 또는 월간 자동이체. 신용카드 및 암호화폐 (USDT·USDC) 입금도 지원합니다. 최소 월 20만원부터.' },
  { icon: '⚖️', kr: '그램 적립', desc: '입금액이 실시간 국제 현물가 + 2.0% 프리미엄으로 AGP 그램으로 전환됩니다. 국내 실물 프리미엄을 피하고 국제 시세에 접근하세요.' },
  { icon: '📊', kr: '관리',    desc: '대시보드에서 보유 그램, KRW 가치, 손익, 보관료, 전환 기준 진행률을 실시간으로 확인하세요. 매일 백킹 리포트 공개.' },
  { icon: '🥇', kr: '전환',    desc: '100g (또는 1,000g 기준) 도달 시 LBMA 승인 실물 바로 무료 전환. 또는 언제든 국제 현물가로 매도 후 KRW를 한국 은행 계좌로 수령.' },
];

/* ═══════════════════════════════════════════════════════════════════════
   AGP INTRO — step-by-step walkthrough
   ═══════════════════════════════════════════════════════════════════════ */
export function AGPIntroPage({ lang, navigate }) {
  const [step, setStep] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft')  handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step]);

  const handleNext = () => step < STEPS.length - 1 ? setStep(s => s + 1) : navigate('agp-enroll');
  const handlePrev = () => step > 0 && setStep(s => s - 1);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{ maxWidth: 880, width: '100%' }}>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <span style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: '0.2em', color: T.goldDim }}>
            <span style={{ color: T.gold, fontWeight: 500 }}>{String(step + 1).padStart(2, '0')}</span> / 05
          </span>
          <button onClick={() => navigate('agp-enroll')} style={{
            background: 'none', border: 'none', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.15em',
            color: T.textMuted, textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.3s',
          }} onMouseEnter={e => e.currentTarget.style.color = T.gold} onMouseLeave={e => e.currentTarget.style.color = T.textMuted}>
            가입 신청 바로가기 →
          </button>
        </div>

        {/* Main card */}
        <div style={{
          background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
          border: `1px solid ${T.goldBorder}`, padding: 'clamp(40px,8vw,80px) clamp(24px,6vw,60px)',
          minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(197,165,114,0.06), transparent 60%)', pointerEvents: 'none' }} />

          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.28em', color: T.gold, textTransform: 'uppercase', marginBottom: 28 }}>
            AGP는 이렇게 작동합니다
          </div>
          <div style={{ fontSize: isMobile ? 44 : 56, marginBottom: 28, filter: 'drop-shadow(0 0 40px rgba(197,165,114,0.3))' }}>
            {current.icon}
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 400, color: T.text, marginBottom: 28, letterSpacing: '-0.01em' }}>
            {current.kr}
          </h2>
          <p style={{ maxWidth: 540, color: T.textSub, fontSize: 16, lineHeight: 1.8, fontFamily: T.sans }}>
            {current.desc}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, gap: 16 }}>
          <button onClick={handlePrev} disabled={step === 0} style={{
            background: 'transparent', border: `1px solid ${T.goldBorderStrong}`,
            color: step === 0 ? T.textMuted : T.text, padding: '14px 28px',
            fontFamily: T.sans, fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer',
            opacity: step === 0 ? 0.35 : 1, display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>← 이전</button>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {STEPS.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 32 : 20, height: 2, cursor: 'pointer',
                background: i === step ? T.gold : i < step ? T.goldDim : T.goldBorder,
                transition: 'all 0.4s',
              }} />
            ))}
          </div>

          <button onClick={handleNext} style={{
            background: T.gold, color: '#0a0a0a', border: `1px solid ${T.gold}`,
            padding: '14px 28px', fontFamily: T.sans, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
          }} onMouseEnter={e => e.currentTarget.style.background = T.goldBright} onMouseLeave={e => e.currentTarget.style.background = T.gold}>
            {isLast ? '가입 신청 시작' : '다음'}
          </button>
        </div>

        {/* All steps overview grid */}
        <div style={{ marginTop: 48, borderTop: `1px solid ${T.goldBorder}`, paddingTop: 36 }}>
          <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: '0.28em', color: T.gold, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>AGP 전체 단계</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {STEPS.map((s, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                background: step === i ? T.goldGlow : '#141414',
                border: `1px solid ${step === i ? T.goldBorderStrong : T.goldBorder}`,
                padding: '16px 18px', cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', gap: 12,
                ...(i === 4 ? { gridColumn: '1 / -1', maxWidth: '50%', margin: '0 auto', width: '100%' } : {}),
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, marginBottom: 3 }}>{String(i + 1).padStart(2, '0')}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: step === i ? T.text : T.textSub, fontWeight: step === i ? 600 : 400 }}>{s.kr}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ marginTop: 36, display: 'flex', gap: 12, flexDirection: 'column' }}>
          <button onClick={() => navigate('agp-enroll')} className="btn-primary" style={{ width: '100%', padding: '16px' }}>🚀 AGP 가입하기</button>
          <button onClick={() => navigate('agp-report')} className="btn-outline" style={{ width: '100%', padding: '16px' }}>📊 오늘의 백킹 리포트</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   AGP ENROLL — full sign-up form
   ═══════════════════════════════════════════════════════════════════════ */
export function AGPEnrollPage({ lang, navigate, prices = { gold: 3400 }, krwRate = 1460 }) {
  const ko = lang === 'ko';
  const isMobile = useIsMobile();
  const [formStep, setFormStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    monthlyAmount: 500000, frequency: 'monthly',
    payMethod: 'toss', bankName: '', accountNum: '',
    agreeTerms: false, agreePrivacy: false, agreeMarketing: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fmtKRW = n => Math.round(n).toLocaleString('ko-KR');
  // Note: AGP account also grants access to all physical shop products
  const SPOT_PER_GRAM = Math.round(prices.gold * krwRate / 31.1035); // live KRW per gram
  const gramEstimate = (form.monthlyAmount / SPOT_PER_GRAM).toFixed(3);

  const handleEnroll = async () => {
    if (!form.agreeTerms || !form.agreePrivacy) return;
    setSubmitting(true);
    try {
      const result = await API.agp.enroll(form);
      setEnrolled(true);
    } catch { }
    finally { setSubmitting(false); }
  };

  const inp = {
    width: '100%', background: '#111', border: `1px solid ${T.border}`, color: T.text,
    padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: T.sans, marginBottom: 12,
  };

  const stepLabels = [ko ? '기본 정보' : 'Basic Info', ko ? '적립 설정' : 'Plan Setup', ko ? '결제 수단' : 'Payment', ko ? '동의 및 확인' : 'Review & Submit'];

  if (enrolled) return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', background: T.bg }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
      <h2 style={{ fontFamily: T.serifKr, fontSize: 28, color: T.text, fontWeight: 300, marginBottom: 12 }}>AGP 가입 완료!</h2>
      <p style={{ fontFamily: T.sans, fontSize: 15, color: T.textSub, lineHeight: 1.8, maxWidth: 480, marginBottom: 28 }}>
        {ko ? '가입이 완료되었습니다. 이메일로 확인서가 발송됩니다. 첫 결제일에 그램이 적립됩니다.' : 'Enrollment complete. Confirmation sent by email. Grams will be credited on your first payment date.'}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('dashboard')} className="btn-primary">{ko ? '대시보드로' : 'Go to Dashboard'}</button>
        <button onClick={() => navigate('home')} className="btn-outline">{ko ? '홈으로' : 'Home'}</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: '90vh', padding: isMobile ? '40px 16px' : '60px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Step indicator */}
        <div className="eyebrow" style={{ marginBottom: 20 }}>AGP 가입 신청</div>
        <div style={{ display: 'flex', gap: 0, marginBottom: 36, borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
          {stepLabels.map((l, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 12, background: formStep > i + 1 ? T.gold : formStep === i + 1 ? T.bg1 : T.bg1, border: `2px solid ${formStep >= i + 1 ? T.gold : T.border}`, color: formStep > i + 1 ? '#0a0a0a' : formStep === i + 1 ? T.gold : T.textMuted }}>
                {formStep > i + 1 ? '✓' : i + 1}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 10, color: formStep === i + 1 ? T.text : T.textMuted, paddingBottom: 12, borderBottom: formStep === i + 1 ? `2px solid ${T.gold}` : '2px solid transparent' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Basic info */}
        {formStep === 1 && (
          <div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, margin: '0 0 20px' }}>{ko ? '기본 정보 입력' : 'Basic Information'}</h2>
            <input value={form.name}  onChange={e => upd('name', e.target.value)}  placeholder={ko ? '이름 (실명)' : 'Full name'} style={inp} />
            <input value={form.email} onChange={e => upd('email', e.target.value)} placeholder={ko ? '이메일 주소' : 'Email'} type="email" style={inp} />
            <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder={ko ? '휴대폰 번호 (010-xxxx-xxxx)' : 'Mobile number'} style={inp} />
            <button disabled={!form.name || !form.email} onClick={() => setFormStep(2)} style={{ width: '100%', background: form.name && form.email ? T.gold : T.border, border: 'none', color: form.name && form.email ? '#0a0a0a' : T.textMuted, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans }}>
              {ko ? '다음' : 'Next'} →
            </button>
          </div>
        )}

        {/* Step 2: Plan setup */}
        {formStep === 2 && (
          <div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, margin: '0 0 20px' }}>{ko ? '적립 설정' : 'Plan Setup'}</h2>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: T.goldDim, display: 'block', marginBottom: 18 }}>월 적립액 · MONTHLY CONTRIBUTION</label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.text }}>₩{fmtKRW(form.monthlyAmount)}</span>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textMuted, fontStyle: 'italic' }}>/ 월</span>
              </div>
              <input type="range" min="200000" max="3000000" step="50000" value={form.monthlyAmount}
                style={{ '--pct': `${((form.monthlyAmount - 200000) / (3000000 - 200000) * 100).toFixed(1)}%` }}
                onChange={e => upd('monthlyAmount', +e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: T.mono, fontSize: 9, color: T.textMuted, letterSpacing: '0.12em' }}>
                <span>₩200K</span><span>₩1M</span><span>₩2M</span><span>₩3M</span>
              </div>
            </div>

            <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.2em', marginBottom: 14 }}>첫 달 예상 적립 금액</div>
              {[
                [ko ? '적립 그램 (예상)' : 'Est. grams credited', `${gramEstimate} g`],
                [ko ? '한국 소매 환산가' : 'Korea retail equiv.', `₩${fmtKRW(gramEstimate * SPOT_PER_GRAM * 1.184)}`],
                [ko ? 'AGP 실매입가' : 'AGP purchase price', `₩${fmtKRW(form.monthlyAmount)}`],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? `1px dashed ${T.goldBorder}` : 'none' }}>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub }}>{k}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 14, color: i === 1 ? T.textMuted : T.gold, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', color: T.goldDim, display: 'block', marginBottom: 10 }}>적립 주기</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ k: 'monthly', ko: '매월', en: 'Monthly' }, { k: 'weekly', ko: '매주', en: 'Weekly' }].map(opt => (
                  <button key={opt.k} onClick={() => upd('frequency', opt.k)} style={{ flex: 1, background: form.frequency === opt.k ? T.goldGlow : T.bg1, border: `1px solid ${form.frequency === opt.k ? T.goldBorderStrong : T.border}`, color: T.text, padding: '12px', cursor: 'pointer', fontFamily: T.sans, fontSize: 14 }}>
                    {ko ? opt.ko : opt.en}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setFormStep(1)} className="btn-outline" style={{ flex: 1 }}>← {ko ? '이전' : 'Back'}</button>
              <button onClick={() => setFormStep(3)} className="btn-primary" style={{ flex: 2 }}>{ko ? '다음' : 'Next'} →</button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {formStep === 3 && (
          <div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, margin: '0 0 20px' }}>{ko ? '결제 수단' : 'Payment Method'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { v: 'toss',   badge: 'TOSS PAY',    label: ko ? '토스뱅크 자동이체' : 'Toss Bank Auto-Debit', sub: ko ? '가장 빠른 정산' : 'Fastest settlement', fee: ko ? '수수료 없음' : 'No fee' },
                { v: 'wire',   badge: 'WIRE',         label: ko ? '한국 은행 자동이체' : 'Korean Bank Auto-Debit', sub: 'KB · 신한 · 하나 · 우리', fee: ko ? '수수료 없음' : 'No fee' },
                { v: 'card',   badge: 'CARD',         label: ko ? '신용카드' : 'Credit Card', sub: 'Visa · Mastercard', fee: '1.5%' },
                { v: 'crypto', badge: 'CRYPTO',       label: 'USDT / USDC', sub: 'TRC-20 / ERC-20', fee: ko ? '최소 수수료' : 'Min fee' },
              ].map(opt => (
                <PaymentMethodCard key={opt.v} value={opt.v} selected={form.payMethod} onChange={v => upd('payMethod', v)}
                  label={opt.label} subtitle={opt.sub} badge={opt.badge} fee={opt.fee}>
                  {opt.v === 'wire' && (
                    <div>
                      <input value={form.bankName}    onChange={e => upd('bankName', e.target.value)}    placeholder={ko ? '은행명 (예: 토스뱅크)' : 'Bank name'} style={{ ...inp, marginBottom: 8 }} onClick={e => e.stopPropagation()} />
                      <input value={form.accountNum}  onChange={e => upd('accountNum', e.target.value)}  placeholder={ko ? '계좌번호' : 'Account number'} style={{ ...inp, marginBottom: 0 }} onClick={e => e.stopPropagation()} />
                    </div>
                  )}
                </PaymentMethodCard>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setFormStep(2)} className="btn-outline" style={{ flex: 1 }}>← {ko ? '이전' : 'Back'}</button>
              <button onClick={() => setFormStep(4)} className="btn-primary" style={{ flex: 2 }}>{ko ? '검토' : 'Review'} →</button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {formStep === 4 && (
          <div>
            <h2 style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, margin: '0 0 20px' }}>{ko ? '최종 확인 및 동의' : 'Review & Confirm'}</h2>

            <div style={{ background: T.bg1, border: `1px solid ${T.goldBorder}`, padding: '20px 24px', marginBottom: 20 }}>
              {[
                [ko ? '이름' : 'Name', form.name],
                [ko ? '이메일' : 'Email', form.email],
                [ko ? '월 적립액' : 'Monthly', `₩${fmtKRW(form.monthlyAmount)}`],
                [ko ? '적립 주기' : 'Frequency', form.frequency === 'monthly' ? (ko ? '매월' : 'Monthly') : (ko ? '매주' : 'Weekly')],
                [ko ? '결제 수단' : 'Payment', form.payMethod.toUpperCase()],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: T.sans, fontSize: 13, color: T.textSub }}>{k}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 13, color: T.text }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              {[
                { k: 'agreeTerms',    label: ko ? 'AGP 이용약관 및 귀금속 구매 조건 동의' : 'I agree to AGP Terms of Service and Purchase Conditions', required: true },
                { k: 'agreePrivacy',  label: ko ? '개인정보 수집·이용 동의 (PIPA)' : 'I agree to Privacy Policy (PIPA)', required: true },
                { k: 'agreeMarketing',label: ko ? '마케팅 정보 수신 동의 (가격 알림, 뉴스레터)' : 'Marketing communications (optional)', required: false },
              ].map(c => (
                <ConsentCheckbox key={c.k} checked={form[c.k]} onChange={v => upd(c.k, v)} label={c.label} required={c.required} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setFormStep(3)} className="btn-outline" style={{ flex: 1 }}>← {ko ? '이전' : 'Back'}</button>
              <button onClick={handleEnroll} disabled={!form.agreeTerms || !form.agreePrivacy || submitting} style={{
                flex: 2, background: form.agreeTerms && form.agreePrivacy && !submitting ? T.gold : T.border,
                border: 'none', color: form.agreeTerms && form.agreePrivacy && !submitting ? '#0a0a0a' : T.textMuted,
                padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.sans,
              }}>
                {submitting ? (ko ? '처리 중...' : 'Processing...') : (ko ? 'AGP 가입 완료' : 'Complete Enrollment')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
