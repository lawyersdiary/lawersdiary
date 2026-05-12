import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Swords, MessageSquare, BookOpen, Users, Zap, Shield, ChevronRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { APP_NAME } from '@/lib/config';
import { useAuthStore } from '@/store/useAuthStore';

const features = [
  { icon: <BookOpen className="w-6 h-6" />, title: 'Квизы и тесты', desc: 'Создавайте и проходите тесты по праву в различных форматах', color: 'from-blue-500 to-cyan-500' },
  { icon: <Swords className="w-6 h-6" />, title: 'Дуэли', desc: 'Сражайтесь в реальном времени с другими игроками', color: 'from-red-500 to-orange-500' },
  { icon: <MessageSquare className="w-6 h-6" />, title: 'Комнаты', desc: 'Общайтесь, играйте и учитесь вместе в реальном времени', color: 'from-green-500 to-emerald-500' },
  { icon: <Trophy className="w-6 h-6" />, title: 'Рейтинги', desc: 'ELO-система, достижения и таблицы лидеров', color: 'from-amber-500 to-yellow-500' },
  { icon: <Users className="w-6 h-6" />, title: 'Группы', desc: 'Преподаватели создают группы и назначают тесты ученикам', color: 'from-violet-500 to-purple-500' },
  { icon: <Zap className="w-6 h-6" />, title: 'Realtime', desc: 'Все обновляется мгновенно через WebSocket', color: 'from-pink-500 to-rose-500' },
];

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-slate-400 mb-8">
              <Shield className="w-4 h-4 text-indigo-400" />
              Платформа интеллектуальных игр и тестирования
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Учитесь, соревнуйтесь и общайтесь. Квизы, дуэли, рейтинги и realtime-взаимодействие
            для будущих юристов и правоведов.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" onClick={() => navigate('/register')} className="min-w-[200px]">
              Начать сейчас
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')} className="min-w-[200px]">
              Войти в аккаунт
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-16 text-center"
          >
            <div>
              <p className="text-2xl font-bold text-white">Realtime</p>
              <p className="text-sm text-slate-500">WebSocket sync</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">ELO</p>
              <p className="text-sm text-slate-500">Рейтинг</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">5 ролей</p>
              <p className="text-sm text-slate-500">Система доступа</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Всё для интеллектуального развития</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Комплексная платформа, объединяющая обучение, соревнование и общение</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover padding="lg" className="h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Регистрация', desc: 'Создайте аккаунт и получите начальный рейтинг 1000 ELO' },
              { step: '02', title: 'Учитесь и играйте', desc: 'Проходите тесты, участвуйте в квизах и дуэлях' },
              { step: '03', title: 'Поднимайтесь в рейтинге', desc: 'Побеждайте, получайте достижения и станьте легендой' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="text-5xl font-black text-indigo-600/30 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} {APP_NAME}. Все права защищены.</p>
          <p>Production-ready platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
