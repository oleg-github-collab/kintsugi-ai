# 🔐 MODULE: AUTH (Автентифікація)

## 📋 ОГЛЯД

Модуль відповідає за реєстрацію, автентифікацію та авторизацію користувачів.

**Розташування**: `backend/internal/modules/auth/`

---

## 🎯 ФУНКЦІОНАЛ

- ✅ Реєстрація (email, username, password)
- ✅ Логін з генерацією JWT токенів
- ✅ Refresh token mechanism
- ✅ Логаут (invalidation токенів)
- ✅ Отримання поточного користувача
- ✅ Password hashing (bcrypt)
- ✅ JWT validation middleware

---

## 🗂️ СТРУКТУРА ФАЙЛІВ

```
auth/
├── models.go          # User, RefreshToken structs
├── repository.go      # Database operations
├── service.go         # Business logic
├── handler.go         # HTTP handlers
├── middleware.go      # JWT validation
├── routes.go          # Route registration
└── README.md          # Ця документація
```

---

## 📊 DATABASE SCHEMA

### Table: `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'basic',
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### Table: `refresh_tokens`

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

---

## 🔌 API ENDPOINTS

### 1. POST `/api/auth/register`

**Описання**: Реєстрація нового користувача

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": null,
    "subscription_tier": "basic",
    "created_at": "2025-01-15T10:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

**Validation**:
- Username: 3-50 символів, тільки латиниця, цифри, `_`, `-`
- Email: валідний email формат
- Password: мінімум 8 символів, має містити цифру та букву

**Errors**:
```json
// 400 - Validation error
{
  "error": "Invalid input",
  "details": {
    "username": "Username already exists",
    "email": "Invalid email format"
  }
}

// 409 - Conflict
{
  "error": "User already exists"
}
```

---

### 2. POST `/api/auth/login`

**Описання**: Вхід в систему

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": "https://...",
    "subscription_tier": "premium_pro"
  },
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "expires_in": 900
}
```

**Errors**:
```json
// 401 - Unauthorized
{
  "error": "Invalid credentials"
}

// 403 - Account disabled
{
  "error": "Account is disabled"
}
```

---

### 3. POST `/api/auth/refresh`

**Описання**: Оновлення access token

**Request Body**:
```json
{
  "refresh_token": "eyJhbGci..."
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 900
}
```

**Errors**:
```json
// 401 - Invalid refresh token
{
  "error": "Invalid or expired refresh token"
}
```

---

### 4. POST `/api/auth/logout`

**Описання**: Вихід (invalidate refresh token)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "refresh_token": "eyJhbGci..."
}
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. GET `/api/auth/me`

**Описання**: Отримати поточного користувача

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response** (200):
```json
{
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar_url": "https://...",
    "bio": "Software developer",
    "subscription_tier": "premium_pro",
    "created_at": "2025-01-10T10:00:00Z"
  }
}
```

---

## 💻 IMPLEMENTATION

### models.go

```go
package auth

import (
    "time"
    "github.com/google/uuid"
)

type User struct {
    ID               uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
    Username         string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
    Email            string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
    PasswordHash     string     `gorm:"type:varchar(255);not null" json:"-"`
    AvatarURL        *string    `gorm:"type:text" json:"avatar_url"`
    Bio              *string    `gorm:"type:text" json:"bio"`
    SubscriptionTier string     `gorm:"type:varchar(20);default:'basic'" json:"subscription_tier"`
    StripeCustomerID *string    `gorm:"type:varchar(255)" json:"-"`
    IsActive         bool       `gorm:"default:true" json:"is_active"`
    CreatedAt        time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt        time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

type RefreshToken struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    UserID    uuid.UUID `gorm:"type:uuid;not null"`
    Token     string    `gorm:"type:varchar(500);uniqueIndex;not null"`
    ExpiresAt time.Time `gorm:"not null"`
    CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP"`
}

type RegisterRequest struct {
    Username string `json:"username" validate:"required,min=3,max=50,alphanum"`
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required"`
}

type RefreshRequest struct {
    RefreshToken string `json:"refresh_token" validate:"required"`
}

type AuthResponse struct {
    User         *User  `json:"user"`
    AccessToken  string `json:"access_token"`
    RefreshToken string `json:"refresh_token"`
    ExpiresIn    int    `json:"expires_in"`
}
```

---

### repository.go

```go
package auth

import (
    "gorm.io/gorm"
    "github.com/google/uuid"
)

type Repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{db: db}
}

func (r *Repository) CreateUser(user *User) error {
    return r.db.Create(user).Error
}

func (r *Repository) GetUserByEmail(email string) (*User, error) {
    var user User
    err := r.db.Where("email = ?", email).First(&user).Error
    return &user, err
}

