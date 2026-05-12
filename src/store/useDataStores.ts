import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Room, Message, Quiz, Duel, Notification, Profile, LeaderboardEntry, Test } from '@/types';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  onlineUsers: Profile[];
  typingUsers: Array<{ user_id: string; username: string }>;
  deleteRoom: (roomId: string) => Promise<any>;
  fetchRooms: () => Promise<void>;
  createRoom: (room: Partial<Room>) => Promise<{ error: string | null; room?: Room }>;
  joinRoom: (roomId: string, password?: string) => Promise<{ error: string | null }>;
  leaveRoom: (roomId: string) => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  fetchMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string, type?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  setTyping: (roomId: string, isTyping: boolean) => void;
  subscribeToRoom: (roomId: string) => () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  

  fetchRooms: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('rooms')
        .select('*, room_members(count)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) {
  const roomsWithCount = data.map((room: any) => ({
    ...room,
    online_count: room.room_members?.[0]?.count || 0,
  }));

  set({ rooms: roomsWithCount });
}
    } catch { /* ignore */ }
  },

  createRoom: async (roomData) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Не авторизован' };
      const { data, error } = await supabase
        .from('rooms')
        .insert({ ...roomData, owner_id: user.id })
        .select('*')
        .single();
      if (error) return { error: error.message };
      set((s) => ({ rooms: [data, ...s.rooms] }));
      return { error: null, room: data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка создания' };
    }
  },

  joinRoom: async (roomId, password) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Не авторизован' };
      const room = get().rooms.find((r) => r.id === roomId);
      if (room?.type === 'password' && room.password !== password) {
        return { error: 'Неверный пароль' };
      }
      const { error } = await supabase
  .from('room_members')
  .upsert({
    room_id: roomId,
    user_id: user.id,
    role: 'member',
  });
      if (error && !error.message.includes('duplicate key')) {
  return { error: error.message };
}
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка' };
    }
  },

  deleteRoom: async (roomId: string) => {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      return { error: error.message };
    }

    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== roomId),
    }));

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
},

  leaveRoom: async (roomId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('room_members').delete().eq('room_id', roomId).eq('user_id', user.id);
    } catch { /* ignore */ }
  },

  setCurrentRoom: (room) => set({ currentRoom: room, messages: [] }),

  fetchMessages: async (roomId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
  *,
  profile:profiles(username)
`)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) set({ messages: data });
    } catch { /* ignore */ }
  },

  sendMessage: async (roomId, content, type = 'text') => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      content,
      type,
    });

    if (error) {
      console.error(error);
      alert(error.message);
    }
  } catch (err) {
    console.error(err);
  }
},

  deleteMessage: async (messageId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('messages').update({ is_deleted: true }).eq('id', messageId);
    } catch { /* ignore */ }
  },

  setTyping: () => { /* broadcast via realtime */ },

  subscribeToRoom: (roomId) => {
    if (!isSupabaseConfigured || !supabase) return () => {};
    try {
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'messages',
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          const newMessage = payload.new as Message;
          set((s) => ({ messages: [...s.messages, newMessage] }));
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch {
      return () => {};
    }
  },
}));

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  submissions: Array<{ id: string; quiz_id: string; user_id: string; status: string; score: number; max_score: number; correct_count: number; total_questions: number; time_spent_ms: number; started_at: string; completed_at?: string }>;
  tests: Test[];
  currentTest: Test | null;
  fetchQuizzes: () => Promise<void>;
  fetchQuiz: (id: string) => Promise<void>;
  createQuiz: (quiz: Partial<Quiz>) => Promise<{ error: string | null; quiz?: Quiz }>;
  fetchTests: () => Promise<void>;
  fetchTest: (id: string) => Promise<void>;
  createTest: (test: Partial<Test>) => Promise<{ error: string | null; test?: Test }>;
  submitTestAnswers: (testId: string, answers: Record<string, string>) => Promise<{ score: number; results: Record<string, boolean> } | null>;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setCurrentTest: (test: Test | null) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  currentQuiz: null,
  submissions: [],
  tests: [],
  currentTest: null,

  fetchQuizzes: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (data) set({ quizzes: data });
    } catch { /* ignore */ }
  },

  fetchQuiz: async (id) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('quizzes')
        .select('*, owner:profiles(*), questions(*)')
        .eq('id', id).single();
      if (data) set({ currentQuiz: data });
    } catch { /* ignore */ }
  },

  createQuiz: async (quizData) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Не авторизован' };
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ ...quizData, owner_id: user.id })
        .select('*').single();
      if (error) return { error: error.message };
      set((s) => ({ quizzes: [data, ...s.quizzes] }));
      return { error: null, quiz: data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка' };
    }
  },

  fetchTests: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('tests')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (data) set({ tests: data });
    } catch { /* ignore */ }
  },

  fetchTest: async (id) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('tests')
        .select('*, owner:profiles(*), questions(*)')
        .eq('id', id).single();
      if (data) set({ currentTest: data });
    } catch { /* ignore */ }
  },

  createTest: async (testData) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Не авторизован' };
      const { data, error } = await supabase
        .from('tests')
        .insert({ ...testData, owner_id: user.id })
        .select('*').single();
      if (error) return { error: error.message };
      set((s) => ({ tests: [data, ...s.tests] }));
      return { error: null, test: data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка' };
    }
  },

  submitTestAnswers: async (testId, answers) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.rpc('check_test_answers', {
        p_test_id: testId, p_user_id: user.id, p_answers: answers,
      });
      return data;
    } catch { return null; }
  },

  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setCurrentTest: (test) => set({ currentTest: test }),
}));

interface DuelState {
  duels: Duel[];
  currentDuel: Duel | null;
  activeDuels: Duel[];
  fetchDuels: () => Promise<void>;
  createDuel: (opponentId: string, quizId: string, type: string) => Promise<{ error: string | null; duel?: Duel }>;
  acceptDuel: (duelId: string) => Promise<{ error: string | null }>;
  submitDuelAnswer: (duelId: string, questionIndex: number, answer: string) => Promise<void>;
  subscribeToDuel: (duelId: string) => () => void;
  setCurrentDuel: (duel: Duel | null) => void;
}

export const useDuelStore = create<DuelState>((set) => ({
  duels: [],
  currentDuel: null,
  activeDuels: [],

  fetchDuels: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('duels')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) set({ duels: data });
    } catch { /* ignore */ }
  },

  createDuel: async (opponentId, quizId, type) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен' };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: 'Не авторизован' };
      const { data, error } = await supabase.from('duels').insert({
        player1_id: user.id, player2_id: opponentId, quiz_id: quizId, type,
        status: 'waiting', player1_score: 0, player2_score: 0, current_question: 0, spectators: [],
      }).select('*').single();
      if (error) return { error: error.message };
      set((s) => ({ duels: [data, ...s.duels] }));
      return { error: null, duel: data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка' };
    }
  },

  acceptDuel: async (duelId) => {
    if (!isSupabaseConfigured || !supabase) return { error: 'Supabase не настроен' };
    try {
      const { error } = await supabase
        .from('duels')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', duelId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Ошибка' };
    }
  },

  submitDuelAnswer: async (duelId) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.rpc('submit_duel_answer', { p_duel_id: duelId });
    } catch { /* ignore */ }
  },

  subscribeToDuel: (duelId) => {
    if (!isSupabaseConfigured || !supabase) return () => {};
    try {
      const channel = supabase
        .channel(`duel:${duelId}`)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'duels',
          filter: `id=eq.${duelId}`,
        }, (payload) => {
          set({ currentDuel: payload.new as Duel });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch {
      return () => {};
    }
  },

  setCurrentDuel: (duel) => set({ currentDuel: duel }),
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) {
        set({
          notifications: data,
          unreadCount: data.filter((n) => !n.is_read).length,
        });
      }
    } catch { /* ignore */ }
  },

  markAsRead: async (id) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      set((s) => ({
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unreadCount: Math.max(0, s.unreadCount - 1),
      }));
    } catch { /* ignore */ }
  },

  markAllAsRead: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch { /* ignore */ }
  },

  subscribeToNotifications: (userId) => {
    if (!isSupabaseConfigured || !supabase) return () => {};
    try {
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          const notification = payload.new as Notification;
          set((s) => ({
            notifications: [notification, ...s.notifications],
            unreadCount: s.unreadCount + 1,
          }));
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch {
      return () => {};
    }
  },
}));

interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  leaderboard: [],

  fetchLeaderboard: async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url, elo_rating, wins, losses, draws, total_answers, correct_answers')
        .order('elo_rating', { ascending: false })
        .limit(100);
      if (data) {
        const entries: LeaderboardEntry[] = data.map((p, i) => ({
          rank: i + 1, user_id: p.user_id, username: p.username, avatar_url: p.avatar_url,
          elo_rating: p.elo_rating, wins: p.wins, losses: p.losses, draws: p.draws,
          winrate: p.wins + p.losses > 0 ? Math.round((p.wins / (p.wins + p.losses)) * 100) : 0,
          total_answers: p.total_answers, correct_answers: p.correct_answers,
          accuracy: p.total_answers > 0 ? Math.round((p.correct_answers / p.total_answers) * 100) : 0,
        }));
        set({ leaderboard: entries });
      }
    } catch { /* ignore */ }
  },
}));
