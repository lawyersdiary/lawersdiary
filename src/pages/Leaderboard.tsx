import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';
import { RANKS } from '@/lib/config';

const Leaderboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Рейтинг</h1>
        <p className="text-slate-400 text-sm">Глобальная таблица лидеров по ELO-рейтингу</p>
      </div>

      {/* Rank tiers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {RANKS.map((rank, i) => (
          <motion.div key={rank.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card padding="sm" className="text-center">
              <span className="text-2xl">{rank.icon}</span>
              <p className="text-xs font-semibold mt-1" style={{ color: rank.color }}>{rank.name}</p>
              <p className="text-[10px] text-slate-500">{rank.minElo}+</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Podium placeholder */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-transparent to-amber-600/10" />
        <div className="relative py-8">
          <div className="flex items-end justify-center gap-4 mb-6">
            {/* 2nd place */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2 border-2 border-gray-400/50">
                ?
              </div>
              <div className="bg-gray-500/20 rounded-t-xl px-6 py-8">
                <Medal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">2-е место</p>
              </div>
            </div>
            {/* 1st place */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 border-2 border-amber-400/50 shadow-lg shadow-amber-500/25">
                ?
              </div>
              <div className="bg-amber-500/20 rounded-t-xl px-8 py-12">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">1-е место</p>
              </div>
            </div>
            {/* 3rd place */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2 border-2 border-amber-700/50">
                ?
              </div>
              <div className="bg-amber-800/20 rounded-t-xl px-6 py-6">
                <Medal className="w-6 h-6 text-amber-700 mx-auto mb-1" />
                <p className="text-xs text-slate-400">3-е место</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Игрок</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">ELO</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Винрейт</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Точность</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Ранг</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder - data loads from Supabase */}
            </tbody>
          </table>
        </div>
        <EmptyState
          icon={<Trophy className="w-12 h-12" />}
          title="Таблица лидеров пуста"
          description="Подключите Supabase для загрузки данных рейтинга"
        />
      </Card>
    </div>
  );
};

export default Leaderboard;
