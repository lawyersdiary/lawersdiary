-- ====================================
-- СПРАВОЧНИК ПО ПРАВО
-- Database Schema Migration
-- Version: 1.0.0
-- ====================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================
-- PROFILES (extends Supabase auth.users)
-- ====================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'teacher', 'student', 'user')),
  elo_rating INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  tests_completed INTEGER NOT NULL DEFAULT 0,
  quizzes_created INTEGER NOT NULL DEFAULT 0,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'online',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_elo ON profiles(elo_rating DESC);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================
-- GROUPS
-- ====================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- ====================================
-- ROOMS
-- ====================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'password')),
  password TEXT,
  owner_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  max_users INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  has_quiz BOOLEAN NOT NULL DEFAULT false,
  current_quiz_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_owner ON rooms(owner_id);
CREATE INDEX idx_rooms_active ON rooms(is_active);
CREATE INDEX idx_rooms_type ON rooms(type);

CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- ====================================
-- MESSAGES
-- ====================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'system', 'emoji')),
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  mentions UUID[] DEFAULT '{}',
  reactions JSONB DEFAULT '{}',
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_room ON messages(room_id, created_at);
CREATE INDEX idx_messages_user ON messages(user_id);

-- ====================================
-- QUIZZES
-- ====================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  time_per_question INTEGER NOT NULL DEFAULT 30,
  mode TEXT NOT NULL DEFAULT 'quiz' CHECK (mode IN ('quiz', 'test')),
  owner_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  plays_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_owner ON quizzes(owner_id);
CREATE INDEX idx_quizzes_published ON quizzes(is_published);

-- ====================================
-- QUESTIONS
-- ====================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single_choice' CHECK (type IN ('single_choice', 'multiple_choice', 'text_input', 'answer_key')),
  image_url TEXT,
  audio_url TEXT,
  video_url TEXT,
  options JSONB DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  correct_answers TEXT[] DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  time_limit INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_quiz ON questions(quiz_id, order_index);

-- ====================================
-- TESTS
-- ====================================
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL DEFAULT 'classic' CHECK (mode IN ('classic', 'answer_input')),
  answer_key JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  time_limit INTEGER,
  owner_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID[] DEFAULT '{}',
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tests_owner ON tests(owner_id);

-- ====================================
-- SUBMISSIONS
-- ====================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timeout')),
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_spent_ms INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(quiz_id, user_id)
);

CREATE INDEX idx_submissions_user ON submissions(user_id);

-- ====================================
-- ANSWERS
-- ====================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_spent_ms INTEGER NOT NULL DEFAULT 0,
  points_earned NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================
-- DUELS
-- ====================================
CREATE TABLE duels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'classic' CHECK (type IN ('blitz', 'ranked', 'classic', 'hardcore')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  player1_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  player2_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  winner_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  current_question INTEGER NOT NULL DEFAULT 0,
  spectators UUID[] DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_duels_player1 ON duels(player1_id);
CREATE INDEX idx_duels_player2 ON duels(player2_id);
CREATE INDEX idx_duels_status ON duels(status);

-- ====================================
-- NOTIFICATIONS
-- ====================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('duel_invite', 'room_invite', 'mention', 'test_published', 'rank_change', 'achievement', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ====================================
-- ACHIEVEMENTS
-- ====================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('streak', 'accuracy', 'speed', 'social', 'duel', 'special')),
  requirement INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed achievements
INSERT INTO achievements (name, description, icon, category, requirement) VALUES
  ('Первая победа', 'Выиграйте первую дуэль', '🏆', 'duel', 1),
  ('10 побед подряд', 'Выиграйте 10 дуэлей подряд', '🔥', 'streak', 10),
  ('100 правильных ответов', 'Дайте 100 правильных ответов', '✅', 'accuracy', 100),
  ('1000 правильных ответов', 'Дайте 1000 правильных ответов', '⭐', 'accuracy', 1000),
  ('Молниеносный', 'Ответьте за 2 секунды', '⚡', 'speed', 2),
  ('Мастер квизов', 'Создайте 10 квизов', '🎯', 'special', 10),
  ('Лучший игрок недели', 'Станьте лучшим игроком недели', '👑', 'special', 1),
  ('Социальная бабочка', 'Вступите в 10 комнат', '🦋', 'social', 10),
  ('Непобеждённый', '50 побед без поражений', '💎', 'streak', 50),
  ('Мастер дуэлей', 'Выиграйте 100 дуэлей', '⚔️', 'duel', 100);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- ====================================
-- REPORTS
-- ====================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'message', 'room', 'quiz')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================
-- LOGS
-- ====================================
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);