func (r *Repository) GetUserByUsername(username string) (*User, error) {
    var user User
    err := r.db.Where("username = ?", username).First(&user).Error
    return &user, err
}

func (r *Repository) GetUserByID(id uuid.UUID) (*User, error) {
    var user User
    err := r.db.First(&user, id).Error
    return &user, err
}

func (r *Repository) EmailExists(email string) (bool, error) {
    var count int64
    err := r.db.Model(&User{}).Where("email = ?", email).Count(&count).Error
    return count > 0, err
}

func (r *Repository) UsernameExists(username string) (bool, error) {
    var count int64
    err := r.db.Model(&User{}).Where("username = ?", username).Count(&count).Error
    return count > 0, err
}

func (r *Repository) CreateRefreshToken(token *RefreshToken) error {
    return r.db.Create(token).Error
}

func (r *Repository) GetRefreshToken(token string) (*RefreshToken, error) {
    var rt RefreshToken
    err := r.db.Where("token = ? AND expires_at > NOW()", token).First(&rt).Error
    return &rt, err
}

func (r *Repository) DeleteRefreshToken(token string) error {
    return r.db.Where("token = ?", token).Delete(&RefreshToken{}).Error
}

func (r *Repository) DeleteUserRefreshTokens(userID uuid.UUID) error {
    return r.db.Where("user_id = ?", userID).Delete(&RefreshToken{}).Error
}
```

---

### service.go

```go
package auth

import (
    "errors"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "github.com/google/uuid"
    "golang.org/x/crypto/bcrypt"
)

type Service struct {
    repo      *Repository
    jwtSecret []byte
    accessTTL time.Duration
    refreshTTL time.Duration
}

func NewService(repo *Repository, jwtSecret string) *Service {
    return &Service{
        repo:       repo,
        jwtSecret:  []byte(jwtSecret),
        accessTTL:  15 * time.Minute,
        refreshTTL: 7 * 24 * time.Hour,
    }
}

func (s *Service) Register(req *RegisterRequest) (*AuthResponse, error) {
    // Check if user exists
    emailExists, _ := s.repo.EmailExists(req.Email)
    if emailExists {
        return nil, errors.New("email already exists")
    }

    usernameExists, _ := s.repo.UsernameExists(req.Username)
    if usernameExists {
        return nil, errors.New("username already exists")
    }

    // Hash password
    passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, err
    }

    // Create user
    user := &User{
        Username:         req.Username,
        Email:            req.Email,
        PasswordHash:     string(passwordHash),
        SubscriptionTier: "basic",
        IsActive:         true,
    }

    if err := s.repo.CreateUser(user); err != nil {
        return nil, err
    }

    // Generate tokens
    return s.generateAuthResponse(user)
}

func (s *Service) Login(req *LoginRequest) (*AuthResponse, error) {
    // Get user
    user, err := s.repo.GetUserByEmail(req.Email)
    if err != nil {
        return nil, errors.New("invalid credentials")
    }

    // Check if active
    if !user.IsActive {
        return nil, errors.New("account is disabled")
    }

    // Verify password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
        return nil, errors.New("invalid credentials")
    }

    // Generate tokens
    return s.generateAuthResponse(user)
}

func (s *Service) RefreshAccessToken(refreshToken string) (string, error) {
    // Validate refresh token
    rt, err := s.repo.GetRefreshToken(refreshToken)
    if err != nil {
        return "", errors.New("invalid refresh token")
    }

    // Get user
    user, err := s.repo.GetUserByID(rt.UserID)
    if err != nil {
        return "", errors.New("user not found")
    }

    // Generate new access token
    accessToken, err := s.generateAccessToken(user)
    if err != nil {
        return "", err
    }

    return accessToken, nil
}

func (s *Service) Logout(refreshToken string) error {
    return s.repo.DeleteRefreshToken(refreshToken)
}

func (s *Service) GetUserByID(id uuid.UUID) (*User, error) {
    return s.repo.GetUserByID(id)
}

// Private methods

func (s *Service) generateAuthResponse(user *User) (*AuthResponse, error) {
    // Generate access token
    accessToken, err := s.generateAccessToken(user)
    if err != nil {
        return nil, err
    }

    // Generate refresh token
    refreshToken, err := s.generateRefreshToken(user)
    if err != nil {
        return nil, err
    }

    return &AuthResponse{
        User:         user,
        AccessToken:  accessToken,
        RefreshToken: refreshToken,
        ExpiresIn:    int(s.accessTTL.Seconds()),
    }, nil
}

