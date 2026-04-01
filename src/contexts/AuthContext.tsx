import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// ── Design tokens ──────────────────────────────────────────────────────
export interface ThemeTokens {
  bg: string;            // page background
  cardBg: string;        // glass card fill
  cardBorder: string;    // card hairline border
  cardShadow: string;    // card elevation shadow
  text: string;          // primary text
  subText: string;       // secondary/muted text
  divider: string;       // horizontal rule
  navBorder: string;     // nav / header borders
  navActive: string;     // active tab indicator & accent
  inactiveBtnBg: string; // ghost / inactive button fill
  avatarBorder: string;  // facepile cutout colour (matches card bg)
}

const buildTheme = (isDark: boolean): ThemeTokens => ({
  bg:            isDark ? '#0A0C12'                       : '#F8FAFC',
  cardBg:        isDark ? 'rgba(30, 41, 59, 0.45)'        : 'rgba(255, 255, 255, 0.8)',
  cardBorder:    isDark ? 'rgba(255,255,255,0.08)'         : 'rgba(15, 23, 42, 0.08)',
  cardShadow:    isDark
    ? 'inset 0 1px 0 rgba(255,255,255,0.12), inset 1px 0 0 rgba(255,255,255,0.08)'
    : '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)',
  text:          isDark ? '#EDE8DF'                       : '#0F172A',
  subText:       isDark ? '#8896A9'                       : '#64748B',
  divider:       isDark ? 'rgba(255,255,255,0.06)'         : 'rgba(15, 23, 42, 0.06)',
  navBorder:     isDark ? 'rgba(255,255,255,0.06)'         : 'rgba(15, 23, 42, 0.08)',
  navActive:     isDark ? '#E2D1B3'                       : '#B89660',
  inactiveBtnBg: isDark ? 'rgba(30, 41, 59, 0.5)'         : 'rgba(15, 23, 42, 0.05)',
  avatarBorder:  isDark ? '#E2D1B3'                       : '#B89660',
});

// ── Context ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: ThemeTokens;
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true,
  signOut: async () => {}, refreshProfile: async () => {},
  isDarkMode: true, toggleTheme: () => {},
  theme: buildTheme(true),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    setProfile(data);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const theme = buildTheme(isDarkMode);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, isDarkMode, toggleTheme, theme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