-- ====================================
-- FUNCTIONS
-- ====================================

-- Check test answers (for answer_input mode)
CREATE OR REPLACE FUNCTION check_test_answers(
  p_test_id UUID,
  p_user_id UUID,
  p_answers JSONB
)
RETURNS TABLE(score INTEGER, results JSONB) AS $$
DECLARE
  v_test RECORD;
  v_correct_count INTEGER := 0;
  v_total INTEGER := 0;
  v_result JSONB := '{}';
  v_answer TEXT;
  v_correct TEXT;
BEGIN
  -- Get test with questions
  SELECT * INTO v_test FROM tests WHERE id = p_test_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each answer against answer_key
  FOR v_answer, v_correct IN
    SELECT
      value::TEXT,
      COALESCE(v_test.answer_key->key, '')
    FROM jsonb_each_text(p_answers) AS x(key, value)
  LOOP
    v_total := v_total + 1;
    IF UPPER(v_answer) = UPPER(v_correct) THEN
      v_correct_count := v_correct_count + 1;
      v_result := v_result || jsonb_build_object(
        (SELECT key FROM jsonb_each_text(p_answers) WHERE value = v_answer LIMIT 1), true
      );
    ELSE
      v_result := v_result || jsonb_build_object(
        (SELECT key FROM jsonb_each_text(p_answers) WHERE value = v_answer LIMIT 1), false
      );
    END IF;
  END LOOP;

  -- Update user stats
  UPDATE profiles
  SET
    total_answers = total_answers + v_total,
    correct_answers = correct_answers + v_correct_count,
    tests_completed = tests_completed + 1
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_correct_count, v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update ELO ratings after duel
CREATE OR REPLACE FUNCTION update_elo_ratings(
  p_duel_id UUID
)
RETURNS void AS $$
DECLARE
  v_duel RECORD;
  v_p1_elo INTEGER;
  v_p2_elo INTEGER;
  v_k INTEGER := 32;
  v_expected1 NUMERIC;
  v_expected2 NUMERIC;
  v_p1_change INTEGER;
  v_p2_change INTEGER;
