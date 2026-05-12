import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Edit, Camera, Save, Award, BarChart3 } from 'lucide-react';
import { Card, Button, Input, Avatar, Badge, ProgressBar } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { ROLES, RANKS } from '@/lib/config';

const Profile: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Профиль не найден. Войдите в аккаунт.</p>
      </div>
    );
  }

  const currentRank = [...RANKS].reverse().find((r) => profile.elo_rating >= r.minElo) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];
  const winrate = profile.wins + profile.losses > 0 ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) : 0;
  const accuracy = profile.total_answers > 0 ? Math.round((profile.correct_answers / profile.total_answers) * 100) : 0;
  const handleSave = async () => {
    await updateProfile({ display_name: displayName, bio });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-violet-600/10 to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group">
            <Avatar name={profile.username} src={profile.avatar_url} size="xl" online={profile.is_online} />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
              <Badge variant="info" className="text-xs">
                {ROLES[profile.role]?.label}
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mb-2">@{profile.username}</p>
            {profile.bio && <p className="text-slate-300 text-sm">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">{currentRank.icon} {currentRank.name}</span>
              <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-400" /> {profile.elo_rating} ELO</span>
            </div>
          </div>
          <Button
            variant={editing ? 'primary' : 'secondary'}
            icon={editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            onClick={editing ? handleSave : () => setEditing(true)}
          >
            {editing ? 'Сохранить' : 'Редактировать'}
          </Button>
        </div>
      </Card>

      {editing && (
        <Card>
          <h3 className="font-semibold mb-4">Редактирование профиля</h3>
          <div className="space-y-4">
            <Input label="Отображаемое имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Trophy className="w-5 h-5" />, label: 'ELO рейтинг', value: profile.elo_rating, color: 'text-amber-400', bg: 'from-amber-500/20' },
          { icon: <Target className="w-5 h-5" />, label: 'Точность', value: `${accuracy}%`, color: 'text-emerald-400', bg: 'from-emerald-500/20' },
          { icon: <Flame className="w-5 h-5" />, label: 'Серия побед', value: profile.current_streak, color: 'text-red-400', bg: 'from-red-500/20' },
          { icon: <BarChart3 className="w-5 h-5" />, label: 'Тестов пройдено', value: profile.tests_completed, color: 'text-blue-400', bg: 'from-blue-500/20' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} to-transparent opacity-50`} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Боевая статистика
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
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xl font-bold text-slate-400">{profile.draws}</p>
              <p className="text-xs text-slate-500">Ничьих</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Винрейт</span>
                <span className="text-emerald-400">{winrate}%</span>
              </div>
              <ProgressBar value={winrate} max={100} color="bg-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Лучшая серия</span>
                <span className="text-amber-400">{profile.best_streak}</span>
              </div>
              <ProgressBar value={profile.best_streak} max={Math.max(profile.best_streak, 10)} color="bg-amber-500" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            Ранг и прогресс
          </h3>
          <div className="text-center mb-4">
            <span className="text-5xl">{currentRank.icon}</span>
            <p className="text-lg font-semibold mt-2" style={{ color: currentRank.color }}>{currentRank.name}</p>
            <p className="text-sm text-slate-400">{profile.elo_rating} ELO</p>
          </div>
          {nextRank ? (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">До {nextRank.name}</span>
                <span className="text-slate-400">{nextRank.minElo} ELO</span>
              </div>
              <ProgressBar value={profile.elo_rating - currentRank.minElo} max={nextRank.minElo - currentRank.minElo} />
            </div>
          ) : (
            <p className="text-center text-sm text-amber-400">Максимальный ранг достигнут!</p>
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{profile.total_answers}</p>
              <p className="text-xs text-slate-500">Всего ответов</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white">{profile.correct_answers}</p>
              <p className="text-xs text-slate-500">Правильных</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
