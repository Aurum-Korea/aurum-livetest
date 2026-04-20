import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';

function FormCard({ children, width = 440 }) {
  return (
    <div style={{
      maxWidth: width, margin: '0 auto',
      background: T.card, border: `1px solid ${T.goldBorder}`,
      padding: '36px 36px 32px', position: 'relative',
      animation: 'fade-up 0.4s cubic-bezier(0.2,0.8,0.2,1) both',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }} />
      {children}
    </div>
  );
}

function ProgressBar({ step, total, labels }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[...Array(total)].map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2,
            background: i < step ? T.gold : i === step ? T.goldD : T.border,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.mono, fontSize: 9, letterSpacing: '0.2em', color: T.muted }}>
        <span style={{ color: T.gold }}>STEP {step + 1} / {total}</span>
        <span>{labels[step]}</span>
      </div>
    </div>
  );
}

function Field({ label, sub, required, children, tip }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <label style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {label}
          {required && <span style={{ color: T.gold, marginLeft: 4 }}>·</span>}
        </label>
        {tip && (
          <span title={tip} style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em', cursor: 'help' }}>
            왜 묻는가? ⓘ
          </span>
        )}
      </div>
      {children}
      {sub && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.08em', marginTop: 6, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToS, setAgreeToS] = useState(false);
  const [agreePipa, setAgreePipa] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  const canProceedStep0 = email && phone && password.length >= 8;
  const canProceedStep1 = agreeToS && agreePipa;
  const canProceedStep2 = verifyCode.length === 6;

  return (
    <>
      <TickerBar />
      <QuietNav page="signup" />

      {/* Hero */}
      <div style={{ padding: '60px 24px 30px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.34em', marginBottom: 20 }}>
          CREATE ACCOUNT · FOUNDERS · 500 SEATS
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 400, color: T.text, lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-0.015em' }}>
          5분 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>안에.</em>
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.goldD, fontWeight: 300 }}>
          Begin in five minutes.
        </div>
      </div>

      {/* Social proof · waitlist pulse */}
      <div style={{ textAlign: 'center', marginBottom: 32, padding: '0 24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: T.goldGlow, border: `1px solid ${T.goldBorder}` }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.gold, letterSpacing: '0.2em' }}>
            342명 · 이번 주 가입 · 158 seats remaining
          </span>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '0 24px 60px' }}>
        <FormCard>
          <ProgressBar step={step} total={4} labels={['계정 · ACCOUNT', '약관 · TERMS', '인증 · VERIFY', '확인 · CONFIRM']} />

          <div style={{ marginTop: 30 }}>
            {step === 0 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <Field label="이메일 · EMAIL" required>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </Field>
                <Field label="휴대전화 · PHONE" required sub="한국 번호만 · +82 10-XXXX-XXXX">
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" />
                </Field>
                <Field label="비밀번호 · PASSWORD" required sub="최소 8자 · 문자 + 숫자">
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </Field>
                <div style={{ marginTop: 28 }}>
                  <PrimaryCTA onClick={() => canProceedStep0 && setStep(1)} disabled={!canProceedStep0}>
                    다음 → NEXT
                  </PrimaryCTA>
                </div>
              </div>
            )}

            {step === 1 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 0', borderBottom: `1px dashed ${T.border}` }}>
                    <input type="checkbox" checked={agreeToS} onChange={e => setAgreeToS(e.target.checked)} style={{ marginTop: 3, accentColor: T.gold }} />
                    <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.6, flex: 1 }}>
                      <strong style={{ color: T.text }}>이용약관 동의 · Terms of Service</strong> <span style={{ color: T.gold }}>(필수)</span>
                      <a style={{ color: T.goldD, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', marginLeft: 8, cursor: 'pointer' }}>읽기 →</a>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 0', borderBottom: `1px dashed ${T.border}` }}>
                    <input type="checkbox" checked={agreePipa} onChange={e => setAgreePipa(e.target.checked)} style={{ marginTop: 3, accentColor: T.gold }} />
                    <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.6, flex: 1 }}>
                      <strong style={{ color: T.text }}>개인정보 처리방침 동의 · Korean PIPA</strong> <span style={{ color: T.gold }}>(필수)</span>
                      <a style={{ color: T.goldD, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', marginLeft: 8, cursor: 'pointer' }}>읽기 →</a>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '12px 0' }}>
                    <input type="checkbox" checked={agreeMarketing} onChange={e => setAgreeMarketing(e.target.checked)} style={{ marginTop: 3, accentColor: T.gold }} />
                    <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.6, flex: 1 }}>
                      <strong style={{ color: T.text }}>마케팅 수신 동의</strong> <span style={{ color: T.muted }}>(선택)</span>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4, letterSpacing: '0.06em' }}>
                        드물게 보냅니다 · Rare updates only
                      </div>
                    </div>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '15px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em' }}>← 이전</button>
                  <PrimaryCTA onClick={() => canProceedStep1 && setStep(2)} disabled={!canProceedStep1}>다음 →</PrimaryCTA>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 18, color: T.text, lineHeight: 1.5, marginBottom: 8, fontWeight: 500 }}>
                  이메일 확인 · Verify email
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.6, marginBottom: 22 }}>
                  <strong style={{ color: T.text }}>{email || 'you@example.com'}</strong>로 6자리 코드를 보냈습니다. 스팸함도 확인해주세요.
                </div>
                <Field label="인증 코드 · CODE" required sub="10분 내 입력 · 유효시간 남음">
                  <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                    style={{ fontFamily: T.mono, fontSize: 22, letterSpacing: '0.4em', textAlign: 'center', padding: '18px 14px' }} />
                </Field>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.12em', textAlign: 'center', marginBottom: 20, marginTop: 6 }}>
                  재전송 가능 · <a style={{ color: T.gold, cursor: 'pointer' }}>Resend</a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '15px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em' }}>← 이전</button>
                  <PrimaryCTA onClick={() => canProceedStep2 && setStep(3)} disabled={!canProceedStep2}>확인 →</PrimaryCTA>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ animation: 'fade-up 0.3s both', textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 56, color: T.goldB, lineHeight: 1, marginBottom: 20 }}>
                  ✓
                </div>
                <div style={{ fontFamily: T.serifKr, fontSize: 22, color: T.text, fontWeight: 500, marginBottom: 8 }}>
                  계정이 생성되었습니다.
                </div>
                <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.goldD, marginBottom: 30 }}>
                  Account created.
                </div>
                <div style={{ padding: 18, background: T.deep, border: `1px dashed ${T.goldBorder}`, marginBottom: 26, textAlign: 'left' }}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 8 }}>NEXT · IDENTITY VERIFICATION</div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.6 }}>
                    Founders 가입을 완료하려면 본인인증이 필요합니다 — 약 3분 소요. 지금 진행하거나 이메일 링크로 나중에 완료 가능합니다.
                  </div>
                </div>
                <PrimaryCTA to="/kyc">본인인증 시작 · Begin KYC →</PrimaryCTA>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 14, letterSpacing: '0.18em' }}>
                  또는 <a style={{ color: T.gold, cursor: 'pointer' }}>나중에</a>
                </div>
              </div>
            )}
          </div>
        </FormCard>

        <div style={{ textAlign: 'center', marginTop: 28, fontFamily: T.sansKr, fontSize: 13, color: T.muted }}>
          이미 계정이 있으신가요? <a style={{ color: T.gold, cursor: 'pointer', fontFamily: T.serif, fontStyle: 'italic', fontSize: 14 }}>로그인</a>
        </div>
      </div>

      <QuietFooter />
    </>
  );
}
