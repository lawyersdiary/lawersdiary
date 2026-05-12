export type UserRole = 'admin' | 'moderator' | 'teacher' | 'student' | 'user';
export type RoomType = 'public' | 'private' | 'password';
export type MessageType = 'text' | 'image' | 'system' | 'emoji';
export type DuelType = 'blitz' | 'ranked' | 'classic' | 'hardcore';
export type DuelStatus = 'waiting' | 'active' | 'completed' | 'cancelled';
export type RoomVisibility = 'public' | 'private' | 'password';
export type TestMode = 'classic' | 'answer_input';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'answer_key';
export type NotificationType = 'duel_invite' | 'room_invite' | 'mention' | 'test_published' | 'rank_change' | 'achievement' | 'system';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type AchievementCategory = 'streak' | 'accuracy' | 'speed' | 'social' | 'duel' | 'special';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  elo_rating: number;
  wins: number;
  losses: number;
  draws: number;
  current_streak: number;
  best_streak: number;
  total_answers: number;
  correct_answers: number;
  tests_completed: number;
  quizzes_created: number;
  is_online: boolean;
  last_seen: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: RoomVisibility;
  password?: string;
  owner_id: string;
  category?: string;
  tags: string[];
  max_users: number;
  is_active: boolean;
  has_quiz: boolean;
  current_quiz_id?: string;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  online_count?: number;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  type: MessageType;
  reply_to?: string;
  mentions?: string[];
  reactions: Record<string, string[]>;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  cover_image?: string;
  is_public: boolean;
  is_published: boolean;
  time_per_question: number;
  mode: 'quiz' | 'test';
  owner_id: string;
  plays_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  questions?: Question[];
}

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  type: QuestionType;
  image_url?: string;
  audio_url?: string;
  video_url?: string;
  options?: string[];
  correct_answer: string;
  correct_answers?: string[];
  points: number;
  order_index: number;
  explanation?: string;
  time_limit?: number;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  submission_id: string;
  user_id: string;
  answer: string;
  is_correct: boolean;
  time_spent_ms: number;
  points_earned: number;
  created_at: string;
}

export interface Submission {
  id: string;
  quiz_id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'timeout';
  score: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  time_spent_ms: number;
  started_at: string;
  completed_at?: string;
  answers?: Answer[];
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  mode: TestMode;
  answer_key?: Record<string, string>;
  is_published: boolean;
  is_public: boolean;
  time_limit?: number;
  owner_id: string;
  assigned_to?: string[];
  group_id?: string;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  questions?: Question[];
}

export interface Duel {
  id: string;
  type: DuelType;
  status: DuelStatus;
  player1_id: string;
  player2_id: string;
  quiz_id: string;
  winner_id?: string;
  player1_score: number;
  player2_score: number;
  current_question: number;
  spectators: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
  player1?: Profile;
  player2?: Profile;
  quiz?: Quiz;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'user' | 'message' | 'room' | 'quiz';
  target_id: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  elo_rating: number;
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  total_answers: number;
  correct_answers: number;
  accuracy: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface TypingIndicator {
  user_id: string;
  username: string;
  room_id: string;
}
