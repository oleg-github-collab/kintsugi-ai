# 📅 KINTSUGI AI - ПЛАН МОДУЛЬНОГО РОЗВИТКУ

## 🎯 ПРІОРИТЕТИ

**Сьогодні працює**:
1. ✅ Реєстрація/Логін (AUTH модуль)
2. ✅ AI Чат (CHAT модуль)
3. ✅ Месенджер (MESSENGER модуль)
4. ✅ Відео/аудіо дзвінки P2P + 100ms (CALLS модуль)
5. ✅ Stripe підписки + токен-ліміти (SUBSCRIPTION модуль)

---

## 📐 ПОСЛІДОВНІСТЬ РОЗРОБКИ

### **ТИЖДЕНЬ 1: CORE MVP** ✅

#### День 1-2: Backend Foundation
- [x] Структура проекту
- [x] Database schema
- [x] AUTH module (повністю)
- [x] Базовий API сервер (Fiber)
- [x] JWT middleware
- [x] Migrations

#### День 3-4: AI Chat
- [x] CHAT module implementation
- [x] OpenAI integration
- [x] Streaming SSE responses
- [x] Token counting
- [x] Chat history

#### День 5-7: Messenger + Calls
- [x] WebSocket server
- [x] MESSENGER module
- [x] Real-time messaging
- [x] P2P WebRTC (simple-peer)
- [x] 100ms fallback
- [x] CALLS module signaling

---

### **ТИЖДЕНЬ 2: FRONTEND + PAYMENTS**

#### День 1-3: Frontend Core
- [ ] Next.js 14 setup
- [ ] Design system (neo-brutalism components)
- [ ] Landing page (зберегти index.html стиль)
- [ ] Auth pages (login/register)
- [ ] Dashboard layout

#### День 4-5: Chat Interface
- [ ] Chat list
- [ ] Chat window
- [ ] Message bubbles (neo-brutalism)
- [ ] Model selector
- [ ] Streaming typing effect

#### День 6-7: Messenger Interface
- [ ] Conversation list
- [ ] Message input
- [ ] Media upload
- [ ] Reactions UI
- [ ] Edit/delete messages

---

### **ТИЖДЕНЬ 3: VIDEO CALLS + SUBSCRIPTIONS**

#### День 1-3: Video/Audio UI
- [ ] Video room component (100ms SDK)
- [ ] P2P connection UI
- [ ] Call controls
- [ ] Incoming call modal
- [ ] Call history

#### День 4-5: Stripe Integration
- [ ] SUBSCRIPTION module (backend)
- [ ] Checkout flow
- [ ] Pricing page
- [ ] Customer portal
- [ ] Webhook handlers

#### День 6-7: Token Limits System
- [ ] Token counting middleware
- [ ] Usage dashboard
- [ ] Limit warnings
- [ ] Reset logic (кожні 6 годин)
- [ ] Tier checks

---

### **ТИЖДЕНЬ 4: ADVANCED FEATURES**

#### День 1-3: Translation Module
- [ ] TRANSLATION module
- [ ] DeepL document upload
- [ ] Large book processing
- [ ] Translation history
- [ ] UI for translator

#### День 4-7: AI Agents (PRO)
- [ ] AGENTS module
- [ ] Agent builder UI
- [ ] Function calling
- [ ] n8n/make.com webhooks
- [ ] Agents in messenger

---

### **ТИЖДЕНЬ 5: POLISH + DEPLOY**

#### День 1-3: Mobile Adaptation
- [ ] Responsive design (всі сторінки)
- [ ] Mobile messenger
- [ ] Touch gestures
- [ ] PWA features

#### День 4-5: Performance
- [ ] Database indexing
- [ ] Redis caching
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle size optimization

#### День 6-7: Deployment
- [ ] Railway setup
- [ ] Environment variables
- [ ] SSL certificates
- [ ] Monitoring (Sentry)
- [ ] Production deploy 🚀

---

## 🔧 МОДУЛІ - ПОРЯДОК ПІДКЛЮЧЕННЯ

### 1. AUTH ← **БАЗОВИЙ** (Готовий)
```bash
# Підключення:
backend/cmd/api/main.go:
  authRepo := auth.NewRepository(db)
  authService := auth.NewService(authRepo, jwtSecret)
  authHandler := auth.NewHandler(authService)
  authMiddleware := auth.AuthMiddleware(authService)
  auth.RegisterRoutes(app, authHandler, authMiddleware)
```

### 2. CHAT ← Залежить від AUTH
```bash
# Підключення:
  chatRepo := chat.NewRepository(db)
  chatService := chat.NewService(chatRepo, openaiClient)
  chatHandler := chat.NewHandler(chatService)
  chat.RegisterRoutes(app, chatHandler, authMiddleware)
```

