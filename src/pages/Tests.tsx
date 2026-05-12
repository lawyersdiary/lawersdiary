import React, { useState } from 'react';
import { FileText, Plus, Search, CheckCircle, AlertCircle, ClipboardList } from 'lucide-react';
import { Card, Button, Input, EmptyState, Modal, Textarea } from '@/components/ui';

const Tests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [testMode, setTestMode] = useState<'classic' | 'answer_input'>('classic');

  const [answerInput, setAnswerInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);

  const handleAnswerSubmit = () => {
    const lines = answerInput.trim().split('\n');
    const parsed: Record<string, string> = {};
    lines.forEach((line) => {
      const match = line.match(/^\s*(\d+)\s*[.)]\s*([A-Za-zА-Яа-я])\s*$/);
      if (match) {
        parsed[match[1]] = match[2].toUpperCase();
      }
    });
    setResults(parsed);
    setShowResults(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Тесты</h1>
          <p className="text-slate-400 text-sm">Классические тесты и режим загрузки ответов</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
          Создать тест
        </Button>
      </div>

      <div className="flex gap-4">
        <Card hover className="flex-1" onClick={() => { setTestMode('classic'); }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Классический тест</h3>
              <p className="text-xs text-slate-400">Вопросы, варианты, таймер</p>
            </div>
          </div>
        </Card>
        <Card hover className="flex-1" onClick={() => { setTestMode('answer_input'); }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Ввод ответов</h3>
              <p className="text-xs text-slate-400">Введите свои ответы для проверки</p>
            </div>
          </div>
        </Card>
      </div>

      {testMode === 'answer_input' ? (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Режим ввода ответов</h2>
          <p className="text-sm text-slate-400 mb-4">
            Введите свои ответы в формате: номер — вариант ответа. Каждый ответ на новой строке.
          </p>
          <Textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder={`1.A\n2.C\n3.D\n4.B\n5.A`}
            rows={10}
            className="font-mono"
          />
          <div className="flex gap-3 mt-4">
            <Button icon={<CheckCircle className="w-4 h-4" />} onClick={handleAnswerSubmit}>
              Проверить ответы
            </Button>
          </div>

          {showResults && results && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Результаты проверки</h3>
              <div className="bg-white/5 rounded-xl p-4 space-y-2">
                {Object.entries(results).map(([num, _answer]) => (
                  <div key={num} className="flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Вопрос {num}: отправлен на проверку</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Подключите Supabase для автоматической проверки по ключу ответов
              </p>
            </div>
          )}
        </Card>
      ) : (
        <>
          <Input placeholder="Поиск тестов..." icon={<Search className="w-4 h-4" />} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <EmptyState
            icon={<FileText className="w-16 h-16" />}
            title="Нет тестов"
            description="Создайте первый тест или подключите Supabase для загрузки данных"
            action={<Button onClick={() => setCreateOpen(true)}>Создать тест</Button>}
          />
        </>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Создать тест" size="lg">
        <CreateTestForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
};

const CreateTestForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'classic' | 'answer_input'>('classic');
  const [answerKey, setAnswerKey] = useState('');
  const [timeLimit, setTimeLimit] = useState('60');

  return (
    <div className="space-y-4">
      <Input label="Название теста" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Тест по уголовному праву" />
      <Textarea label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание теста..." rows={2} />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">Режим</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'classic' | 'answer_input')}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="classic" className="bg-slate-800">Классический</option>
            <option value="answer_input" className="bg-slate-800">Ввод ответов</option>
          </select>
        </div>
        <Input label="Лимит времени (мин)" type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
      </div>
      {mode === 'answer_input' && (
        <Textarea
          label="Ключ ответов (для авто-проверки)"
          value={answerKey}
          onChange={(e) => setAnswerKey(e.target.value)}
          placeholder={`1.A\n2.C\n3.D`}
          rows={5}
          className="font-mono"
        />
      )}
      <Button className="w-full" onClick={onClose}>Создать тест</Button>
    </div>
  );
};

export default Tests;
