import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

// Sağlayıcı (Provider)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase oturum dinleyicisi (sadece bir defa çalışır)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // bileşen unmount olursa dinleyiciyi kapat
  }, []);

  // Çıkış yap fonksiyonu
  const logout = () => signOut(auth);

  const value = { user, loading, logout };
  return (
    <AuthContext.Provider value={value}>
      {/* loading true ise hiçbir şey göstermeyelim */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Kolay kullanım: useAuth()
export const useAuth = () => useContext(AuthContext);
