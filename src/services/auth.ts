import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { isSupabaseConfigured } from '@/utils/env';
import { ConfigurationError } from '@/utils/errors';

let authSubscription: { unsubscribe: () => void } | null = null;

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new ConfigurationError(
      'Supabase is not configured yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

export async function initializeAuth() {
  if (!isSupabaseConfigured) {
    useAuthStore.getState().setInitialized(true);
    return;
  }

  const { data } = await supabase.auth.getSession();
  useAuthStore.getState().setSession(data.session);
  useAuthStore.getState().setInitialized(true);

  authSubscription?.unsubscribe();
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });
  authSubscription = listener.subscription;
}

export async function signIn(email: string, password: string) {
  assertSupabaseConfigured();
  useAuthStore.getState().setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    useAuthStore.getState().setSession(data.session);
    return data;
  } finally {
    useAuthStore.getState().setLoading(false);
  }
}

export async function signUp(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}) {
  assertSupabaseConfigured();
  useAuthStore.getState().setLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          phone_number: input.phoneNumber,
        },
      },
    });
    if (error) {
      throw error;
    }
    useAuthStore.getState().setSession(data.session);
    return data;
  } finally {
    useAuthStore.getState().setLoading(false);
  }
}

export async function resetPassword(email: string) {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw error;
  }
}

export async function signOut() {
  assertSupabaseConfigured();
  await supabase.auth.signOut();
  authSubscription?.unsubscribe();
  authSubscription = null;
  useAuthStore.getState().setSession(null);
}
