import { create } from 'zustand';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  supabaseReady: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  fetchProfile: (userId: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasMinRole: (role: UserRole) => boolean;
  initialize: () => Promise<void>;
}

const ROLE_LEVELS: Record<UserRole, number> = {
  admin: 5,
  moderator: 4,
  teacher: 3,
  student: 2,
  user: 1,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,
  supabaseReady: false,

  initialize: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ loading: false, initialized: true, supabaseReady: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          set({ user: session.user, session, profile, loading: false, initialized: true, supabaseReady: true });
        } catch {
          set({ user: session.user, session, profile: null, loading: false, initialized: true, supabaseReady: true });
        }
      } else {
        set({ user: null, session: null, profile: null, loading: false, initialized: true, supabaseReady: true });
      }
    } catch {
      set({ user: null, session: null, profile: null, loading: false, initialized: true, supabaseReady: false });
    }

    try {
      if (supabase) {
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              set({ user: session.user, session, profile });
            } catch {
              set({ user: session.user, session });
            }
          } else {
            set({ user: null, session: null, profile: null });
          }
        });
      }
    } catch {
      // auth state change listener failed
    }
  },

  signUp: async (email, password, username) => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase не настроен' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
  const profileData = {
    user_id: data.user.id,
    username,
    display_name: username,
    role: 'user',
    elo_rating: 1000,
    wins: 0,
    losses: 0,
    draws: 0,
    total_answers: 0,
    correct_answers: 0,
    current_streak: 0,
    best_streak: 0,
    tests_completed: 0,
    is_online: true,
  };

  await supabase.from('profiles').upsert(profileData);

  set({
    user: data.user,
    session: data.session,
    profile: profileData as any,
  });
}

    return { error: null };

  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : 'Ошибка регистрации',
    };
  }
},

  signIn: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен. Подключите базу данных.' };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка входа' };
    }
  },

  signOut: async () => {
    const { profile } = get();
    if (supabase && profile) {
      try {
        await supabase
          .from('profiles')
          .update({ is_online: false, last_seen: new Date().toISOString() })
          .eq('id', profile.id);
      } catch { /* ignore */ }
    }
    if (supabase) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    set({ user: null, session: null, profile: null });
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return { error: 'Не авторизован' };
    if (!supabase) return { error: 'Supabase не настроен' };
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      if (error) return { error: error.message };
      set({ profile: { ...profile, ...updates } });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка обновления' };
    }
  },

  fetchProfile: async (userId) => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle()
      if (data) set({ profile: data });
    } catch { /* ignore */ }
  },

  hasRole: (role) => get().profile?.role === role,

  hasMinRole: (role) => {
    const { profile } = get();
    if (!profile) return false;
    return ROLE_LEVELS[profile.role] >= ROLE_LEVELS[role];
  },
}));
