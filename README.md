# 🔥 KINTSUGI AI - Модульна AI Платформа

## 📋 ОГЛЯД ПРОЕКТУ

**Kintsugi AI** - повнофункціональна AI-платформа з необруталістичним дизайном, що включає:
- 🤖 AI Чатбот (OpenAI GPT-4o, o1, o3-mini)
- 💬 Повноцінний месенджер з WebSocket
- 📞 P2P відео/аудіо дзвінки (WebRTC → 100ms fallback)
- 📚 Переклад великих текстів (DeepL API для документів)
- 💳 Stripe підписки з токен-лімітами
- 🤖 Кастомні AI агенти (PRO функція)

---

## 🏗️ АРХІТЕКТУРА

### Модульна структура (легко розширювана):

```
kintsugi-ai/
├── backend/                    # Go API
│   ├── cmd/
│   │   ├── api/               # HTTP сервер
│   │   └── ws/                # WebSocket сервер
│   ├── internal/
│   │   ├── modules/           # 🔥 МОДУЛІ (незалежні)
│   │   │   ├── auth/          # ✅ Модуль 1: Автентифікація
│   │   │   ├── chat/          # ✅ Модуль 2: AI Чат
│   │   │   ├── messenger/     # ✅ Модуль 3: Месенджер
│   │   │   ├── calls/         # ✅ Модуль 4: Відео/аудіо
│   │   │   ├── subscription/  # ✅ Модуль 5: Stripe підписки
│   │   │   ├── translation/   # 🔜 Модуль 6: Переклади
│   │   │   └── agents/        # 🔜 Модуль 7: AI Агенти
│   │   ├── database/
│   │   ├── websocket/
│   │   └── middleware/
│   └── pkg/                   # Зовнішні SDK
├── frontend/                  # Next.js 14
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (chat)/
│   │   ├── (messenger)/
│   │   └── (dashboard)/
│   ├── components/
│   │   ├── modules/           # 🔥 МОДУЛЬНІ КОМПОНЕНТИ
│   │   │   ├── Auth/
│   │   │   ├── Chat/
│   │   │   ├── Messenger/
│   │   │   └── Calls/
│   │   └── ui/                # Design system
│   └── lib/
└── docs/                      # 📚 Документація модулів
```

---

## 🎯 ПОТОЧНИЙ СТАН (MVP)

### ✅ ПРАЦЮЄ СЬОГОДНІ:
1. **Реєстрація/Логін** (email, логін, пароль)
2. **AI Чат** з OpenAI (streaming відповіді)
3. **Месенджер** (текст, медіа, редагування, видалення)
4. **Відео/аудіо дзвінки** (P2P WebRTC + 100ms fallback)
5. **Stripe підписки** (3 плани з токен-лімітами)

### 🔜 В РОЗРОБЦІ:
- Переклад великих документів (DeepL)
- Кастомні AI агенти
- Stories в месенджері
- Групові конференції

---

## 💰 ПЛАНИ ПІДПИСОК

### 🆓 BASIC (Free)
- Текстова переписка з чатботом
- Прості задачі, редагування
- **Ліміт**: 100,000 токенів/добу
- **Моделі**: gpt-4o-mini
- **Функції**: Базовий месенджер

### 💎 PREMIUM (3 плани)

#### Premium Starter - $9.99/міс
- **500,000 токенів кожні 6 годин** (2M/добу)
- Складні задачі, кодинг
- Голосові/відео дзвінки (100 хв/міс)
- 1 кастомний AI агент
- Моделі: gpt-4o, gpt-4-turbo

#### Premium Pro - $29.99/міс
- **2,000,000 токенів кожні 6 годин** (8M/добу)
- Всі моделі (включаючи o1)
- Відео дзвінки (500 хв/міс)
- До 10 кастомних агентів
- Пріоритетна підтримка

#### Premium Ultra - $99.99/міс
- **5,000,000 токенів кожні 6 годин** (20M/добу)
- Безлімітні відео дзвінки
- Безлімітні агенти
- Ранній доступ до оновлень

### 🚀 UNLIMITED - $299.99/міс
- **Безлімітні токени**
- Вся потужність (o1, o3-mini, fine-tuned моделі)
- Створення сайтів/застосунків
- Складні воркфлоу (n8n, make.com)
- VIP підтримка 24/7
- Ранній доступ до всіх фіч

---

## 📊 ТЕХНІЧНИЙ СТЕК

### Backend (Go)
- **Framework**: Fiber v2 (швидкість + WebSocket)
- **Database**: PostgreSQL + GORM
- **Cache**: Redis (sessions, rate limiting)
- **WebSocket**: gorilla/websocket
- **Auth**: JWT (access + refresh tokens)
- **API**: OpenAI SDK
- **Payments**: Stripe SDK
- **Video**: 100ms SDK

