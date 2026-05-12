import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Trophy, Swords, FileText, Bell, LogOut,
  Menu, X, Shield, MessageSquare, Plus,
  Search, Moon, Sun, BarChart3, UserPlus, FileQuestion
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useNotificationStore } from '@/store/useDataStores';
import { Avatar, Button, Toast } from '@/components/ui';
import { APP_NAME, ROLES } from '@/lib/config';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Главная' },
  { to: '/rooms', icon: MessageSquare, label: 'Комнаты' },
  { to: '/quizzes', icon: FileQuestion, label: 'Квизы' },
  { to: '/tests', icon: FileText, label: 'Тесты' },
  { to: '/duels', icon: Swords, label: 'Дуэли' },
  { to: '/leaderboard', icon: Trophy, label: 'Рейтинг' },
];

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Админ-панель' },
];

const teacherItems = [
  { to: '/groups', icon: UserPlus, label: 'Группы' },
  { to: '/analytics', icon: BarChart3, label: 'Аналитика' },
];

export const Header: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const roleColor = profile ? ROLES[profile.role]?.color : '#8b5cf6';

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 px-4 lg:px-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white lg:hidden mr-2">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mr-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
          СП
        </div>
        <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          {APP_NAME}
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {}}
            onBlur={() => {}}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {profile && (
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10">
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors">
              <Avatar src={profile.avatar_url} name={profile.username} size="sm" online />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{profile.display_name || profile.username}</p>
                <p className="text-xs font-medium" style={{ color: roleColor }}>
                  {ROLES[profile.role]?.label}
                </p>
              </div>
            </button>
            <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors" title="Выйти">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { profile, hasMinRole } = useAuthStore();
  const navigate = useNavigate();

  const allNavItems = [
    ...navItems,
    ...(hasMinRole('teacher') ? teacherItems : []),
    ...(hasMinRole('admin') ? adminItems : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo area - mobile close */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 lg:hidden">
          <span className="text-lg font-bold text-white">{APP_NAME}</span>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-3">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/quizzes/create')}
          >
            Создать
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {allNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User stats */}
        {profile && (
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Рейтинг: {profile.elo_rating}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-emerald-400">{profile.wins}</p>
                  <p className="text-[10px] text-slate-500">Побед</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-400">{profile.losses}</p>
                  <p className="text-[10px] text-slate-500">Пораж.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-400">{profile.draws}</p>
                  <p className="text-[10px] text-slate-500">Ничьих</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialized, loading } = useAuthStore();

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-2xl shadow-indigo-500/25 animate-pulse">
            СП
          </div>
          <p className="text-slate-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};
