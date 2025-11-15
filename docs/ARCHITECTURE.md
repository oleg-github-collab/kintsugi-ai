# 🏗️ KINTSUGI AI - МОДУЛЬНА АРХІТЕКТУРА

## 📐 ПРИНЦИПИ АРХІТЕКТУРИ

### 1. **МОДУЛЬНІСТЬ**
Кожна функція - окремий модуль, який можна:
- Розробляти незалежно
- Тестувати окремо
- Підключати/відключати без впливу на інші
- Масштабувати окремо

### 2. **DEPENDENCY INJECTION**
Модулі отримують залежності ззовні, не створюють їх самі.

### 3. **INTERFACE-BASED**
Модулі взаємодіють через інтерфейси, не через конкретні імплементації.

### 4. **CLEAN ARCHITECTURE**
```
User Input → Handler → Service → Repository → Database
                ↓
            Middleware
```

---

## 🧩 СТРУКТУРА МОДУЛІВ

### Кожен модуль містить:

```
module_name/
├── handler.go          # HTTP/WebSocket handlers
├── service.go          # Бізнес-логіка
├── repository.go       # Database операції
├── models.go           # Data structures
├── middleware.go       # Специфічні middleware (опціонально)
├── routes.go           # Route registration
└── README.md           # Документація модуля
```

---

## 🔥 МОДУЛІ (ПОТОЧНІ)

### ✅ MODULE 1: AUTH (Автентифікація)

**Файл**: `backend/internal/modules/auth/`

**Відповідальність**:
- Реєстрація користувачів (email, username, password)
- Логін/логаут
- JWT token generation (access + refresh)
- Password hashing (bcrypt)
- Token validation

**API Endpoints**:
```go
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

**Database Tables**:
- `users` (id, username, email, password_hash, avatar_url, created_at)
- `refresh_tokens` (id, user_id, token, expires_at)

**Dependencies**:
- Database (PostgreSQL)
- Redis (session storage)
- JWT library

**Environment Variables**:
```
JWT_SECRET
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h
```

---

### ✅ MODULE 2: CHAT (AI Чатбот)

**Файл**: `backend/internal/modules/chat/`

**Відповідальність**:
- Створення/управління чатами з AI
- Streaming відповіді від OpenAI
- Підрахунок токенів
- Перевірка лімітів
- Історія розмов

**API Endpoints**:
```go
POST   /api/chats              # Створити чат
GET    /api/chats              # Список чатів
GET    /api/chats/:id          # Отримати чат
DELETE /api/chats/:id          # Видалити чат
POST   /api/chats/:id/messages # Відправити повідомлення (SSE streaming)
GET    /api/chats/:id/messages # Історія
```

**Database Tables**:
- `chats` (id, user_id, model, title, created_at)
- `chat_messages` (id, chat_id, role, content, tokens, created_at)

**Dependencies**:
- OpenAI API
- Subscription module (для перевірки лімітів)
- Database

**OpenAI Models**:
```go
const (
    ModelGPT4o      = "gpt-4o"
    ModelGPT4Turbo  = "gpt-4-turbo"
    ModelGPT4oMini  = "gpt-4o-mini"
    ModelO1         = "o1"
    ModelO3Mini     = "o3-mini"
)
```

**Token Counting**:
```go
// Використовуємо tiktoken для точного підрахунку
import "github.com/pkoukk/tiktoken-go"

func CountTokens(text string, model string) int {
    encoding, _ := tiktoken.EncodingForModel(model)
    tokens := encoding.Encode(text, nil, nil)
    return len(tokens)
}
```

---

### ✅ MODULE 3: MESSENGER (Месенджер)

**Файл**: `backend/internal/modules/messenger/`

**Відповідальність**:
- Direct чати (1-на-1)
- Групові чати
- Відправка повідомлень (текст, медіа)
- Real-time доставка (WebSocket)
- Редагування/видалення повідомлень
- Реакції
- Typing indicators
- Read receipts
- Пошук по повідомленнях

**API Endpoints**:
```go
// Conversations
POST   /api/messenger/conversations
GET    /api/messenger/conversations
GET    /api/messenger/conversations/:id
DELETE /api/messenger/conversations/:id

