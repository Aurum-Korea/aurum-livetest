// ═══════════════════════════════════════════════════════════════════════
// AURUM · AUTH CONTEXT (mock)
// 
// localStorage-backed. Used to gate /terminal, conditionally route /kyc.
// Real backend auth will replace this; the shape stays the same.
// ═══════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  signIn: () => {},
  signOut: () => {},
  isAuthed: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('aurum_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem('aurum_user', JSON.stringify(user));
    else localStorage.removeItem('aurum_user');
  }, [user]);

  const signIn = (userData) => setUser(userData || { id: 'demo', name: '김우성', memberId: 'FY-MMXXVI-1247' });
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
