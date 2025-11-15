package auth

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID               uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Username         string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email            string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash     string         `gorm:"type:varchar(255);not null" json:"-"`
	SubscriptionTier string         `gorm:"type:varchar(20);default:'basic'" json:"subscription_tier"`
	TokensUsed       int64          `gorm:"default:0" json:"tokens_used"`
	TokensLimit      int64          `gorm:"default:100000" json:"tokens_limit"`
	ResetAt          time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"reset_at"`
	StripeCustomerID string         `gorm:"type:varchar(255)" json:"stripe_customer_id,omitempty"`
	CreatedAt        time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Token     string    `gorm:"type:varchar(500);uniqueIndex;not null" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	User      User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
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
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         *UserDTO  `json:"user"`
}

type UserDTO struct {
	ID               uuid.UUID `json:"id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	SubscriptionTier string    `json:"subscription_tier"`
	TokensUsed       int64     `json:"tokens_used"`
	TokensLimit      int64     `json:"tokens_limit"`
	ResetAt          time.Time `json:"reset_at"`
	CreatedAt        time.Time `json:"created_at"`
}

func (u *User) ToDTO() *UserDTO {
	return &UserDTO{
		ID:               u.ID,
		Username:         u.Username,
		Email:            u.Email,
		SubscriptionTier: u.SubscriptionTier,
		TokensUsed:       u.TokensUsed,
		TokensLimit:      u.TokensLimit,
		ResetAt:          u.ResetAt,
		CreatedAt:        u.CreatedAt,
	}
}
