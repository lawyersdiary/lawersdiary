import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, Flag, Search, BarChart3, MessageSquare, Swords, Eye } from 'lucide-react';
import { Card, Button, Input, Badge, EmptyState, Modal, Select } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useRoomStore, useQuizStore } from '@/store/useDataStores';

const adminTabs = [
  { id: 'overview', label: 'Обзор', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'users', label: 'Пользователи', icon: <Users className="w-4 h-4" /> },
  { id: 'quizzes', label: 'Квизы', icon: <FileText className="w-4 h-4" /> },
  { id: 'rooms', label: 'Комнаты', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'duels', label: 'Дуэли', icon: <Swords className="w-4 h-4" /> },
  { id: 'reports', label: 'Жалобы', icon: <Flag className="w-4 h-4" /> },
];

const Admin: React.FC = () => {
  const { hasMinRole } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleModal, setRoleModal] = useState(false);
  const { rooms, fetchRooms } = useRoomStore();
const { quizzes, tests, fetchQuizzes, fetchTests } = useQuizStore();

const [usersCount, setUsersCount] = useState(0);

useEffect(() => {
  fetchRooms();
  fetchQuizzes();
  fetchTests();

  const loadUsers = async () => {
    const { supabase } = await import('@/lib/supabase');

    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    setUsersCount(count || 0);
  };

  loadUsers();
}, []);

  if (!hasMinRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<Shield className="w-16 h-16" />}
          title="Доступ запрещён"
          description="Эта страница доступна только администраторам"
          action={<Button onClick={() => navigate('/dashboard')}>На главную</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-red-400" />
        <h1 className="text-2xl font-bold">Админ-панель</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Пользователи', value: '—', icon: <Users className="w-5 h-5" />, color: 'text-blue-400', bg: 'from-blue-500/20' },
              { label: 'Квизы', value: '—', icon: <FileText className="w-5 h-5" />, color: 'text-emerald-400', bg: 'from-emerald-500/20' },
              { label: 'Комнаты', value: '—', icon: <MessageSquare className="w-5 h-5" />, color: 'text-violet-400', bg: 'from-violet-500/20' },
              { label: 'Жалобы', value: '—', icon: <Flag className="w-5 h-5" />, color: 'text-red-400', bg: 'from-red-500/20' },
            ].map((stat) => (
              <Card key={stat.label} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} to-transparent opacity-50`} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-xs text-slate-400">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="font-semibold mb-4">Realtime активность</h3>
            <EmptyState
              icon={<Eye className="w-10 h-10" />}
              title="Подключите Supabase"
              description="Для отображения realtime-активности пользователей"
            />
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <Input placeholder="Поиск пользователей..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Пользователь</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Роль</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">ELO</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Статус</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title="Нет данных"
              description="Подключите Supabase для управления пользователями"
            />
          </Card>

          <Modal isOpen={roleModal} onClose={() => setRoleModal(false)} title="Изменить роль">
            <div className="space-y-4">
              <Select label="Новая роль" options={[
                { value: 'user', label: 'Пользователь' },
                { value: 'student', label: 'Ученик' },
                { value: 'teacher', label: 'Преподаватель' },
                { value: 'moderator', label: 'Модератор' },
                { value: 'admin', label: 'Администратор' },
              ]} />
              <Button className="w-full">Сохранить</Button>
            </div>
          </Modal>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <Input placeholder="Поиск квизов..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="Управление контентом"
            description="Подключите Supabase для модерации квизов и тестов"
          />
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <Input placeholder="Поиск комнат..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="Управление комнатами"
            description="Подключите Supabase для модерации комнат"
          />
        </div>
      )}

      {activeTab === 'duels' && (
        <div className="space-y-4">
          <EmptyState
            icon={<Swords className="w-12 h-12" />}
            title="Управление дуэлями"
            description="Просмотр и модерация дуэлей"
          />
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge variant="danger">Ожидают: —</Badge>
            <Badge variant="success">Решены: —</Badge>
          </div>
          <Card padding="none">
            <EmptyState
              icon={<Flag className="w-12 h-12" />}
              title="Нет жалоб"
              description="Подключите Supabase для обработки жалоб"
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
