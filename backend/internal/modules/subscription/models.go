package subscription

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Subscription struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID             uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex" json:"user_id"`
	StripeSubscriptionID string       `gorm:"type:varchar(255);uniqueIndex" json:"stripe_subscription_id"`
	StripePriceID      string         `gorm:"type:varchar(255)" json:"stripe_price_id"`
	Tier               string         `gorm:"type:varchar(50);not null" json:"tier"`
	Status             string         `gorm:"type:varchar(20);not null" json:"status"` // active, canceled, past_due, unpaid
	CurrentPeriodStart time.Time      `json:"current_period_start"`
	CurrentPeriodEnd   time.Time      `json:"current_period_end"`
	CancelAtPeriodEnd  bool           `gorm:"default:false" json:"cancel_at_period_end"`
	CreatedAt          time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

type Payment struct {
	ID                uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID            uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	StripePaymentID   string    `gorm:"type:varchar(255);uniqueIndex" json:"stripe_payment_id"`
	Amount            int64     `gorm:"not null" json:"amount"` // Amount in cents
	Currency          string    `gorm:"type:varchar(3);default:'usd'" json:"currency"`
	Status            string    `gorm:"type:varchar(20);not null" json:"status"` // succeeded, pending, failed
	Description       string    `gorm:"type:text" json:"description"`
	CreatedAt         time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

type SubscriptionPlan struct {
	Tier          string `json:"tier"`
	Name          string `json:"name"`
	PriceMonthly  int64  `json:"price_monthly"` // in cents
	TokensLimit   int64  `json:"tokens_limit"`  // -1 for unlimited
	ResetInterval string `json:"reset_interval"` // "6h"
	Features      []string `json:"features"`
	StripePriceID string `json:"stripe_price_id,omitempty"`
}

type CreateCheckoutSessionRequest struct {
	PriceID    string `json:"price_id" validate:"required"`
	SuccessURL string `json:"success_url" validate:"required"`
	CancelURL  string `json:"cancel_url" validate:"required"`
}

type CreatePortalSessionRequest struct {
	ReturnURL string `json:"return_url" validate:"required"`
}

type WebhookEvent struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}
