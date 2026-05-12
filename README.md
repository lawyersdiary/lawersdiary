# ⚖️ СПРАВОЧНИК ПО ПРАВО

> Интеллектуальная платформа для тестирования, квизов, дуэлей и realtime-взаимодействия

**Discord + Kahoot + QuizUp + Telegram + Chess.com** — но для интеллектуальных игр, тестов и общения.

---

## 🏗 Архитектура

```
┌─────────────────────────────────────┐
│           Frontend (React)          │
│  ┌──────┬──────┬──────┬──────────┐  │
│  │Pages │Comp. │Store │  Hooks   │  │
│  └──┬───┴──┬───┴──┬───┴────┬─────┘  │
│     │      │      │        │        │
│  ┌──┴──────┴──────┴────────┴─────┐  │
│  │     Supabase Client SDK       │  │
│  └──────────────┬────────────────┘  │
└─────────────────┼───────────────────┘
                  │
┌─────────────────┼───────────────────┐
│     Supabase Backend               │
│  ┌──────┬────────┬──────────────┐   │
│  │ Auth │Database│   Storage    │   │
│  │      │+RLS    │  (S3-like)   │   │
│  └──────┴────────┴──────────────┘   │
│  ┌──────────────────────────────┐   │
│  │    Realtime (WebSocket)      │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │   Yandex Cloud    │
        │  (CDN + Storage)  │
        └───────────────────┘
```

## 🚀 Технологии

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** — стилизация
- **Zustand** — state management
- **Framer Motion** — анимации
- **React Router 7** — маршрутизация
- **Lucide React** — иконки

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime + Storage)
- **Row Level Security (RLS)**
- **WebSocket Realtime**
- **JWT Authentication**

### Production (опционально)
- **Yandex Object Storage** — файлы
- **Yandex Cloud Functions** — serverless
- **Yandex CDN** — доставка контента

## 📦 Установка

### 1. Клонируйте и установите зависимости

```bash
git clone <repo-url>
cd справочник-по-право
npm install
```

### 2. Настройте переменные окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Создайте Supabase проект

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL и anon key в `.env`

### 4. Запустите SQL-миграцию

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте содержимое `supabase/migrations/001_initial_schema.sql`
3. Выполните SQL

### 5. Настройте Supabase

В Dashboard включите:
- **Authentication** → Email provider ✅
- **Realtime** → Включите для таблиц: `messages`, `duels`, `notifications`, `rooms`, `profiles`
- **Storage** → Создайте buckets: `avatars`, `quiz-images`, `media`, `documents`

### 6. Запустите приложение

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:5173`

## 🏛 Структура проекта

```
src/
├── App.tsx                    # Главный компонент с роутингом
├── main.tsx                   # Точка входа
├── index.css                  # Глобальные стили
├── vite-env.d.ts              # Типы переменных окружения
│
├── lib/
│   ├── config.ts              # Конфигурация, константы
│   └── supabase.ts            # Supabase клиент
│
├── types/
│   └── index.ts               # TypeScript типы
│
├── store/
│   ├── useAuthStore.ts        # Auth (JWT, сессия, роли)
│   ├── useUIStore.ts          # UI (тема, сайдбар, модалки)
│   └── useDataStores.ts       # Данные (rooms, quizzes, duels)
│
├── components/
│   ├── ui.tsx                 # Общие UI-компоненты
│   └── layout.tsx             # Layout, Header, Sidebar
│
└── pages/
    ├── Home.tsx               # Landing page
    ├── Auth.tsx               # Login / Register
    ├── Dashboard.tsx          # Главная (после входа)
    ├── Profile.tsx            # Профиль пользователя
    ├── Rooms.tsx              # Комнаты + чат
    ├── Quizzes.tsx            # Квизы + создание
    ├── Tests.tsx              # Тесты (классический + ввод ответов)
    ├── Duels.tsx              # Дуэли
    ├── Leaderboard.tsx        # Рейтинг
    ├── Notifications.tsx      # Уведомления
    └── Admin.tsx              # Админ-панель
```

## 🔐 Система ролей

| Роль | Уровень | Возможности |
|------|---------|-------------|
| **Admin** | 5 | Полный доступ ко всему |
| **Moderator** | 4 | Модерация контента, жалобы |
| **Teacher** | 3 | Создание тестов, группы, аналитика |
| **Student** | 2 | Прохождение тестов, участие в играх |
| **User** | 1 | Базовый функционал |

## 🎮 Функционал

### Квизы и тесты
- ✅ Классический режим (вопросы, варианты, таймер)
- ✅ Режим ввода ответов (1.A, 2.C, 3.D)
- ✅ Автоматическая проверка по ключу
- ✅ Статистика и результаты

### Дуэли
- ✅ Blitz (10с/вопрос)
- ✅ Ranked (30с/вопрос, ±ELO)
- ✅ Classic (60с/вопрос)
- ✅ Hardcore (5с/вопрос)
- ✅ ELO/MMR система рейтинга
- ✅ Spectator mode

### Комнаты
- ✅ Public / Private / Password
- ✅ Realtime чат
- ✅ Реакции, упоминания
- ✅ Online статус
- ✅ Live quiz внутри комнаты

### Рейтинг
- ✅ ELO-система (как в шахматах)
- ✅ 7 рангов (Новичок → Легенда)
- ✅ Достижения (10+ штук)
- ✅ Таблица лидеров

## 🌐 Деплой

### Vercel / Netlify
```bash
npm run build
# Деплойте папку dist/
```

### Yandex Cloud (production)

1. **Object Storage** — для статики
```bash
npm run build
# Загрузите dist/ в bucket
```

2. **CDN** — настройте в Yandex Cloud Console

3. **Cloud Functions** — для serverless API (если нужно)

### Docker
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 📊 База данных

16 таблиц:
- `profiles` — профили пользователей
- `rooms` / `room_members` — комнаты
- `messages` — сообщения в чатах
- `quizzes` / `questions` — квизы
- `tests` — тесты
- `submissions` / `answers` — ответы
- `duels` — дуэли
- `notifications` — уведомления
- `achievements` / `user_achievements` — достижения
- `reports` — жалобы
- `groups` / `group_members` — группы
- `logs` — логи действий

Все таблицы защищены **Row Level Security (RLS)**.

## 📝 Лицензия

Proprietary. Все права защищены.

---

**Built with ❤️ using React + Supabase**
