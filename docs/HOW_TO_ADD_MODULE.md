# 🔧 ЯК ДОДАТИ НОВИЙ МОДУЛЬ

## 📋 ПОКРОКОВИЙ ГАЙД

Цей документ пояснює, як додати новий модуль до Kintsugi AI платформи.

---

## 🎯 ПРИКЛАД: Додаємо модуль NOTIFICATIONS

### Крок 1: Створити структуру каталогів

```bash
cd backend/internal/modules
mkdir notifications
cd notifications
```

### Крок 2: Створити файли модуля

```bash
touch models.go
touch repository.go
touch service.go
touch handler.go
touch middleware.go  # (опціонально)
touch routes.go
touch README.md
```

---

## 📝 КРОК 3: НАПИСАТИ КОД

### models.go

**Призначення**: Структури даних, request/response моделі

```go
package notifications

import (
    "time"
    "github.com/google/uuid"
)

// Database model
type Notification struct {
    ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
    UserID    uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
    Type      string     `gorm:"type:varchar(50);not null" json:"type"` // message | call | mention | system
    Title     string     `gorm:"type:varchar(255);not null" json:"title"`
    Content   string     `gorm:"type:text" json:"content"`
    Data      string     `gorm:"type:jsonb" json:"data"` // Додаткові дані (JSON)
    IsRead    bool       `gorm:"default:false" json:"is_read"`
    ReadAt    *time.Time `json:"read_at,omitempty"`
    CreatedAt time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// Request models
type CreateNotificationRequest struct {
    UserID  uuid.UUID              `json:"user_id" validate:"required"`
    Type    string                 `json:"type" validate:"required,oneof=message call mention system"`
    Title   string                 `json:"title" validate:"required,max=255"`
    Content string                 `json:"content"`
    Data    map[string]interface{} `json:"data"`
}

type MarkAsReadRequest struct {
    NotificationIDs []uuid.UUID `json:"notification_ids" validate:"required"`
}

// Response models
type NotificationResponse struct {
    Notification *Notification `json:"notification"`
}

type NotificationsListResponse struct {
    Notifications []*Notification `json:"notifications"`
    Total         int64           `json:"total"`
    Unread        int64           `json:"unread"`
}
```

---

### repository.go

**Призначення**: Database операції (CRUD)

```go
package notifications

import (
    "time"
    "gorm.io/gorm"
    "github.com/google/uuid"
)

type Repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{db: db}
}

// Create new notification
func (r *Repository) Create(notification *Notification) error {
    return r.db.Create(notification).Error
}

// Get notification by ID
func (r *Repository) GetByID(id uuid.UUID) (*Notification, error) {
    var notification Notification
    err := r.db.First(&notification, id).Error
    return &notification, err
}

// Get user's notifications (with pagination)
func (r *Repository) GetByUserID(userID uuid.UUID, limit, offset int) ([]*Notification, int64, error) {
    var notifications []*Notification
    var total int64

    // Count total
    r.db.Model(&Notification{}).Where("user_id = ?", userID).Count(&total)

    // Get paginated
    err := r.db.Where("user_id = ?", userID).
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&notifications).Error

    return notifications, total, err
}

// Get unread count
func (r *Repository) GetUnreadCount(userID uuid.UUID) (int64, error) {
    var count int64
    err := r.db.Model(&Notification{}).
        Where("user_id = ? AND is_read = false", userID).
        Count(&count).Error
    return count, err
}

// Mark as read
func (r *Repository) MarkAsRead(ids []uuid.UUID) error {
    return r.db.Model(&Notification{}).
        Where("id IN ?", ids).
        Updates(map[string]interface{}{
            "is_read": true,
            "read_at": time.Now(),
        }).Error
}

// Mark all as read for user
func (r *Repository) MarkAllAsRead(userID uuid.UUID) error {
    return r.db.Model(&Notification{}).
        Where("user_id = ? AND is_read = false", userID).
        Updates(map[string]interface{}{
            "is_read": true,
            "read_at": time.Now(),
        }).Error
}

// Delete notification
func (r *Repository) Delete(id uuid.UUID) error {
    return r.db.Delete(&Notification{}, id).Error
}

// Delete old notifications (cleanup)
func (r *Repository) DeleteOlderThan(days int) error {
    cutoff := time.Now().AddDate(0, 0, -days)
    return r.db.Where("created_at < ? AND is_read = true", cutoff).
        Delete(&Notification{}).Error
}
```