BEGIN
  SELECT * INTO v_duel FROM duels WHERE id = p_duel_id;
  IF NOT FOUND OR v_duel.status != 'completed' THEN
    RETURN;
  END IF;

  SELECT elo_rating INTO v_p1_elo FROM profiles WHERE user_id = v_duel.player1_id;
  SELECT elo_rating INTO v_p2_elo FROM profiles WHERE user_id = v_duel.player2_id;

  v_expected1 := 1.0 / (1.0 + power(10, (v_p2_elo - v_p1_elo) / 400.0));
  v_expected2 := 1.0 / (1.0 + power(10, (v_p1_elo - v_p2_elo) / 400.0));

  IF v_duel.winner_id = v_duel.player1_id THEN
    v_p1_change := ROUND(v_k * (1.0 - v_expected1))::INTEGER;
    v_p2_change := ROUND(v_k * (0.0 - v_expected2))::INTEGER;
  ELSIF v_duel.winner_id = v_duel.player2_id THEN
    v_p1_change := ROUND(v_k * (0.0 - v_expected1))::INTEGER;
    v_p2_change := ROUND(v_k * (1.0 - v_expected2))::INTEGER;
  ELSE
    v_p1_change := ROUND(v_k * (0.5 - v_expected1))::INTEGER;
    v_p2_change := ROUND(v_k * (0.5 - v_expected2))::INTEGER;
  END IF;

  UPDATE profiles SET
    elo_rating = GREATEST(0, elo_rating + v_p1_change),
    wins = wins + CASE WHEN v_duel.winner_id = v_duel.player1_id THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN v_duel.winner_id = v_duel.player2_id THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN v_duel.winner_id IS NULL THEN 1 ELSE 0 END,
    current_streak = CASE
      WHEN v_duel.winner_id = v_duel.player1_id THEN current_streak + 1
      ELSE 0
    END,
    best_streak = GREATEST(best_streak, CASE
      WHEN v_duel.winner_id = v_duel.player1_id THEN current_streak + 1
      ELSE best_streak
    END)
  WHERE user_id = v_duel.player1_id;

  UPDATE profiles SET
    elo_rating = GREATEST(0, elo_rating + v_p2_change),
    wins = wins + CASE WHEN v_duel.winner_id = v_duel.player2_id THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN v_duel.winner_id = v_duel.player1_id THEN 1 ELSE 0 END,
    draws = draws + CASE WHEN v_duel.winner_id IS NULL THEN 1 ELSE 0 END,
    current_streak = CASE
      WHEN v_duel.winner_id = v_duel.player2_id THEN current_streak + 1
      ELSE 0
    END,
    best_streak = GREATEST(best_streak, CASE
      WHEN v_duel.winner_id = v_duel.player2_id THEN current_streak + 1
      ELSE best_streak
    END)
  WHERE user_id = v_duel.player2_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Rooms: anyone can read public, owner can manage
CREATE POLICY "Public rooms are viewable" ON rooms
  FOR SELECT USING (type = 'public' OR owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM room_members WHERE user_id = auth.uid() AND room_id = rooms.id));

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update rooms" ON rooms
  FOR UPDATE USING (owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Owners/admins can delete rooms" ON rooms
  FOR DELETE USING (owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Messages: members can read/send messages in their rooms
CREATE POLICY "Room members can read messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members WHERE user_id = auth.uid() AND room_id = messages.room_id)
  );

CREATE POLICY "Room members can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM room_members WHERE user_id = auth.uid() AND room_id = messages.room_id)
  );

-- Quizzes: published are readable, owners can manage
CREATE POLICY "Published quizzes are viewable" ON quizzes
  FOR SELECT USING (is_published = true OR owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authenticated users can create quizzes" ON quizzes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update quizzes" ON quizzes
  FOR UPDATE USING (owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')));

-- Tests: similar to quizzes
CREATE POLICY "Published tests are viewable" ON tests
  FOR SELECT USING (is_public = true OR owner_id = auth.uid() OR
    auth.uid() = ANY(assigned_to) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator', 'teacher')));

CREATE POLICY "Teachers/admins can create tests" ON tests
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator', 'teacher', 'user'))
  );

-- Duels: players can read their duels
CREATE POLICY "Users can view their duels" ON duels
  FOR SELECT USING (
    player1_id = auth.uid() OR player2_id = auth.uid() OR
    auth.uid() = ANY(spectators) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "Users can create duels" ON duels
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND player1_id = auth.uid());

-- Notifications: users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Reports: users can create, admins can read
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

CREATE POLICY "Admins can view reports" ON reports
  FOR SELECT USING (
    reporter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- ====================================
-- REALTIME
-- ====================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE duels;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ====================================
-- STORAGE BUCKETS (run in Supabase Dashboard)
-- ====================================
-- Create these buckets in Supabase Dashboard > Storage:
-- 1. avatars (public)
-- 2. quiz-images (public)
-- 3. media (authenticated)
-- 4. documents (authenticated)

-- Storage policies (run after creating buckets):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('quiz-images', 'quiz-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