### 3. SUBSCRIPTION ← Залежить від AUTH
```bash
# Підключення:
  subRepo := subscription.NewRepository(db)
  subService := subscription.NewService(subRepo, stripeClient)
  subHandler := subscription.NewHandler(subService)
  subscription.RegisterRoutes(app, subHandler, authMiddleware)

# Middleware для CHAT:
  chat.RegisterRoutes(app, chatHandler, authMiddleware, subMiddleware)
```

### 4. MESSENGER ← Залежить від AUTH + WebSocket
```bash
# WebSocket server (окремий процес):
backend/cmd/ws/main.go:
  hub := websocket.NewHub()
  go hub.Run()

  messengerRepo := messenger.NewRepository(db)
  messengerService := messenger.NewService(messengerRepo, hub)
  messengerHandler := messenger.NewHandler(messengerService)
  messenger.RegisterRoutes(app, messengerHandler, authMiddleware)
```

### 5. CALLS ← Залежить від MESSENGER + WebSocket
```bash
# Підключення:
  callsRepo := calls.NewRepository(db)
  callsService := calls.NewService(callsRepo, hmsClient, hub)
  callsHandler := calls.NewHandler(callsService)
  calls.RegisterRoutes(app, callsHandler, authMiddleware)
```

### 6. TRANSLATION ← Залежить від AUTH + SUBSCRIPTION
```bash
# Підключення:
  translationRepo := translation.NewRepository(db)
  translationService := translation.NewService(translationRepo, deeplClient)
  translationHandler := translation.NewHandler(translationService)
  translation.RegisterRoutes(app, translationHandler, authMiddleware, subMiddleware)
```

### 7. AGENTS ← Залежить від AUTH + SUBSCRIPTION + MESSENGER
```bash
# Підключення:
  agentsRepo := agents.NewRepository(db)
  agentsService := agents.NewService(agentsRepo, openaiClient)
  agentsHandler := agents.NewHandler(agentsService)
  agents.RegisterRoutes(app, agentsHandler, authMiddleware, tierMiddleware("premium_starter"))
```

---

## 📊 DEPENDENCY GRAPH

```
                    ┌─────────┐
                    │  AUTH   │ ← Базовий модуль
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┬─────────────┐
          │              │              │             │
    ┌─────▼─────┐  ┌────▼────┐  ┌──────▼──────┐  ┌──▼──┐
    │   CHAT    │  │  SUBS   │  │  MESSENGER  │  │ ... │
    └───────────┘  └────┬────┘  └──────┬──────┘  └─────┘
                        │              │
                        │         ┌────▼────┐
                        │         │  CALLS  │
                        │         └─────────┘
                        │
                  ┌─────┴──────┬──────────────┐
                  │            │              │
            ┌─────▼──────┐  ┌──▼────┐  ┌─────▼──────┐
            │TRANSLATION │  │AGENTS │  │   FUTURE   │
            └────────────┘  └───────┘  └────────────┘
```

---

## 🚀 ШВИДКИЙ СТАРТ (Для Розробників)

### Додати новий модуль:

```bash
# 1. Створити структуру
mkdir -p backend/internal/modules/my_module
cd backend/internal/modules/my_module

# 2. Створити файли
touch models.go repository.go service.go handler.go routes.go README.md

# 3. Написати код (див. приклад AUTH модуля)

# 4. Підключити в main.go
# backend/cmd/api/main.go:
myModuleRepo := my_module.NewRepository(db)
myModuleService := my_module.NewService(myModuleRepo, dependencies...)
myModuleHandler := my_module.NewHandler(myModuleService)
my_module.RegisterRoutes(app, myModuleHandler, authMiddleware)

# 5. Додати миграції
# backend/migrations/000X_my_module.up.sql

# 6. Документація
# docs/modules/MY_MODULE.md

# 7. Тести
# backend/internal/modules/my_module/service_test.go
```

---

## 📝 CHECKLIST ДЛЯ КОЖНОГО МОДУЛЯ

Перед тим як вважати модуль готовим:

- [ ] **Code**:
  - [ ] models.go (структури даних)
  - [ ] repository.go (DB операції)
  - [ ] service.go (бізнес-логіка)
  - [ ] handler.go (HTTP handlers)
  - [ ] routes.go (реєстрація маршрутів)

- [ ] **Database**:
  - [ ] Migrations створені
  - [ ] Indexes додані
  - [ ] Foreign keys налаштовані

- [ ] **Docs**:
  - [ ] README.md в модулі
  - [ ] API endpoints задокументовані
  - [ ] Приклади request/response

- [ ] **Testing**:
  - [ ] Unit tests для service
  - [ ] Integration tests для API
  - [ ] Test coverage > 70%