---

### service.go

**Призначення**: Бізнес-логіка

```go
package notifications

import (
    "encoding/json"
    "errors"
    "github.com/google/uuid"
)

type Service struct {
    repo *Repository
    // Додаткові залежності (наприклад, WebSocket hub для real-time)
    // hub *websocket.Hub
}

func NewService(repo *Repository) *Service {
    return &Service{
        repo: repo,
    }
}

// Create notification
func (s *Service) CreateNotification(req *CreateNotificationRequest) (*Notification, error) {
    // Convert data map to JSON
    dataJSON, err := json.Marshal(req.Data)
    if err != nil {
        return nil, err
    }

    notification := &Notification{
        UserID:  req.UserID,
        Type:    req.Type,
        Title:   req.Title,
        Content: req.Content,
        Data:    string(dataJSON),
        IsRead:  false,
    }

    if err := s.repo.Create(notification); err != nil {
        return nil, err
    }

    // TODO: Відправити через WebSocket для real-time
    // s.hub.SendToUser(req.UserID, "notification.new", notification)

    return notification, nil
}

// Get user's notifications
func (s *Service) GetUserNotifications(userID uuid.UUID, page, pageSize int) (*NotificationsListResponse, error) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }

    offset := (page - 1) * pageSize

    notifications, total, err := s.repo.GetByUserID(userID, pageSize, offset)
    if err != nil {
        return nil, err
    }

    unread, err := s.repo.GetUnreadCount(userID)
    if err != nil {
        return nil, err
    }

    return &NotificationsListResponse{
        Notifications: notifications,
        Total:         total,
        Unread:        unread,
    }, nil
}

// Mark notifications as read
func (s *Service) MarkAsRead(ids []uuid.UUID) error {
    if len(ids) == 0 {
        return errors.New("no notification IDs provided")
    }

    return s.repo.MarkAsRead(ids)
}

// Mark all as read
func (s *Service) MarkAllAsRead(userID uuid.UUID) error {
    return s.repo.MarkAllAsRead(userID)
}

// Delete notification
func (s *Service) DeleteNotification(id uuid.UUID, userID uuid.UUID) error {
    // Verify ownership
    notification, err := s.repo.GetByID(id)
    if err != nil {
        return err
    }

    if notification.UserID != userID {
        return errors.New("unauthorized")
    }

    return s.repo.Delete(id)
}

// Get unread count
func (s *Service) GetUnreadCount(userID uuid.UUID) (int64, error) {
    return s.repo.GetUnreadCount(userID)
}

// Helper: Send notification to user
func (s *Service) NotifyUser(userID uuid.UUID, notificationType, title, content string, data map[string]interface{}) error {
    req := &CreateNotificationRequest{
        UserID:  userID,
        Type:    notificationType,
        Title:   title,
        Content: content,
        Data:    data,
    }

    _, err := s.CreateNotification(req)
    return err
}
```

---

### handler.go

**Призначення**: HTTP handlers

```go
package notifications

import (
    "github.com/gofiber/fiber/v2"
    "github.com/go-playground/validator/v10"
    "github.com/google/uuid"
    "strconv"
)

type Handler struct {
    service   *Service
    validator *validator.Validate
}

func NewHandler(service *Service) *Handler {
    return &Handler{
        service:   service,
        validator: validator.New(),
    }
}

// GET /api/notifications
func (h *Handler) GetNotifications(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    // Pagination
    page, _ := strconv.Atoi(c.Query("page", "1"))
    pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))

    resp, err := h.service.GetUserNotifications(uuid.MustParse(userID), page, pageSize)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(resp)
}

// GET /api/notifications/unread-count
func (h *Handler) GetUnreadCount(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    count, err := h.service.GetUnreadCount(uuid.MustParse(userID))
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"unread_count": count})
}

// POST /api/notifications/:id/read
func (h *Handler) MarkAsRead(c *fiber.Ctx) error {
    notificationID := c.Params("id")

    ids := []uuid.UUID{uuid.MustParse(notificationID)}
    if err := h.service.MarkAsRead(ids); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"message": "Marked as read"})
}

// POST /api/notifications/mark-read
func (h *Handler) MarkMultipleAsRead(c *fiber.Ctx) error {
    var req MarkAsReadRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if err := h.validator.Struct(req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Validation failed"})
    }

    if err := h.service.MarkAsRead(req.NotificationIDs); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"message": "Marked as read"})
}

// POST /api/notifications/mark-all-read
func (h *Handler) MarkAllAsRead(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    if err := h.service.MarkAllAsRead(uuid.MustParse(userID)); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"message": "All marked as read"})
}

// DELETE /api/notifications/:id
func (h *Handler) DeleteNotification(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)
    notificationID := c.Params("id")

    if err := h.service.DeleteNotification(uuid.MustParse(notificationID), uuid.MustParse(userID)); err != nil {
        return c.Status(403).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"message": "Notification deleted"})
}
```

