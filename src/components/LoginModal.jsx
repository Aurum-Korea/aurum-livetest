import { useState } from 'react';
import { T, API } from '../lib/index.jsx';

export default function LoginModal({ show, onClose, onLogin, lang }) {
  const [email, setEmail]     = useState('');
  const [pw, setPw]           = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const ko = lang === 'ko';

  if (!show) return null;

  const handleLogin = async e => {
    e.preventDefault();
    if (!email) { setError(ko ? '이메일을 입력하세요' : 'Enter email'); return; }
    setLoading(true); setError('');
    try {
      const user = await API.auth.login(email);
      onLogin(user);
    } catch { setError(ko ? '로그인 실패. 다시 시도하세요.' : 'Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const inp = {
    width:'100%', background:T.bg1, border:`1px solid ${T.border}`, borderRadius:0,
    color:T.text, padding:'12px 16px', fontSize:14, outline:'none',
    fontFamily:T.sans, marginBottom:12,
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:T.bg1, border:`1px solid ${T.goldBorder}`, padding:40, width:'100%', maxWidth:440, position:'relative' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:T.textMuted, fontSize:20, cursor:'pointer' }}>✕</button>

        <div style={{ fontFamily:T.mono, fontSize:10, letterSpacing:'0.28em', color:T.gold, textTransform:'uppercase', marginBottom:20 }}>
          {ko ? '로그인 / 회원가입' : 'Login / Sign Up'}
        </div>
        <h2 style={{ fontFamily:T.serif, fontSize:28, fontWeight:300, color:T.text, marginBottom:8 }}>
          {ko ? '환영합니다' : 'Welcome'}
        </h2>
        <p style={{ fontFamily:T.sans, fontSize:13, color:T.textSub, marginBottom:28, lineHeight:1.7 }}>
          {ko ? '이메일로 간편 로그인. 처음이시면 자동으로 계정이 생성됩니다.' : 'Login with email. New users are auto-registered.'}
        </p>

        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={ko ? '이메일 주소' : 'Email address'} style={inp} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={ko ? '비밀번호 (데모: 아무거나)' : 'Password (demo: anything)'} style={inp} />
          {error && <p style={{ color:T.red, fontSize:12, fontFamily:T.sans, marginBottom:12 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width:'100%', background: loading ? T.border : T.gold, border:'none', color: loading ? T.textMuted : '#0a0a0a',
            padding:'14px', fontSize:14, fontWeight:700, fontFamily:T.sans, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? (ko ? '처리 중...' : 'Processing...') : (ko ? '로그인' : 'Log In')}
          </button>
        </form>

        <p style={{ marginTop:20, fontSize:11, color:T.textMuted, fontFamily:T.sans, lineHeight:1.6, textAlign:'center' }}>
          {ko ? '이 페이지는 데모입니다. 실제 계정 데이터가 저장되지 않습니다.' : 'This is a demo. No real account data is stored.'}
        </p>
      </div>
    </div>
  );
}
