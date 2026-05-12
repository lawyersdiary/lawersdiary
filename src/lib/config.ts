export const APP_NAME = 'СПРАВОЧНИК ПО ПРАВО';
export const APP_DESCRIPTION = 'Интеллектуальная платформа для тестирования, квизов и дуэлей';

export const ROLES = {
  admin: { label: 'Администратор', color: '#ef4444', level: 5 },
  moderator: { label: 'Модератор', color: '#f59e0b', level: 4 },
  teacher: { label: 'Преподаватель', color: '#3b82f6', level: 3 },
  student: { label: 'Ученик', color: '#10b981', level: 2 },
  user: { label: 'Пользователь', color: '#8b5cf6', level: 1 },
} as const;

export const DUEL_TYPES = {
  blitz: { label: 'Блиц', timePerQuestion: 10, questionCount: 10, color: '#ef4444' },
  ranked: { label: 'Рейтинговый', timePerQuestion: 30, questionCount: 15, color: '#f59e0b' },
  classic: { label: 'Классический', timePerQuestion: 60, questionCount: 20, color: '#3b82f6' },
  hardcore: { label: 'Хардкор', timePerQuestion: 5, questionCount: 25, color: '#8b5cf6' },
} as const;

export const RANKS = [
  { name: 'Новичок', minElo: 0, icon: '🌱', color: '#94a3b8' },
  { name: 'Ученик', minElo: 800, icon: '📚', color: '#10b981' },
  { name: 'Знаток', minElo: 1000, icon: '💡', color: '#3b82f6' },
  { name: 'Эксперт', minElo: 1200, icon: '⭐', color: '#8b5cf6' },
  { name: 'Мастер', minElo: 1500, icon: '🏆', color: '#f59e0b' },
  { name: 'Грандмастер', minElo: 1800, icon: '👑', color: '#ef4444' },
  { name: 'Легенда', minElo: 2200, icon: '💎', color: '#ec4899' },
] as const;

export const CATEGORIES = [
  'Правоведение',
  'Гражданское право',
  'Уголовное право',
  'Конституционное право',
  'Административное право',
  'Трудовое право',
  'Семейное право',
  'Международное право',
  'Общая теория права',
  'История государства и права',
  'Логика',
  'Другое',
] as const;

export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  quiz_images: 'quiz-images',
  media: 'media',
  documents: 'documents',
} as const;

export const REALTIME_CHANNELS = {
  room: (roomId: string) => `room:${roomId}`,
  duel: (duelId: string) => `duel:${duelId}`,
  leaderboard: 'leaderboard',
  notifications: (userId: string) => `notifications:${userId}`,
  presence: 'global-presence',
} as const;
