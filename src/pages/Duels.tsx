import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Shield, Clock, Trophy, Eye, Plus, Search, Users } from 'lucide-react';
import { Card, Button, Input, EmptyState, Modal, Select } from '@/components/ui';
import { DUEL_TYPES } from '@/lib/config';

const Duels: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'spectate'>('active');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Дуэли</h1>
          <p className="text-slate-400 text-sm">Сражайтесь в реальном времени с другими игроками</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
          Вызвать на дуэль
        </Button>
      </div>

      {/* Duel type cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(DUEL_TYPES).map(([key, duel], i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card hover>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${duel.color}, ${duel.color}88)` }}>
                  {key === 'blitz' ? <Zap className="w-6 h-6" /> :
                   key === 'ranked' ? <Trophy className="w-6 h-6" /> :
                   key === 'classic' ? <Swords className="w-6 h-6" /> :
                   <Shield className="w-6 h-6" />}
                </div>
                <h3 className="font-semibold text-sm">{duel.label}</h3>
                <p className="text-xs text-slate-400 mt-1">{duel.timePerQuestion}с / вопрос</p>
                <p className="text-xs text-slate-500">{duel.questionCount} вопросов</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
        {[
          { id: 'active', label: 'Активные', icon: <Zap className="w-4 h-4" /> },
          { id: 'history', label: 'История', icon: <Clock className="w-4 h-4" /> },
          { id: 'spectate', label: 'Наблюдение', icon: <Eye className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <Input placeholder="Поиск игроков..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

      <EmptyState
        icon={<Swords className="w-16 h-16" />}
        title="Нет активных дуэлей"
        description="Вызовите игрока на дуэль или подключите Supabase для realtime-матчей"
        action={<Button icon={<Swords className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>Вызвать на дуэль</Button>}
      />

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Вызвать на дуэль">
        <div className="space-y-4">
          <Input label="Имя игрока или Email" placeholder="username или email" icon={<Users className="w-4 h-4" />} />
          <Select
            label="Тип дуэли"
            options={Object.entries(DUEL_TYPES).map(([key, d]) => ({ value: key, label: `${d.label} (${d.timePerQuestion}с/вопрос)` }))}
          />
          <Select
            label="Квиз"
            options={[{ value: '', label: 'Случайный квиз' }]}
          />
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-400">Ставка: <span className="text-amber-400 font-semibold">±25 ELO</span></p>
          </div>
          <Button className="w-full" icon={<Swords className="w-4 h-4" />}>Отправить вызов</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Duels;
