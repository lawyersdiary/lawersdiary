import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { APP_NAME } from '@/lib/config';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-indigo-500/25">
              СП
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Вход в {APP_NAME}</h1>
            <p className="text-slate-400 text-sm">Введите свои данные для входа</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Войти
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Зарегистрироваться</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (username.length < 3) {
      setError('Имя пользователя должно быть не менее 3 символов');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, username);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-indigo-500/25">
              СП
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Регистрация</h1>
            <p className="text-slate-400 text-sm">Создайте аккаунт для начала работы</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Отображаемое имя"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Иван Иванов"
              />
            </div>
            <div className="relative">
              <Input
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label="Подтвердите пароль"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Зарегистрироваться
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Войти</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