// Messages
POST   /api/messenger/conversations/:id/messages
GET    /api/messenger/conversations/:id/messages
PUT    /api/messenger/messages/:id         # Edit
DELETE /api/messenger/messages/:id         # Soft delete

// Reactions
POST   /api/messenger/messages/:id/reactions
DELETE /api/messenger/messages/:id/reactions/:emoji

// Search
GET    /api/messenger/search?q=...
```

**WebSocket Events**:
```typescript
// Client → Server
{
  type: 'message.send',
  type: 'message.edit',
  type: 'message.delete',
  type: 'reaction.add',
  type: 'reaction.remove',
  type: 'typing.start',
  type: 'typing.stop',
  type: 'read.mark'
}

// Server → Client
{
  type: 'message.new',
  type: 'message.updated',
  type: 'message.deleted',
  type: 'reaction.added',
  type: 'user.typing',
  type: 'user.online',
  type: 'user.offline'
}
```

**Database Tables**:
- `conversations` (id, type, name, avatar_url, created_by, created_at)
- `conversation_participants` (id, conversation_id, user_id, role, last_read_at)
- `messenger_messages` (id, conversation_id, sender_id, content, type, media_url, reply_to_id, is_edited, is_deleted, created_at)
- `reactions` (id, message_id, user_id, emoji, created_at)

**Dependencies**:
- WebSocket Hub
- File storage (MinIO/S3)
- Database
- Redis (online status, typing indicators)

---

### ✅ MODULE 4: CALLS (Відео/Аудіо Дзвінки)

**Файл**: `backend/internal/modules/calls/`

**Відповідальність**:
- Ініціація дзвінків (1-на-1 та групові)
- P2P з'єднання (WebRTC)
- Fallback на 100ms при P2P failure
- Signaling server (WebSocket)
- Управління станом дзвінка

**Architecture**:
```
┌──────────┐         ┌──────────┐
│  Client  │◄───P2P──►│  Client  │  (Direct connection)
└──────────┘         └──────────┘
     │                     │
     │  P2P Failed?        │
     ▼                     ▼
┌─────────────────────────────┐
│   100ms Media Server        │  (Fallback)
└─────────────────────────────┘
```

**API Endpoints**:
```go
POST   /api/calls/initiate      # Почати дзвінок
POST   /api/calls/:id/answer    # Відповісти
POST   /api/calls/:id/end       # Завершити
GET    /api/calls/:id/status    # Статус
POST   /api/calls/:id/100ms     # Створити 100ms room (fallback)
```

**WebSocket Signaling**:
```typescript
// P2P Signaling Events
{
  type: 'call.initiate',
  type: 'call.offer',      // WebRTC offer
  type: 'call.answer',     // WebRTC answer
  type: 'call.ice',        // ICE candidates
  type: 'call.reject',
  type: 'call.end',
  type: 'call.fallback'    // Switch to 100ms
}
```

**Database Tables**:
- `calls` (id, conversation_id, call_type, status, hms_room_id, started_at, ended_at, duration)
- `call_participants` (id, call_id, user_id, joined_at, left_at)

**Dependencies**:
- 100ms SDK (fallback)
- WebSocket (signaling)
- Subscription module (для перевірки лімітів хвилин)

**P2P Implementation (Frontend)**:
```typescript
import SimplePeer from 'simple-peer';

// Ініціатор
const peer = new SimplePeer({
  initiator: true,
  trickle: true,
  stream: localStream
});

peer.on('signal', (offer) => {
  ws.send({ type: 'call.offer', data: offer });
});

peer.on('stream', (remoteStream) => {
  remoteVideo.srcObject = remoteStream;
});

