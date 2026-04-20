import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuietNav from '../components/QuietNav';
import QuietFooter from '../components/QuietFooter';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';

function FormCard({ children, width = 440 }

function Field({ label, sub, required, children, tip }

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [showTotp, setShowTotp] = useState(false);

  return (
    <>
      <QuietNav page="login" />

      <div style={{ padding: '80px 24px 30px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.34em', marginBottom: 20 }}>
          WELCOME BACK · PATRON
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 400, color: T.text, lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-0.015em' }}>
          다시 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>만나서 반갑습니다.</em>
        </h1>
      </div>

      <div style={{ padding: '20px 24px 60px' }}>
        <FormCard width={400}>
          {/* KakaoTalk SSO · primary Korean pattern */}
          <button style={{
            width: '100%', background: T.kakao, color: T.kakaoInk,
            padding: '14px 18px', fontFamily: T.sansKr, fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 12, transition: 'all 0.2s', cursor: 'pointer', border: 'none',
          }}>
            <svg width="18" height="17" viewBox="0 0 18 17" fill="currentColor">
              <path d="M9 0.5C4.03 0.5 0 3.68 0 7.6c0 2.54 1.69 4.77 4.22 6.03L3 17l3.85-2.5c.7.1 1.42.15 2.15.15 4.97 0 9-3.18 9-7.1S13.97 0.5 9 0.5z"/>
            </svg>
            카카오로 시작 · KakaoTalk
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 24px' }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.22em' }}>OR · 이메일</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <Field label="이메일 · EMAIL" required>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>

          <Field label="비밀번호 · PASSWORD" required>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>

          {showTotp && (
            <div style={{ animation: 'fade-up 0.3s both' }}>
              <Field label="2FA 코드 · TOTP" required sub="인증 앱에서 6자리 코드 확인">
                <input type="text" value={totp} onChange={e => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                  style={{ fontFamily: T.mono, fontSize: 20, letterSpacing: '0.3em', textAlign: 'center' }} />
              </Field>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.14em', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: T.gold }} />
              기억하기 · Remember
            </label>
            <a style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.gold, cursor: 'pointer' }}>Forgot password</a>
          </div>

          <PrimaryCTA onClick={() => !showTotp ? setShowTotp(true) : null}>
            {showTotp ? '로그인 → SIGN IN' : '계속 → CONTINUE'}
          </PrimaryCTA>

          <div style={{ marginTop: 16, padding: '10px 12px', background: T.deep, border: `1px dashed ${T.border}`, fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.5 }}>
            ⓘ 모바일 · Face ID / Touch ID 사용 가능
          </div>
        </FormCard>

        <div style={{ textAlign: 'center', marginTop: 28, fontFamily: T.sansKr, fontSize: 13, color: T.muted }}>
          아직 가입하지 않았다면 <a style={{ color: T.gold, cursor: 'pointer', fontFamily: T.serif, fontStyle: 'italic', fontSize: 14 }}>Founders 신청</a>
        </div>
      </div>

      <QuietFooter />
    </>
  );
}
