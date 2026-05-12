import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileQuestion, Plus, Search, Play, Eye, Clock, Star,
  Trash2, Check, X
} from 'lucide-react';
import { Card, Button, Input, Textarea, Select, Badge, EmptyState } from '@/components/ui';
import { useQuizStore } from '@/store/useDataStores';
import { CATEGORIES } from '@/lib/config';

const Quizzes: React.FC = () => {
  const { quizzes } = useQuizStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'my' | 'popular'>('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Квизы</h1>
          <p className="text-slate-400 text-sm">Создавайте и проходите квизы по правовым дисциплинам</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/quizzes/create')}>
          Создать квиз
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {[
            { id: 'all', label: 'Все' },
            { id: 'my', label: 'Мои' },
            { id: 'popular', label: 'Популярные' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <Input placeholder="Поиск квизов..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="w-16 h-16" />}
          title="Нет квизов"
          description="Создайте первый квиз или подключите Supabase для загрузки данных"
          action={<Button onClick={() => navigate('/quizzes/create')}>Создать квиз</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz, i) => (
            <motion.div key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover>
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="info">{quiz.category || 'Без категории'}</Badge>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3" />
                    <span className="text-xs">{quiz.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                {quiz.description && <p className="text-sm text-slate-400 mb-4 line-clamp-2">{quiz.description}</p>}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" />{quiz.plays_count} игр</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quiz.time_per_question}с</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{quiz.questions?.length || 0} вопросов</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" icon={<Play className="w-3 h-3" />}>Играть</Button>
                  <Button size="sm" variant="ghost" icon={<Eye className="w-3 h-3" />} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: '',
    time_per_question: 30,
    mode: 'quiz',
    is_public: true,
    questions: [{ text: '', options: ['', '', '', ''], correct_answer: '0', points: 1 }],
  });

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, { text: '', options: ['', '', '', ''], correct_answer: '0', points: 1 }],
    });
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...quiz.questions];
    (updated[index] as Record<string, unknown>)[field] = value;
    setQuiz({ ...quiz, questions: updated });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...quiz.questions];
    const q = { ...updated[qIndex] };
    q.options = [...q.options];
    q.options[oIndex] = value;
    updated[qIndex] = q;
    setQuiz({ ...quiz, questions: updated });
  };

  const removeQuestion = (index: number) => {
    if (quiz.questions.length <= 1) return;
    setQuiz({ ...quiz, questions: quiz.questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/quizzes')} className="text-slate-400 hover:text-white">
          ← Назад
        </button>
        <h1 className="text-2xl font-bold">Создать квиз</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { num: 1, label: 'Основное' },
          { num: 2, label: 'Вопросы' },
          { num: 3, label: 'Публикация' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-2 ${step >= s.num ? 'text-indigo-400' : 'text-slate-500'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}>
              {s.num}
            </div>
            <span className="text-sm hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
          <div className="space-y-4">
            <Input label="Название квиза" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} placeholder="Тест по гражданскому праву" />
            <Textarea label="Описание" value={quiz.description} onChange={(e) => setQuiz({ ...quiz, description: e.target.value })} placeholder="Описание квиза..." rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Категория" options={[{ value: '', label: 'Выберите' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} value={quiz.category} onChange={(e) => setQuiz({ ...quiz, category: e.target.value })} />
              <Input label="Время на вопрос (сек)" type="number" value={quiz.time_per_question.toString()} onChange={(e) => setQuiz({ ...quiz, time_per_question: parseInt(e.target.value) || 30 })} />
            </div>
            <Button onClick={() => setStep(2)}>Далее →</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {quiz.questions.map((q, qi) => (
            <Card key={qi}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Вопрос {qi + 1}</h3>
                <button onClick={() => removeQuestion(qi)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Input
                value={q.text}
                onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                placeholder="Текст вопроса..."
              />
              <div className="grid grid-cols-2 gap-3 mt-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="relative">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Вариант ${oi + 1}`}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${q.correct_answer === String(oi) ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10'}`}
                    />
                    <button
                      onClick={() => updateQuestion(qi, 'correct_answer', String(oi))}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 ${q.correct_answer === String(oi) ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                    >
                      {q.correct_answer === String(oi) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={addQuestion} icon={<Plus className="w-4 h-4" />}>Добавить вопрос</Button>
            <Button onClick={() => setStep(3)}>Далее →</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Публикация</h2>
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-sm text-slate-300"><strong>Название:</strong> {quiz.title || 'Не указано'}</p>
              <p className="text-sm text-slate-300 mt-1"><strong>Вопросов:</strong> {quiz.questions.length}</p>
              <p className="text-sm text-slate-300 mt-1"><strong>Время на вопрос:</strong> {quiz.time_per_question}с</p>
              <p className="text-sm text-slate-300 mt-1"><strong>Категория:</strong> {quiz.category || 'Не указана'}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_public"
                checked={quiz.is_public}
                onChange={(e) => setQuiz({ ...quiz, is_public: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_public" className="text-sm text-slate-300">Публичный квиз</label>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>← Назад</Button>
              <Button>Опубликовать квиз</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Quizzes;