// Якщо P2P fails після 10 сек
setTimeout(() => {
  if (!peer.connected) {
    switchTo100ms();
  }
}, 10000);
```

**100ms Fallback**:
```go
func (s *CallService) Create100msRoom(callID uuid.UUID) (*Call, error) {
    room, err := s.hmsClient.CreateRoom(&hms.CreateRoomRequest{
        Name: fmt.Sprintf("call-%s", callID),
        Template: "video-conferencing",
    })

    // Оновити call запис
    s.db.Model(&Call{}).Where("id = ?", callID).Update("hms_room_id", room.ID)

    return call, nil
}
```

---

### ✅ MODULE 5: SUBSCRIPTION (Stripe Підписки)

**Файл**: `backend/internal/modules/subscription/`

**Відповідальність**:
- Управління підписками Stripe
- Перевірка токен-лімітів
- Скидання лімітів кожні 6 годин
- Webhook обробка від Stripe
- Upgrade/downgrade планів

**API Endpoints**:
```go
GET    /api/subscription              # Поточна підписка
POST   /api/subscription/checkout     # Створити Stripe Checkout Session
POST   /api/subscription/portal       # Stripe Customer Portal
POST   /api/subscription/cancel       # Скасувати підписку
GET    /api/subscription/usage        # Поточне використання токенів
POST   /webhook/stripe                # Stripe webhooks
```

**Database Tables**:
- `subscriptions` (id, user_id, stripe_subscription_id, plan, status, current_period_start, current_period_end)
- `token_usage` (id, user_id, tokens_used, tokens_limit, reset_at, created_at)

**Subscription Plans**:
```go
const (
    PlanBasic          = "basic"           // Free
    PlanPremiumStarter = "premium_starter" // $9.99
    PlanPremiumPro     = "premium_pro"     // $29.99
    PlanPremiumUltra   = "premium_ultra"   // $99.99
    PlanUnlimited      = "unlimited"       // $299.99
)

var TokenLimits = map[string]int{
    PlanBasic:          100_000,   // За добу
    PlanPremiumStarter: 500_000,   // Кожні 6 годин
    PlanPremiumPro:     2_000_000, // Кожні 6 годин
    PlanPremiumUltra:   5_000_000, // Кожні 6 годин
    PlanUnlimited:      -1,        // Безліміт
}
```

**Token Reset Logic**:
```go
// Cron job (кожні 6 годин)
func ResetTokenLimits(db *gorm.DB) {
    now := time.Now()

    // Знайти користувачів, чий reset_at < now
    var usages []TokenUsage
    db.Where("reset_at <= ?", now).Find(&usages)

    for _, usage := range usages {
        user := &User{}
        db.First(user, usage.UserID)

        // Скинути лічильник
        usage.TokensUsed = 0
        usage.ResetAt = now.Add(6 * time.Hour)

        db.Save(&usage)
    }
}
```

**Middleware для перевірки лімітів**:
```go
func CheckTokenLimit(estimatedTokens int) fiber.Handler {
    return func(c *fiber.Ctx) error {
        userID := c.Locals("userID").(uuid.UUID)

        usage := &TokenUsage{}
        db.Where("user_id = ?", userID).First(usage)

        // Якщо unlimited - пропустити
        if usage.TokensLimit == -1 {
            return c.Next()
        }

        // Перевірка ліміту
        if usage.TokensUsed + estimatedTokens > usage.TokensLimit {
            return c.Status(429).JSON(fiber.Map{
                "error": "Token limit exceeded",
                "limit": usage.TokensLimit,
                "used": usage.TokensUsed,
                "reset_at": usage.ResetAt,
            })
        }

        return c.Next()
    }
}
```

**Stripe Webhooks**:
```go
func (h *SubscriptionHandler) HandleWebhook(c *fiber.Ctx) error {
    payload := c.Body()
    sig := c.Get("Stripe-Signature")

    event, err := webhook.ConstructEvent(payload, sig, webhookSecret)

    switch event.Type {
    case "customer.subscription.created":
        // Оновити tier користувача
        // Встановити token limits

    case "customer.subscription.updated":
        // Оновити план

    case "customer.subscription.deleted":
        // Downgrade до Basic

    case "invoice.payment_succeeded":
        // Скинути токени (початок нового періоду)

    case "invoice.payment_failed":
        // Попередження користувача
    }

    return c.SendStatus(200)
}
```

---

## 🔜 МОДУЛІ (МАЙБУТНІ)

### 🔜 MODULE 6: TRANSLATION (Переклади)

**Файл**: `backend/internal/modules/translation/`

**Відповідальність**:
- Переклад текстів через DeepL
- Переклад документів (PDF, DOCX, тощо)
- Batch переклад для великих книжок
- Історія перекладів

**DeepL Document API**:
```go
// 1. Upload документу
func (s *TranslationService) UploadDocument(file io.Reader, sourceLang, targetLang string) (*DocumentHandle, error) {
    resp, _ := s.deeplClient.UploadDocument(file, "document.pdf", sourceLang, targetLang)
    return &DocumentHandle{
        DocumentID: resp.DocumentID,
        DocumentKey: resp.DocumentKey,
    }, nil
}