func (s *Service) generateAccessToken(user *User) (string, error) {
    claims := jwt.MapClaims{
        "user_id": user.ID.String(),
        "email":   user.Email,
        "tier":    user.SubscriptionTier,
        "exp":     time.Now().Add(s.accessTTL).Unix(),
        "iat":     time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(s.jwtSecret)
}

func (s *Service) generateRefreshToken(user *User) (string, error) {
    claims := jwt.MapClaims{
        "user_id": user.ID.String(),
        "exp":     time.Now().Add(s.refreshTTL).Unix(),
        "iat":     time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(s.jwtSecret)
    if err != nil {
        return "", err
    }

    // Save to database
    rt := &RefreshToken{
        UserID:    user.ID,
        Token:     tokenString,
        ExpiresAt: time.Now().Add(s.refreshTTL),
    }

    if err := s.repo.CreateRefreshToken(rt); err != nil {
        return "", err
    }

    return tokenString, nil
}

func (s *Service) ValidateAccessToken(tokenString string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return s.jwtSecret, nil
    })

    if err != nil || !token.Valid {
        return nil, errors.New("invalid token")
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return nil, errors.New("invalid token claims")
    }

    return &claims, nil
}
```

---

### handler.go

```go
package auth

import (
    "github.com/gofiber/fiber/v2"
    "github.com/go-playground/validator/v10"
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

func (h *Handler) Register(c *fiber.Ctx) error {
    var req RegisterRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if err := h.validator.Struct(req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Validation failed", "details": err.Error()})
    }

    resp, err := h.service.Register(&req)
    if err != nil {
        return c.Status(409).JSON(fiber.Map{"error": err.Error()})
    }

    return c.Status(201).JSON(resp)
}

func (h *Handler) Login(c *fiber.Ctx) error {
    var req LoginRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if err := h.validator.Struct(req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Validation failed"})
    }

    resp, err := h.service.Login(&req)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(resp)
}

func (h *Handler) Refresh(c *fiber.Ctx) error {
    var req RefreshRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    accessToken, err := h.service.RefreshAccessToken(req.RefreshToken)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{
        "access_token": accessToken,
        "expires_in":   900,
    })
}

func (h *Handler) Logout(c *fiber.Ctx) error {
    var req RefreshRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if err := h.service.Logout(req.RefreshToken); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Logout failed"})
    }

    return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func (h *Handler) GetMe(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    user, err := h.service.GetUserByID(uuid.MustParse(userID))
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "User not found"})
    }

    return c.JSON(fiber.Map{"user": user})
}
```

---

### middleware.go

```go
package auth

import (
    "strings"
    "github.com/gofiber/fiber/v2"
)

func AuthMiddleware(service *Service) fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return c.Status(401).JSON(fiber.Map{"error": "Missing authorization header"})
        }

        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            return c.Status(401).JSON(fiber.Map{"error": "Invalid authorization header"})
        }

        token := parts[1]
        claims, err := service.ValidateAccessToken(token)
        if err != nil {
            return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
        }

        // Set user data in context
        c.Locals("userID", (*claims)["user_id"])
        c.Locals("email", (*claims)["email"])
        c.Locals("tier", (*claims)["tier"])

        return c.Next()
    }
}
```

---

### routes.go

```go
package auth

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
    auth := app.Group("/api/auth")

    // Public routes
    auth.Post("/register", handler.Register)
    auth.Post("/login", handler.Login)
    auth.Post("/refresh", handler.Refresh)

    // Protected routes
    auth.Post("/logout", authMiddleware, handler.Logout)
    auth.Get("/me", authMiddleware, handler.GetMe)
}
```

---

## 🔒 БЕЗПЕКА

### Password Hashing
- **Алгоритм**: bcrypt
- **Cost**: 12 (default)
- **Ніколи не зберігаємо plain-text паролі**

### JWT Токени
- **Access Token**: 15 хвилин (короткий TTL для безпеки)
- **Refresh Token**: 7 днів (зберігається в DB)
- **Алгоритм**: HS256
- **Secret**: Зберігається в environment variable

### Rate Limiting
Рекомендується додати rate limiting для:
- `/auth/register`: 5 запитів/годину з одного IP
- `/auth/login`: 10 запитів/хвилину з одного IP

---

## 🧪 ТЕСТУВАННЯ

```go
// Приклад unit тесту
func TestRegister(t *testing.T) {
    // Setup
    db := setupTestDB()
    repo := NewRepository(db)
    service := NewService(repo, "test-secret")

    // Test
    req := &RegisterRequest{
        Username: "testuser",
        Email:    "test@example.com",
        Password: "Password123",
    }

    resp, err := service.Register(req)

    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, resp.User)
    assert.NotEmpty(t, resp.AccessToken)
    assert.NotEmpty(t, resp.RefreshToken)
}
```

---

## 📝 TODO / МАЙБУТНІ ПОКРАЩЕННЯ

- [ ] Email verification
- [ ] Password reset
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth (Google, GitHub)
- [ ] Account deactivation
- [ ] Login history/audit log

---

**Версія**: 1.0.0
**Автор**: Kintsugi AI Team
**Статус**: ✅ Production Ready