- [ ] **Security**:
  - [ ] Auth middleware підключений
  - [ ] Input validation
  - [ ] SQL injection захист
  - [ ] Rate limiting (якщо потрібно)

---

## 🎨 FRONTEND DESIGN SYSTEM

### Зберегти з index.html:

1. **Marquee Banner** (верхня стрічка):
   - Нахил 20°
   - Glitch ефект
   - Blinking animation
   ```css
   transform: rotate(-20deg);
   animation: glitch 0.5s infinite, marquee 30s linear infinite;
   ```

2. **Cursor**:
   - Білий хрест
   - Invert circle
   - Mix-blend-mode: difference

3. **Colors**:
   - Digital Black: #0A0A0A
   - Kintsugi Gold: #F0FF00
   - Cyber Pink: #FF00FF
   - Cyber Cyan: #00FFFF

4. **Effects**:
   - Neo-brutalism shadows (8px 8px)
   - Border 3px solid
   - Scanlines
   - CRT flicker
   - Glitch text

5. **Typography**:
   - Courier New, monospace
   - UPPERCASE
   - BOLD weights

### Mobile Adaptation:

```css
/* Breakpoints */
sm: 640px   /* Phones */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */

/* Touch-friendly */
- Buttons min-height: 48px
- Touch targets min: 44x44px
- Bottom navigation on mobile
- Swipe gestures (messenger)
```

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (.env)

```bash
# Server
PORT=8080
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kintsugi

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM_STARTER=price_...
STRIPE_PRICE_PREMIUM_PRO=price_...
STRIPE_PRICE_PREMIUM_ULTRA=price_...
STRIPE_PRICE_UNLIMITED=price_...

# 100ms
HMS_APP_ACCESS_KEY=...
HMS_APP_SECRET=...

# DeepL
DEEPL_API_KEY=...

# Token Limits (користувацькі налаштування)
BASIC_TOKEN_LIMIT=100000
PREMIUM_STARTER_TOKEN_LIMIT=500000
PREMIUM_PRO_TOKEN_LIMIT=2000000
PREMIUM_ULTRA_TOKEN_LIMIT=5000000
UNLIMITED_TOKEN_LIMIT=-1
TOKEN_RESET_INTERVAL=6h

# File Storage
S3_BUCKET=kintsugi-files
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# CORS
CORS_ORIGINS=http://localhost:3000,https://kintsugi.ai
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_HMS_TOKEN_ENDPOINT=/api/calls/hms-token
```

---

## 📈 METRICS & MONITORING

### Що відстежувати:

1. **Performance**:
   - API response time (avg, p95, p99)
   - WebSocket message latency
   - Database query time
   - Redis hit rate

2. **Business**:
   - Реєстрації за день
   - Active users
   - Tokens використано (по планах)
   - Дзвінків за день
   - Повідомлень за день

3. **Errors**:
   - Error rate (%)
   - Failed payments
   - WebSocket disconnects
   - P2P connection failures

4. **Infrastructure**:
   - CPU usage
   - Memory usage
   - Database connections
   - Redis memory

### Tools:
- **Sentry** - Error tracking
- **Prometheus** - Metrics
- **Grafana** - Dashboards
- **Railway Logs** - Real-time logs

---

## 🐛 DEBUGGING

### Корисні команди:

```bash
# Backend logs
go run cmd/api/main.go | jq .

# Database migrations
migrate -path ./migrations -database $DATABASE_URL up
migrate -path ./migrations -database $DATABASE_URL down 1

# Redis monitoring
redis-cli MONITOR

# Test WebSocket
wscat -c ws://localhost:8080/ws?token=xxx

# Check token validity
curl -H "Authorization: Bearer xxx" http://localhost:8080/api/auth/me
```

---

## 📚 ДОДАТКОВА ДОКУМЕНТАЦІЯ

- [Architecture](./ARCHITECTURE.md) - Повна архітектура
- [Auth Module](./modules/AUTH.md) - Детальна документація AUTH
- [API Reference](./API.md) - Всі endpoints (буде створено)
- [WebSocket Events](./WEBSOCKET.md) - Events spec (буде створено)
- [Deployment](./DEPLOYMENT.md) - Railway deploy guide (буде створено)

---

## ✅ ГОТОВНІСТЬ ДО PRODUCTION

Перед deploy на production:

- [ ] All modules tested
- [ ] Security audit passed
- [ ] Performance optimization done
- [ ] Database indexed
- [ ] Redis configured
- [ ] Environment variables set
- [ ] SSL certificates
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Error tracking (Sentry)
- [ ] Documentation complete
- [ ] Load testing passed (1000+ concurrent users)

---

**Версія**: 1.0.0
**Останнє оновлення**: 2025-01-15
**Автор**: Kintsugi AI Team