### Frontend (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS (neo-brutalism)
- **State**: Zustand
- **Real-time**: Socket.io / WebSocket
- **Video**: Simple-peer (P2P) + @100mslive/react-sdk
- **Forms**: React Hook Form + Zod

### Infrastructure (Railway)
- PostgreSQL
- Redis
- MinIO (file storage)
- Environment-based config

---

## 🎨 ДИЗАЙН СИСТЕМА

### Neo-Brutalism Style
```css
Colors:
- Digital Black: #0A0A0A
- Kintsugi Gold: #F0FF00
- Cyber Pink: #FF00FF
- Cyber Cyan: #00FFFF
- Neon Orange: #FF6B00
- Matrix Green: #00FF41

Typography:
- Font: Courier New, monospace
- Style: UPPERCASE, BOLD
- Borders: 3px solid
- Shadows: 8px 8px 0px (neo-brutalism effect)

Effects:
- Glitch animations
- CRT scanlines
- Custom cursor (white cross + invert)
- Marquee banner з нахилом 20° + glitch
```

---

## 📚 DEEPL API - ПЕРЕКЛАД ВЕЛИКИХ ДОКУМЕНТІВ

### Можливості DeepL:
✅ **Підтримка форматів**: PDF, DOCX, PPTX, XLSX, HTML, TXT, SRT
✅ **Розмір файлу**: До 30MB (з налаштуваннями timeout)
✅ **Мінімальний білінг**: 50,000 символів за документ
✅ **Збереження форматування**: Оригінальний дизайн зберігається
✅ **Output формати**: Можна конвертувати (PDF → DOCX)

### Стратегія для книжок:
1. **Малі книги (<5MB)**: Прямий upload через DeepL API
2. **Великі книги (>5MB)**:
   - Розбити на розділи
   - Batch перекладати по 50-100 сторінок
   - Зібрати результат
3. **Fallback**: Якщо DeepL timeout - використати text API з chunking

---

## 🔒 БЕЗПЕКА

- JWT токени (15 хв access + 7 днів refresh)
- Password hashing (bcrypt, cost 12)
- Rate limiting (Redis-based)
- SQL injection захист (GORM prepared statements)
- XSS захист (React автоматичний escape)
- CORS налаштування
- Stripe webhook signature verification
- WebSocket auth (token-based)

---

## 🚀 РОЗГОРТАННЯ (Railway)

### Environment Variables:
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 100ms
HMS_APP_ACCESS_KEY=...
HMS_APP_SECRET=...

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# JWT
JWT_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h

# Token Limits (налаштовуються)
BASIC_TOKEN_LIMIT=100000
PREMIUM_STARTER_TOKEN_LIMIT=500000
PREMIUM_PRO_TOKEN_LIMIT=2000000
PREMIUM_ULTRA_TOKEN_LIMIT=5000000
TOKEN_RESET_INTERVAL=6h

# DeepL
DEEPL_API_KEY=...
```

---

## 📖 ДОКУМЕНТАЦІЯ МОДУЛІВ

Кожен модуль має власну документацію:

- [AUTH Module](docs/modules/AUTH.md) - Реєстрація, логін, JWT
- [CHAT Module](docs/modules/CHAT.md) - AI чатбот, streaming
- [MESSENGER Module](docs/modules/MESSENGER.md) - WebSocket месенджер
- [CALLS Module](docs/modules/CALLS.md) - P2P + 100ms відео/аудіо
- [SUBSCRIPTION Module](docs/modules/SUBSCRIPTION.md) - Stripe підписки
- [TRANSLATION Module](docs/modules/TRANSLATION.md) - DeepL документи
- [AGENTS Module](docs/modules/AGENTS.md) - Кастомні AI агенти

---

## 🛠️ ШВИДКИЙ СТАРТ

### Backend:
```bash
cd backend
go mod download
go run cmd/api/main.go
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Database migrations:
```bash
cd backend
make migrate-up
```

---

## 📝 ROADMAP

### Phase 1 (Сьогодні) ✅
- Реєстрація/логін
- AI чат
- Месенджер
- Відео/аудіо дзвінки
- Stripe підписки

### Phase 2 (Тиждень 1)
- DeepL переклад документів
- Stories в месенджері
- Групові чати
- Реакції, репости

### Phase 3 (Тиждень 2)
- Кастомні AI агенти
- Function calling
- n8n/make.com інтеграції

### Phase 4 (Тиждень 3)
- Групові відео конференції
- Screen sharing
- Запис дзвінків

### Phase 5 (Тиждень 4)
- Оптимізація продуктивності
- Security audit
- Production deploy

---

## 👨‍💻 АВТОР

**Kintsugi AI Team**
- Backend: Go + Fiber
- Frontend: Next.js + TypeScript
- Design: Neo-Brutalism
- Deploy: Railway

---

**Версія**: 1.0.0 MVP
**Дата**: 2025-01-15
**Статус**: 🚀 Active Development