// 2. Перевірка статусу
func (s *TranslationService) CheckStatus(docID, docKey string) (*DocumentStatus, error) {
    status, _ := s.deeplClient.GetDocumentStatus(docID, docKey)
    return status, nil
}

// 3. Завантаження перекладу
func (s *TranslationService) DownloadTranslation(docID, docKey string) ([]byte, error) {
    data, _ := s.deeplClient.DownloadDocument(docID, docKey)
    return data, nil
}
```

**Стратегія для великих книг (>30MB)**:
```go
// Розбити PDF на розділи, перекласти окремо, зібрати
func (s *TranslationService) TranslateLargeBook(bookPath string) error {
    // 1. Parse PDF, витягти сторінки
    pages := extractPDFPages(bookPath)

    // 2. Групувати по 50 сторінок
    chunks := chunkPages(pages, 50)

    // 3. Batch перекладати
    var translatedChunks [][]byte
    for _, chunk := range chunks {
        translated, _ := s.UploadDocument(chunk, "EN", "UK")
        translatedChunks = append(translatedChunks, translated)
    }

    // 4. Зібрати в один PDF
    result := mergePDFs(translatedChunks)

    // 5. Зберегти в MinIO
    s.storageService.Upload(result, "translated-book.pdf")
}
```

---

### 🔜 MODULE 7: AGENTS (Кастомні AI Агенти)

**Файл**: `backend/internal/modules/agents/`

**Відповідальність**:
- Створення персональних AI агентів
- Додавання агентів в месенджер як контактів
- Function calling (n8n, make.com webhooks)
- Агенти в групових чатах

**Agent Structure**:
```go
type AIAgent struct {
    ID           uuid.UUID
    OwnerID      uuid.UUID
    Name         string
    AvatarURL    string
    SystemPrompt string
    Model        string
    Temperature  float32
    MaxTokens    int
    Functions    []AgentFunction
    IsActive     bool
}

type AgentFunction struct {
    Name         string
    Description  string
    FunctionType string // webhook | api | internal
    EndpointURL  string
    HTTPMethod   string
    Headers      map[string]string
    AuthConfig   map[string]string
}
```

**Function Calling Example**:
```go
// Виконання агента з функціями
func (s *AgentService) ExecuteAgent(agentID uuid.UUID, message string) (string, error) {
    agent := s.GetAgent(agentID)

    // OpenAI з function calling
    resp, _ := s.openaiClient.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
        Model: agent.Model,
        Messages: []openai.ChatCompletionMessage{
            {Role: "system", Content: agent.SystemPrompt},
            {Role: "user", Content: message},
        },
        Functions: agent.ConvertFunctionsToOpenAI(),
    })

    // Якщо викликана функція
    if resp.Choices[0].Message.FunctionCall != nil {
        fn := resp.Choices[0].Message.FunctionCall

        // Виконати webhook
        result := s.ExecuteWebhook(fn.Name, fn.Arguments)

        // Додати результат в контекст
        finalResp, _ := s.openaiClient.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
            Messages: append(messages, openai.ChatCompletionMessage{
                Role: "function",
                Name: fn.Name,
                Content: result,
            }),
        })

        return finalResp.Choices[0].Message.Content, nil
    }

    return resp.Choices[0].Message.Content, nil
}
```

---

## 🌐 WEBSOCKET АРХІТЕКТУРА

### Hub Pattern

```go
type Hub struct {
    clients    map[*Client]bool
    broadcast  chan *Event
    register   chan *Client
    unregister chan *Client
    rooms      map[string]map[*Client]bool // Кімнати (conversations)
}

type Client struct {
    id     uuid.UUID
    userID uuid.UUID
    hub    *Hub
    conn   *websocket.Conn
    send   chan *Event
}

