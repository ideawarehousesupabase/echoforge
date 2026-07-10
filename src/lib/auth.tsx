import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { getDb } from "./firebase";

export type SessionUser = { id: string; name: string; email: string };

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: { name?: string; email?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "echoforge_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: SessionUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    const db = getDb();
    const q = query(collection(db, "users"), where("email", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("No account found for that email.");
    const docSnap = snap.docs[0];
    const data = docSnap.data() as { name: string; email: string; password: string };
    const ok = await bcrypt.compare(password, data.password);
    if (!ok) throw new Error("Incorrect password.");
    persist({ id: docSnap.id, name: data.name, email: data.email });
  };

  const register = async (name: string, email: string, password: string) => {
    const db = getDb();
    const normalized = email.toLowerCase().trim();
    const existing = await getDocs(query(collection(db, "users"), where("email", "==", normalized)));
    if (!existing.empty) throw new Error("An account with that email already exists.");
    const hashed = await bcrypt.hash(password, 10);
    await addDoc(collection(db, "users"), {
      name: name.trim(),
      email: normalized,
      password: hashed,
      createdAt: serverTimestamp(),
    });
  };

  const logout = () => persist(null);

  const updateProfile = async (patch: { name?: string; email?: string }) => {
    if (!user) return;
    const db = getDb();
    const clean: Record<string, string> = {};
    if (patch.name) clean.name = patch.name.trim();
    if (patch.email) clean.email = patch.email.toLowerCase().trim();
    await updateDoc(doc(db, "users", user.id), clean);
    persist({ ...user, ...clean } as SessionUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
