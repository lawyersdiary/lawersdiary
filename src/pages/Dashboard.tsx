import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, Swords, BookOpen, MessageSquare, TrendingUp,
  Plus, ChevronRight, Zap, Target, Award, Flame
} from 'lucide-react';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { RANKS, APP_NAME } from '@/lib/config';

const Dashboard: React.FC = () => {
  const { profile, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Загрузка профиля...</p>
          <p className="text-sm text-slate-500">Убедитесь, что Supabase настроен корректно</p>
        </div>
      </div>
    );
  }

  const currentRank = [...RANKS].reverse().find((r) => profile.elo_rating >= r.minElo) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  const winrate = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0;
  const accuracy = profile.total_answers > 0
    ? Math.round((profile.correct_answers / profile.total_answers) * 100)
    : 0;

  const stats = [
    { icon: <Trophy className="w-5 h-5" />, label: 'Рейтинг', value: profile.elo_rating, color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20' },
    { icon: <Target className="w-5 h-5" />, label: 'Точность', value: `${accuracy}%`, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-green-500/20' },
    { icon: <Flame className="w-5 h-5" />, label: 'Серия побед', value: profile.current_streak, color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Тестов пройдено', value: profile.tests_completed, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
  ];

  const quickActions = [
    { icon: <Swords className="w-5 h-5" />, label: 'Начать дуэль', desc: 'Сразиться с игроком', to: '/duels', color: 'from-red-500 to-orange-500' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Комнаты', desc: 'Найти комнату', to: '/rooms', color: 'from-green-500 to-emerald-500' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Пройти тест', desc: 'Доступные тесты', to: '/tests', color: 'from-blue-500 to-cyan-500' },
    { icon: <Plus className="w-5 h-5" />, label: 'Создать квиз', desc: 'Новый квиз', to: '/quizzes/create', color: 'from-violet-500 to-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-violet-600/10 to-transparent" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Добро пожаловать, {profile.display_name || profile.username}! 👋
              </h1>
              <p className="text-slate-400">
                {currentRank.icon} {currentRank.name} · {profile.elo_rating} ELO · {APP_NAME}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">
                <TrendingUp className="w-3 h-3 mr-1" />
                Ранг: {currentRank.name}
              </Badge>
              {profile.current_streak > 0 && (
                <Badge variant="warning">
                  <Flame className="w-3 h-3 mr-1" />
                  {profile.current_streak} подряд
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-sm text-slate-400">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rank Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Прогресс ранга
            </h3>
            <div className="text-center mb-4">
              <span className="text-4xl">{currentRank.icon}</span>
              <p className="text-lg font-semibold mt-2" style={{ color: currentRank.color }}>{currentRank.name}</p>
              <p className="text-sm text-slate-400">{profile.elo_rating} ELO</p>
            </div>
            {nextRank && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">До {nextRank.name}</span>
                  <span className="text-slate-400">{nextRank.minElo} ELO</span>
                </div>
                <ProgressBar value={profile.elo_rating - currentRank.minElo} max={nextRank.minElo - currentRank.minElo} />
              </div>
            )}
          </Card>
        </motion.div>

        {/* Win/Loss stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Статистика
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-emerald-500/10 rounded-xl p-3">
                <p className="text-xl font-bold text-emerald-400">{profile.wins}</p>
                <p className="text-xs text-slate-500">Побед</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3">
                <p className="text-xl font-bold text-red-400">{profile.losses}</p>
                <p className="text-xs text-slate-500">Поражений</p>
              </div>
              <div className="bg-slate-500/10 rounded-xl p-3">
                <p className="text-xl font-bold text-slate-400">{profile.draws}</p>
                <p className="text-xs text-slate-500">Ничьих</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Винрейт</span>
                <span className="text-emerald-400 font-medium">{winrate}%</span>
              </div>
              <ProgressBar value={winrate} max={100} color="bg-emerald-500" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-slate-400">Лучшая серия</span>
                <span className="text-amber-400 font-medium">{profile.best_streak}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Быстрые действия
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