type Event struct {
    Type    string      `json:"type"`
    Payload interface{} `json:"payload"`
    Room    string      `json:"room,omitempty"` // conversation_id
}
```

### Broadcast Logic

```go
func (h *Hub) Run() {
    for {
        select {
        case client := <-h.register:
            h.clients[client] = true

        case client := <-h.unregister:
            if _, ok := h.clients[client]; ok {
                delete(h.clients, client)
                close(client.send)
            }

        case event := <-h.broadcast:
            // Якщо event має room - відправити тільки в цю кімнату
            if event.Room != "" {
                for client := range h.rooms[event.Room] {
                    select {
                    case client.send <- event:
                    default:
                        close(client.send)
                        delete(h.clients, client)
                    }
                }
            } else {
                // Broadcast всім
                for client := range h.clients {
                    select {
                    case client.send <- event:
                    default:
                        close(client.send)
                        delete(h.clients, client)
                    }
                }
            }
        }
    }
}
```

---

## 🔐 MIDDLEWARE АРХІТЕКТУРА

### 1. Auth Middleware
```go
func AuthMiddleware(c *fiber.Ctx) error {
    token := c.Get("Authorization")
    claims, err := ValidateJWT(token)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
    }

    c.Locals("userID", claims.UserID)
    return c.Next()
}
```

### 2. Rate Limiting
```go
func RateLimitMiddleware(limit int, window time.Duration) fiber.Handler {
    limiter := redis_rate.NewLimiter(redisClient)

    return func(c *fiber.Ctx) error {
        key := fmt.Sprintf("ratelimit:%s", c.IP())
        res, err := limiter.Allow(ctx, key, redis_rate.PerMinute(limit))

        if res.Allowed == 0 {
            return c.Status(429).JSON(fiber.Map{
                "error": "Rate limit exceeded",
                "retry_after": res.RetryAfter,
            })
        }

        return c.Next()
    }
}
```

### 3. Subscription Tier Check
```go
func RequireTier(minTier string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        userID := c.Locals("userID").(uuid.UUID)
        user := GetUser(userID)

        if !HasTier(user.SubscriptionTier, minTier) {
            return c.Status(403).JSON(fiber.Map{
                "error": "Upgrade required",
                "required_tier": minTier,
            })
        }

        return c.Next()
    }
}
```

---

## 📊 DATABASE ARCHITECTURE

### Connection Pooling
```go
func InitDB() *gorm.DB {
    db, _ := gorm.Open(postgres.Open(os.Getenv("DATABASE_URL")), &gorm.Config{
        PrepareStmt: true, // Prepared statements
        Logger: logger.Default.LogMode(logger.Info),
    })

    sqlDB, _ := db.DB()
    sqlDB.SetMaxOpenConns(25)
    sqlDB.SetMaxIdleConns(5)
    sqlDB.SetConnMaxLifetime(5 * time.Minute)

    return db
}
```

### Migrations
```go
// Auto-migrate всі моделі
func RunMigrations(db *gorm.DB) {
    db.AutoMigrate(
        &User{},
        &Chat{},
        &ChatMessage{},
        &Conversation{},
        &MessengerMessage{},
        &Reaction{},
        &Call{},
        &Subscription{},
        &TokenUsage{},
        &AIAgent{},
    )
}
```

---

## 🚀 DEPLOYMENT STRATEGY

### Multi-Service Architecture (Railway)

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ API  │  │  WS  │
│Server│  │Server│
└───┬──┘  └──┬───┘
    │        │
    ▼        ▼
┌──────────────┐
│  PostgreSQL  │
└──────────────┘
    ▲
    │
┌───┴───┐
│ Redis │
└───────┘
```

### Service Separation

1. **API Server** (cmd/api)
   - HTTP REST endpoints
   - Stripe webhooks
   - File uploads

2. **WebSocket Server** (cmd/ws)
   - Real-time messaging
   - Call signaling
   - Typing indicators

3. **Worker** (cmd/worker) - майбутнє
   - Background jobs
   - Email sending
   - Cleanup tasks

---

**Версія**: 1.0.0
**Автор**: Kintsugi AI Team
**Дата**: 2025-01-15
