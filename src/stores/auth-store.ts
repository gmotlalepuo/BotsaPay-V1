import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

type AuthState = {
  initialized: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  initialized: false,
  loading: false,
  session: null,
  user: null,
  setInitialized: (initialized) => set({ initialized }),
  setLoading: (loading) => set({ loading }),
  setSession: (session) => set({ session, user: session?.user ?? null }),
}));
