import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { Layout, ToastContainer } from '@/components/layout';

import Home from '@/pages/Home';
import { LoginPage, RegisterPage } from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Rooms from '@/pages/Rooms';
import Quizzes, { CreateQuiz } from '@/pages/Quizzes';
import Tests from '@/pages/Tests';
import Duels from '@/pages/Duels';
import Leaderboard from '@/pages/Leaderboard';
import Notifications from '@/pages/Notifications';
import Admin from '@/pages/Admin';

const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-950">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-2xl shadow-indigo-500/25 animate-pulse">
        СП
      </div>
      <p className="text-slate-400 text-sm">Загрузка...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const { initialize } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.style.colorScheme = theme;
  }, [theme]);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
            <Route path="/quizzes/create" element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
            <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
            <Route path="/duels" element={<ProtectedRoute><Duels /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><div className="text-center py-20 text-slate-400">Раздел групп (скоро)</div></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><div className="text-center py-20 text-slate-400">Аналитика (скоро)</div></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
      <ToastContainer />
    </div>
  );
};

export default App;
