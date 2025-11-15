package subscription

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Subscriptions

func (r *Repository) CreateSubscription(subscription *Subscription) error {
	return r.db.Create(subscription).Error
}

func (r *Repository) GetSubscriptionByUserID(userID uuid.UUID) (*Subscription, error) {
	var subscription Subscription
	err := r.db.Where("user_id = ?", userID).First(&subscription).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("subscription not found")
		}
		return nil, err
	}
	return &subscription, nil
}

func (r *Repository) GetSubscriptionByStripeID(stripeSubscriptionID string) (*Subscription, error) {
	var subscription Subscription
	err := r.db.Where("stripe_subscription_id = ?", stripeSubscriptionID).First(&subscription).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("subscription not found")
		}
		return nil, err
	}
	return &subscription, nil
}

func (r *Repository) UpdateSubscription(subscription *Subscription) error {
	return r.db.Save(subscription).Error
}

func (r *Repository) DeleteSubscription(userID uuid.UUID) error {
	return r.db.Where("user_id = ?", userID).Delete(&Subscription{}).Error
}

// Payments

func (r *Repository) CreatePayment(payment *Payment) error {
	return r.db.Create(payment).Error
}

func (r *Repository) GetUserPayments(userID uuid.UUID, limit, offset int) ([]Payment, error) {
	var payments []Payment
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&payments).Error

	return payments, err
}

// User updates

func (r *Repository) UpdateUserSubscriptionTier(userID uuid.UUID, tier string, tokensLimit int64) error {
	return r.db.Table("users").
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"subscription_tier": tier,
			"tokens_limit":      tokensLimit,
		}).Error
}

func (r *Repository) UpdateUserStripeCustomerID(userID uuid.UUID, stripeCustomerID string) error {
	return r.db.Table("users").
		Where("id = ?", userID).
		Update("stripe_customer_id", stripeCustomerID).Error
}
