import React, { useState, useMemo, useEffect, useRef } from 'react';
import QuietNav from '../components/QuietNav';
import TickerBar from '../components/TickerBar';
import QuietFooter from '../components/QuietFooter';
import { SectionHead, Prose, PrimaryCTA, GhostCTA } from '../components/UI';
import { T } from '../lib/tokens';
import { useAuth } from '../lib/auth';

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

export default function KycPage() {
  const { signIn } = useAuth();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState(null); // 'nice' | 'kcb' | 'passport'
  const [phone, setPhone] = useState('');
  const [rrnFirst, setRrnFirst] = useState('');
  const [dob, setDob] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [address, setAddress] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [monthlyRange, setMonthlyRange] = useState('');
  const [fundsProof, setFundsProof] = useState(null);
  const [pep, setPep] = useState(null);
  const [sanctions, setSanctions] = useState(null);
  const [ubo, setUbo] = useState(null);

  const labels = ['본인인증', '주소·소득원', '자금출처', 'MAS 선언', '검토·제출'];
  const highMonthly = monthlyRange === '500만원 이상' || monthlyRange === '1천만원 이상';

  return (
    <>
      <TickerBar />
      <QuietNav page="kyc" />

      <div style={{ padding: '40px 24px 20px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.goldD, letterSpacing: '0.34em', marginBottom: 20 }}>
          IDENTITY VERIFICATION · MAS PSPM 2019 COMPLIANCE
        </div>
        <h1 style={{ fontFamily: T.serifKr, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: T.text, lineHeight: 1.1, margin: '0 0 14px', letterSpacing: '-0.015em' }}>
          본인 <em style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.gold, fontWeight: 400 }}>확인.</em>
        </h1>
        <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
          Founders 가입을 완료하려면 본인인증이 필요합니다. 약 3분.
        </div>
      </div>

      <div style={{ padding: '20px 24px 60px' }}>
        <FormCard width={560}>
          <ProgressBar step={step} total={5} labels={labels} />

          <div style={{ marginTop: 30 }}>
            {/* STEP 1 · Identity method + KR identity */}
            {step === 0 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                {!method && (
                  <>
                    <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, marginBottom: 6 }}>
                      인증 방법 선택 · Choose method
                    </div>
                    <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.muted, marginBottom: 20 }}>
                      한국 거주자는 통합인증 권장 · Korean residents: use 통합인증
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {[
                        { k: 'nice', l: 'NICE 통합인증', en: 'Integrated ID verification', rec: true },
                        { k: 'kcb', l: 'KCB PASS', en: 'KCB mobile pass', rec: false },
                        { k: 'passport', l: '여권 · Passport', en: 'Non-Korean residents', rec: false },
                      ].map(m => (
                        <button key={m.k} onClick={() => setMethod(m.k)} style={{
                          width: '100%', padding: '16px 18px',
                          background: T.deep, border: `1px solid ${m.rec ? T.goldBorderS : T.border}`,
                          color: T.text, textAlign: 'left', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = T.goldGlow; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = m.rec ? T.goldBorderS : T.border; e.currentTarget.style.background = T.deep; }}>
                          <div>
                            <div style={{ fontFamily: T.serifKr, fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{m.l}</div>
                            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.14em' }}>{m.en}</div>
                          </div>
                          {m.rec && (
                            <span style={{ fontFamily: T.mono, fontSize: 8, color: T.gold, letterSpacing: '0.22em', padding: '3px 8px', border: `1px solid ${T.goldBorder}` }}>
                              RECOMMENDED
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {method && method !== 'passport' && (
                  <div style={{ animation: 'fade-up 0.3s both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                      <span style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500 }}>
                        {method === 'nice' ? 'NICE 통합인증' : 'KCB PASS'}
                      </span>
                      <button onClick={() => setMethod(null)} style={{ background: 'transparent', color: T.muted, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer' }}>← 변경</button>
                    </div>
                    <Field label="휴대전화 · PHONE" required tip="본인 명의 휴대전화로 SMS 인증">
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                      <Field label="주민번호 앞자리 · RRN" required tip="앞 6자리만 · 뒷자리는 저장되지 않음">
                        <input type="text" value={rrnFirst} onChange={e => setRrnFirst(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="YYMMDD" maxLength={6} />
                      </Field>
                      <Field label="이름 · NAME" required>
                        <input type="text" placeholder="홍길동" />
                      </Field>
                    </div>
                    <Field label="SMS 인증 코드" sub="휴대전화로 받은 6자리">
                      <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6}
                        style={{ fontFamily: T.mono, fontSize: 18, letterSpacing: '0.3em', textAlign: 'center' }} />
                    </Field>
                    <div style={{ marginTop: 22 }}>
                      <PrimaryCTA onClick={() => setStep(1)} disabled={!phone || !rrnFirst || !smsCode}>
                        확인 · VERIFY →
                      </PrimaryCTA>
                    </div>
                  </div>
                )}

                {method === 'passport' && (
                  <div style={{ animation: 'fade-up 0.3s both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                      <span style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500 }}>여권 업로드 · Passport</span>
                      <button onClick={() => setMethod(null)} style={{ background: 'transparent', color: T.muted, fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', cursor: 'pointer' }}>← 변경</button>
                    </div>
                    <div style={{ padding: 20, border: `2px dashed ${T.goldBorder}`, textAlign: 'center', marginBottom: 16, cursor: 'pointer' }}>
                      <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 30, color: T.goldD, marginBottom: 8 }}>📄</div>
                      <div style={{ fontFamily: T.serifKr, fontSize: 14, color: T.text, fontWeight: 500 }}>여권 사진 업로드</div>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.12em', marginTop: 6 }}>PDF · JPG · PNG · MAX 10MB</div>
                    </div>
                    <Field label="거주지 증명 · Proof of address" required sub="최근 3개월 내 공과금 · 은행 명세서">
                      <div style={{ padding: 16, border: `1px dashed ${T.border}`, textAlign: 'center', cursor: 'pointer' }}>
                        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.sub, letterSpacing: '0.14em' }}>+ UPLOAD</span>
                      </div>
                    </Field>
                    <PrimaryCTA onClick={() => setStep(1)}>다음 →</PrimaryCTA>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 · Address + income source */}
            {step === 1 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, marginBottom: 6 }}>
                  주소 · 소득원
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.muted, marginBottom: 20 }}>
                  AML · 자금세탁방지 · MAS 요구사항
                </div>
                <Field label="주소 · ADDRESS" required sub="NICE 인증 시 자동 채움 · editable" tip="거주지 확인 · regulatory">
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="서울특별시 강남구 ..." />
                </Field>
                <Field label="소득원 · INCOME SOURCE" required tip="MAS PSPM 2019 §14(2) · 자금 출처 확인 의무">
                  <select value={incomeSource} onChange={e => setIncomeSource(e.target.value)}>
                    <option value="">선택 · Select</option>
                    <option>근로소득 · Employment</option>
                    <option>사업소득 · Business</option>
                    <option>투자소득 · Investment</option>
                    <option>상속 · Inheritance</option>
                    <option>기타 · Other</option>
                  </select>
                </Field>
                <Field label="예상 월 적립 범위 · EXPECTED MONTHLY" required sub="변경 가능 · 정확한 예측 불필요">
                  <select value={monthlyRange} onChange={e => setMonthlyRange(e.target.value)}>
                    <option value="">선택 · Select</option>
                    <option>50만원 이하</option>
                    <option>50–200만원</option>
                    <option>200–500만원</option>
                    <option>500만원 이상</option>
                    <option>1천만원 이상</option>
                  </select>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
                  <button onClick={() => setStep(0)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '15px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em' }}>← 이전</button>
                  <PrimaryCTA onClick={() => setStep(highMonthly ? 2 : 3)} disabled={!address || !incomeSource || !monthlyRange}>
                    다음 →
                  </PrimaryCTA>
                </div>
              </div>
            )}

            {/* STEP 3 · Source of funds (conditional) */}
            {step === 2 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, marginBottom: 6 }}>
                  자금 출처 증빙 · Source of funds
                </div>
                <div style={{ padding: 14, background: T.goldGlow, border: `1px solid ${T.goldBorder}`, marginBottom: 22 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 6 }}>
                    왜 묻는가 · WHY WE ASK
                  </div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.sub, lineHeight: 1.6 }}>
                    월 적립이 {monthlyRange}에 해당하여 MAS PSPM 2019 §14(3) enhanced due diligence가 적용됩니다. 아래 중 하나를 업로드해주세요.
                  </div>
                </div>

                <Field label="증빙 문서 · PROOF" required sub="PDF · JPG · 최근 3개월 이내">
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      '최근 3개월 급여명세서 · Payslips',
                      '사업자등록증 + 최근 소득금액증명원 · Business registration',
                      'LP 투자 증명서 · LP certificate (family office)',
                      '기타 증빙 · Other documentation',
                    ].map((opt, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: fundsProof === i ? T.goldGlow : T.deep, border: `1px solid ${fundsProof === i ? T.goldBorderS : T.border}`, cursor: 'pointer' }}>
                        <input type="radio" checked={fundsProof === i} onChange={() => setFundsProof(i)} style={{ accentColor: T.gold }} />
                        <span style={{ fontFamily: T.sansKr, fontSize: 13, color: fundsProof === i ? T.text : T.sub }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </Field>

                {fundsProof !== null && (
                  <div style={{ padding: 16, border: `2px dashed ${T.goldBorder}`, textAlign: 'center', marginBottom: 16, cursor: 'pointer', animation: 'fade-up 0.3s both' }}>
                    <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 26, color: T.goldD, marginBottom: 6 }}>📎</div>
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, letterSpacing: '0.14em' }}>+ 파일 선택 · CHOOSE FILE</div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.12em', marginTop: 6 }}>MAX 10MB · encrypted upload</div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
                  <button onClick={() => setStep(1)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '15px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em' }}>← 이전</button>
                  <PrimaryCTA onClick={() => setStep(3)} disabled={fundsProof === null}>다음 →</PrimaryCTA>
                </div>
              </div>
            )}

            {/* STEP 4 · MAS declaration */}
            {step === 3 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, marginBottom: 6 }}>
                  MAS 선언 · Declarations
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.muted, marginBottom: 22 }}>
                  Singapore PSPM 2019 Act · required disclosures
                </div>

                {[
                  { q: 'PEP · 정치적 주요인물 여부', sub: 'Politically Exposed Person (현직 · 전직 3년 이내 고위직 포함)', k: 'pep', val: pep, set: setPep },
                  { q: '제재 대상국 연결', sub: 'Connection to sanctioned jurisdictions (OFAC · UN · EU · MAS)', k: 'sanctions', val: sanctions, set: setSanctions },
                  { q: '본인이 최종 수익 소유자입니까?', sub: 'Are you the ultimate beneficial owner of deposited funds?', k: 'ubo', val: ubo, set: setUbo },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px 0', borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ fontFamily: T.serifKr, fontSize: 14, color: T.text, fontWeight: 500, marginBottom: 3 }}>{item.q}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, letterSpacing: '0.06em', marginBottom: 10, lineHeight: 1.5 }}>{item.sub}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button onClick={() => item.set('yes')} style={{
                        padding: '10px', border: `1px solid ${item.val === 'yes' ? T.gold : T.border}`,
                        background: item.val === 'yes' ? T.goldGlow : 'transparent',
                        color: item.val === 'yes' ? T.gold : T.sub,
                        fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em',
                      }}>예 · YES</button>
                      <button onClick={() => item.set('no')} style={{
                        padding: '10px', border: `1px solid ${item.val === 'no' ? T.gold : T.border}`,
                        background: item.val === 'no' ? T.goldGlow : 'transparent',
                        color: item.val === 'no' ? T.gold : T.sub,
                        fontFamily: T.mono, fontSize: 11, letterSpacing: '0.14em',
                      }}>아니오 · NO</button>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
                  <button onClick={() => setStep(highMonthly ? 2 : 1)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '15px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em' }}>← 이전</button>
                  <PrimaryCTA onClick={() => setStep(4)} disabled={!pep || !sanctions || !ubo}>다음 →</PrimaryCTA>
                </div>
              </div>
            )}

            {/* STEP 5 · Review + submit */}
            {step === 4 && (
              <div style={{ animation: 'fade-up 0.3s both' }}>
                <div style={{ fontFamily: T.serifKr, fontSize: 17, color: T.text, fontWeight: 500, marginBottom: 6 }}>
                  검토 · Review
                </div>
                <div style={{ fontFamily: T.sansKr, fontSize: 12, color: T.muted, marginBottom: 22 }}>
                  제출 전 한 번 더 확인
                </div>

                <div style={{ background: T.deep, border: `1px solid ${T.border}`, padding: 18, marginBottom: 16 }}>
                  {[
                    { k: '인증 방법', v: method === 'nice' ? 'NICE 통합인증' : method === 'kcb' ? 'KCB PASS' : '여권' },
                    { k: '휴대전화', v: phone || '010-****-****' },
                    { k: '주소', v: address || '서울 강남구...' },
                    { k: '소득원', v: incomeSource || '—' },
                    { k: '예상 적립', v: monthlyRange || '—' },
                    ...(highMonthly ? [{ k: '자금 증빙', v: fundsProof !== null ? '업로드 완료' : '—' }] : []),
                    { k: 'PEP 여부', v: pep === 'yes' ? '해당' : '해당 없음' },
                    { k: '제재 연결', v: sanctions === 'yes' ? '해당' : '해당 없음' },
                    { k: 'UBO 본인', v: ubo === 'yes' ? '예' : '타인' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 7 ? `1px dashed ${T.border}` : 'none', fontFamily: T.mono, fontSize: 11 }}>
                      <span style={{ color: T.muted, letterSpacing: '0.1em' }}>{row.k}</span>
                      <span style={{ color: T.text }}>{row.v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ padding: 14, background: T.goldGlow, border: `1px dashed ${T.goldBorder}`, marginBottom: 20 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.gold, letterSpacing: '0.22em', marginBottom: 6 }}>NEXT STEP</div>
                  <div style={{ fontFamily: T.sansKr, fontSize: 13, color: T.sub, lineHeight: 1.65 }}>
                    제출 후 24시간 이내 심사 완료 · 결과는 이메일 + SMS로 알림. 승인 시 즉시 Founders 가입이 활성화됩니다.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setStep(3)} style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.sub, padding: '15px', fontFamily: T.mono, fontSize: 11, letterSpacing: '0.2em' }}>← 이전</button>
                  <PrimaryCTA to="/terminal" onClick={() => signIn({ id: 'demo', name: '김우성', memberId: 'FY-MMXXVI-1247' })}>제출 · SUBMIT</PrimaryCTA>
                </div>
              </div>
            )}
          </div>
        </FormCard>

        {/* Compliance footer strip */}
        <div style={{ maxWidth: 560, margin: '22px auto 0', padding: '14px 16px', background: T.deep, border: `1px dashed ${T.border}`, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>MAS PSPM 2019</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>KOREAN PIPA</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: '0.18em' }}>ENCRYPTED · AES-256</span>
        </div>
      </div>

      <QuietFooter />
    </>
  );
}