---

### routes.go

**Призначення**: Реєстрація маршрутів

```go
package notifications

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
    notifications := app.Group("/api/notifications", authMiddleware)

    notifications.Get("/", handler.GetNotifications)
    notifications.Get("/unread-count", handler.GetUnreadCount)
    notifications.Post("/:id/read", handler.MarkAsRead)
    notifications.Post("/mark-read", handler.MarkMultipleAsRead)
    notifications.Post("/mark-all-read", handler.MarkAllAsRead)
    notifications.Delete("/:id", handler.DeleteNotification)
}
```

---

## 🗄️ КРОК 4: DATABASE MIGRATION

Створити міграцію:

```bash
cd backend/migrations
touch 006_notifications.up.sql
```

**006_notifications.up.sql**:
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes для швидкості
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

## 🔌 КРОК 5: ПІДКЛЮЧИТИ В MAIN.GO

**backend/cmd/api/main.go**:

```go
package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/kintsugi-ai/backend/internal/modules/auth"
    "github.com/kintsugi-ai/backend/internal/modules/notifications"  // ← Додати
    "github.com/kintsugi-ai/backend/internal/database"
)

func main() {
    app := fiber.New()
    db := database.Connect()

    // AUTH module
    authRepo := auth.NewRepository(db)
    authService := auth.NewService(authRepo, "jwt-secret")
    authHandler := auth.NewHandler(authService)
    authMiddleware := auth.AuthMiddleware(authService)
    auth.RegisterRoutes(app, authHandler, authMiddleware)

    // NOTIFICATIONS module ← ДОДАТИ
    notificationsRepo := notifications.NewRepository(db)
    notificationsService := notifications.NewService(notificationsRepo)
    notificationsHandler := notifications.NewHandler(notificationsService)
    notifications.RegisterRoutes(app, notificationsHandler, authMiddleware)

    app.Listen(":8080")
}
```

---

## 📖 КРОК 6: ДОКУМЕНТАЦІЯ

**backend/internal/modules/notifications/README.md**:

```markdown
# MODULE: NOTIFICATIONS

## Огляд
Модуль для управління сповіщеннями користувачів.

## API Endpoints

### GET /api/notifications
Отримати список сповіщень користувача

**Query Params**:
- page (default: 1)
- page_size (default: 20, max: 100)

**Response**:
```json
{
  "notifications": [...],
  "total": 145,
  "unread": 12
}
```

### GET /api/notifications/unread-count
Кількість непрочитаних

### POST /api/notifications/:id/read
Позначити як прочитане

### POST /api/notifications/mark-read
Позначити кілька як прочитані

### POST /api/notifications/mark-all-read
Позначити всі як прочитані

### DELETE /api/notifications/:id
Видалити сповіщення

## Використання в інших модулях

```go
// Приклад: Надіслати сповіщення про нове повідомлення
notificationsService.NotifyUser(
    recipientID,
    "message",
    "New message from John",
    "Hey, how are you?",
    map[string]interface{}{
        "conversation_id": conversationID,
        "sender_id": senderID,
    },
)
```
```

---

## 🧪 КРОК 7: ТЕСТУВАННЯ

**backend/internal/modules/notifications/service_test.go**:

```go
package notifications

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestCreateNotification(t *testing.T) {
    // Setup
    db := setupTestDB()
    repo := NewRepository(db)
    service := NewService(repo)

    // Test
    req := &CreateNotificationRequest{
        UserID:  uuid.New(),
        Type:    "message",
        Title:   "Test notification",
        Content: "Test content",
        Data:    map[string]interface{}{"key": "value"},
    }

    notification, err := service.CreateNotification(req)

    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, notification)
    assert.Equal(t, "message", notification.Type)
}
```

---

## ✅ CHECKLIST

Перед тим як вважати модуль готовим:

- [ ] **models.go** створений
- [ ] **repository.go** створений
- [ ] **service.go** створений
- [ ] **handler.go** створений
- [ ] **routes.go** створений
- [ ] **README.md** написаний
- [ ] **Migration** створена та виконана
- [ ] **Підключено в main.go**
- [ ] **Tests** написані
- [ ] **Документація** оновлена в docs/

---

## 🔗 DEPENDENCY MANAGEMENT

### Якщо модуль залежить від іншого модуля:

```go
// Приклад: NOTIFICATIONS залежить від MESSENGER

package notifications

import (
    "github.com/kintsugi-ai/backend/internal/modules/messenger"
)

type Service struct {
    repo              *Repository
    messengerService  *messenger.Service  // ← Dependency
}

func NewService(repo *Repository, messengerService *messenger.Service) *Service {
    return &Service{
        repo:             repo,
        messengerService: messengerService,
    }
}
```

**В main.go**:
```go
// Спочатку ініціалізувати MESSENGER
messengerService := messenger.NewService(...)

// Потім NOTIFICATIONS (передати залежність)
notificationsService := notifications.NewService(notificationsRepo, messengerService)
```

---

## 🎯 BEST PRACTICES

### 1. Іменування
- Package name: lowercase, singular (notifications, не Notifications)
- Structs: PascalCase (NotificationService)
- Functions: PascalCase для exported (CreateNotification)
- Variables: camelCase (notificationID)

### 2. Error Handling
```go
// Good ✅
if err != nil {
    return nil, fmt.Errorf("failed to create notification: %w", err)
}

// Bad ❌
if err != nil {
    return nil, err  // No context
}
```

### 3. Validation
Завжди валідувати input:
```go
if err := h.validator.Struct(req); err != nil {
    return c.Status(400).JSON(fiber.Map{"error": "Validation failed"})
}
```

### 4. Transactions
Для операцій, що змінюють кілька таблиць:
```go
tx := r.db.Begin()

if err := tx.Create(&notification).Error; err != nil {
    tx.Rollback()
    return err
}

if err := tx.Create(&relatedRecord).Error; err != nil {
    tx.Rollback()
    return err
}

tx.Commit()
```

---

## 📚 ПРИКЛАДИ МОДУЛІВ

### Простий модуль (тільки CRUD):
- NOTIFICATIONS (цей приклад)
- TAGS
- FAVORITES

### Модуль з бізнес-логікою:
- AUTH (password hashing, JWT)
- SUBSCRIPTION (Stripe, limits)
- CHAT (OpenAI, streaming)

### Модуль з real-time:
- MESSENGER (WebSocket)
- CALLS (WebRTC signaling)

---

## 🚀 ШВИДКИЙ TEMPLATE

Для швидкого створення модуля:

```bash
#!/bin/bash
# create-module.sh

MODULE_NAME=$1

mkdir -p backend/internal/modules/$MODULE_NAME
cd backend/internal/modules/$MODULE_NAME

cat > models.go << EOF
package $MODULE_NAME

import (
    "time"
    "github.com/google/uuid"
)

type ${MODULE_NAME^} struct {
    ID        uuid.UUID \`gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"\`
    CreatedAt time.Time \`gorm:"default:CURRENT_TIMESTAMP" json:"created_at"\`
    UpdatedAt time.Time \`gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"\`
}
EOF

cat > repository.go << EOF
package $MODULE_NAME

import "gorm.io/gorm"

type Repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{db: db}
}
EOF

cat > service.go << EOF
package $MODULE_NAME

type Service struct {
    repo *Repository
}

func NewService(repo *Repository) *Service {
    return &Service{repo: repo}
}
EOF

cat > handler.go << EOF
package $MODULE_NAME

import "github.com/gofiber/fiber/v2"

type Handler struct {
    service *Service
}

func NewHandler(service *Service) *Handler {
    return &Handler{service: service}
}
EOF

cat > routes.go << EOF
package $MODULE_NAME

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
    group := app.Group("/api/$MODULE_NAME", authMiddleware)
    // Add routes here
}
EOF

cat > README.md << EOF
# MODULE: ${MODULE_NAME^^}

## TODO
- Add documentation
EOF

echo "Module $MODULE_NAME created!"
```

**Використання**:
```bash
chmod +x create-module.sh
./create-module.sh notifications
```

---

**Тепер ви можете легко додавати нові модулі до Kintsugi AI!** 🚀
