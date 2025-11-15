package subscription

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
	"github.com/stripe/stripe-go/v76/billingportal/session"
	portalsession "github.com/stripe/stripe-go/v76/billingportal/session"
	"gorm.io/gorm"
)

type Service struct {
	repo  *Repository
	db    *gorm.DB
	plans map[string]*SubscriptionPlan
}

func NewService(repo *Repository, db *gorm.DB) *Service {
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey != "" {
		stripe.Key = stripeKey
	}

	// Initialize subscription plans
	plans := map[string]*SubscriptionPlan{
		"basic": {
			Tier:          "basic",
			Name:          "Basic",
			PriceMonthly:  0,
			TokensLimit:   getEnvInt64("BASIC_TOKEN_LIMIT", 100000),
			ResetInterval: "6h",
			Features: []string{
				"Simple text chat",
				"Basic tasks",
				"100k tokens every 6 hours",
			},
		},
		"premium_starter": {
			Tier:          "premium_starter",
			Name:          "Premium Starter",
			PriceMonthly:  999, // $9.99
			TokensLimit:   getEnvInt64("PREMIUM_STARTER_TOKEN_LIMIT", 500000),
			ResetInterval: "6h",
			Features: []string{
				"500k tokens every 6 hours",
				"Coding assistance",
				"1 AI agent",
				"100 minutes video/audio calls",
			},
			StripePriceID: os.Getenv("STRIPE_PRICE_PREMIUM_STARTER"),
		},
		"premium_pro": {
			Tier:          "premium_pro",
			Name:          "Premium Pro",
			PriceMonthly:  2999, // $29.99
			TokensLimit:   getEnvInt64("PREMIUM_PRO_TOKEN_LIMIT", 2000000),
			ResetInterval: "6h",
			Features: []string{
				"2M tokens every 6 hours",
				"All AI models",
				"10 AI agents",
				"500 minutes video/audio calls",
			},
			StripePriceID: os.Getenv("STRIPE_PRICE_PREMIUM_PRO"),
		},
		"premium_ultra": {
			Tier:          "premium_ultra",
			Name:          "Premium Ultra",
			PriceMonthly:  9999, // $99.99
			TokensLimit:   getEnvInt64("PREMIUM_ULTRA_TOKEN_LIMIT", 5000000),
			ResetInterval: "6h",
			Features: []string{
				"5M tokens every 6 hours",
				"Unlimited AI agents",
				"Unlimited video/audio calls",
				"Priority support",
			},
			StripePriceID: os.Getenv("STRIPE_PRICE_PREMIUM_ULTRA"),
		},
		"unlimited": {
			Tier:          "unlimited",
			Name:          "Unlimited",
			PriceMonthly:  29999, // $299.99
			TokensLimit:   -1,    // Unlimited
			ResetInterval: "6h",
			Features: []string{
				"Unlimited tokens",
				"Early access to features",
				"Full AI power",
				"Website & app creation",
				"Complex workflows",
				"Dedicated support",
			},
			StripePriceID: os.Getenv("STRIPE_PRICE_UNLIMITED"),
		},
	}

	return &Service{
		repo:  repo,
		db:    db,
		plans: plans,
	}
}

func getEnvInt64(key string, defaultValue int64) int64 {
	val := os.Getenv(key)
	if val == "" {
		return defaultValue
	}
	intVal, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		return defaultValue
	}
	return intVal
}

func (s *Service) GetPlans() []*SubscriptionPlan {
	plans := make([]*SubscriptionPlan, 0, len(s.plans))
	for _, plan := range s.plans {
		plans = append(plans, plan)
	}
	return plans
}

func (s *Service) GetUserSubscription(userID uuid.UUID) (*Subscription, error) {
	return s.repo.GetSubscriptionByUserID(userID)
}

func (s *Service) CreateCheckoutSession(userID uuid.UUID, req *CreateCheckoutSessionRequest) (string, error) {
	// Get or create Stripe customer
	var user struct {
		Email            string
		StripeCustomerID string
	}

	err := s.db.Table("users").
		Where("id = ?", userID).
		Select("email, stripe_customer_id").
		Scan(&user).Error

	if err != nil {
		return "", err
	}

	var customerID string
	if user.StripeCustomerID != "" {
		customerID = user.StripeCustomerID
	} else {
		// Create Stripe customer
		params := &stripe.CustomerParams{
			Email: stripe.String(user.Email),
			Metadata: map[string]string{
				"user_id": userID.String(),
			},
		}

		cust, err := customer.New(params)
		if err != nil {
			return "", fmt.Errorf("failed to create Stripe customer: %w", err)
		}

		customerID = cust.ID
		s.repo.UpdateUserStripeCustomerID(userID, customerID)
	}

	// Create checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(req.PriceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(req.SuccessURL),
		CancelURL:  stripe.String(req.CancelURL),
		Metadata: map[string]string{
			"user_id": userID.String(),
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create checkout session: %w", err)
	}

	return sess.URL, nil
}

func (s *Service) CreatePortalSession(userID uuid.UUID, req *CreatePortalSessionRequest) (string, error) {
	var user struct {
		StripeCustomerID string
	}

	err := s.db.Table("users").
		Where("id = ?", userID).
		Select("stripe_customer_id").
		Scan(&user).Error

	if err != nil {
		return "", err
	}

	if user.StripeCustomerID == "" {
		return "", errors.New("no Stripe customer ID found")
	}

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(user.StripeCustomerID),
		ReturnURL: stripe.String(req.ReturnURL),
	}

	sess, err := portalsession.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create portal session: %w", err)
	}

	return sess.URL, nil
}

func (s *Service) HandleSubscriptionCreated(stripeSubscription *stripe.Subscription) error {
	userID, err := uuid.Parse(stripeSubscription.Metadata["user_id"])
	if err != nil {
		return fmt.Errorf("invalid user_id in metadata: %w", err)
	}

	// Determine tier from price ID
	tier := s.getTierFromPriceID(stripeSubscription.Items.Data[0].Price.ID)
	plan, ok := s.plans[tier]
	if !ok {
		return errors.New("unknown subscription tier")
	}

	subscription := &Subscription{
		UserID:               userID,
		StripeSubscriptionID: stripeSubscription.ID,
		StripePriceID:        stripeSubscription.Items.Data[0].Price.ID,
		Tier:                 tier,
		Status:               string(stripeSubscription.Status),
		CurrentPeriodStart:   time.Unix(stripeSubscription.CurrentPeriodStart, 0),
		CurrentPeriodEnd:     time.Unix(stripeSubscription.CurrentPeriodEnd, 0),
		CancelAtPeriodEnd:    stripeSubscription.CancelAtPeriodEnd,
	}

	// Create or update subscription
	existing, _ := s.repo.GetSubscriptionByUserID(userID)
	if existing != nil {
		subscription.ID = existing.ID
		if err := s.repo.UpdateSubscription(subscription); err != nil {
			return err
		}
	} else {
		if err := s.repo.CreateSubscription(subscription); err != nil {
			return err
		}
	}

	// Update user's subscription tier and token limit
	return s.repo.UpdateUserSubscriptionTier(userID, tier, plan.TokensLimit)
}

func (s *Service) HandleSubscriptionUpdated(stripeSubscription *stripe.Subscription) error {
	subscription, err := s.repo.GetSubscriptionByStripeID(stripeSubscription.ID)
	if err != nil {
		return err
	}

	tier := s.getTierFromPriceID(stripeSubscription.Items.Data[0].Price.ID)
	plan, ok := s.plans[tier]
	if !ok {
		return errors.New("unknown subscription tier")
	}

	subscription.Tier = tier
	subscription.Status = string(stripeSubscription.Status)
	subscription.CurrentPeriodStart = time.Unix(stripeSubscription.CurrentPeriodStart, 0)
	subscription.CurrentPeriodEnd = time.Unix(stripeSubscription.CurrentPeriodEnd, 0)
	subscription.CancelAtPeriodEnd = stripeSubscription.CancelAtPeriodEnd

	if err := s.repo.UpdateSubscription(subscription); err != nil {
		return err
	}

	return s.repo.UpdateUserSubscriptionTier(subscription.UserID, tier, plan.TokensLimit)
}

func (s *Service) HandleSubscriptionDeleted(stripeSubscription *stripe.Subscription) error {
	subscription, err := s.repo.GetSubscriptionByStripeID(stripeSubscription.ID)
	if err != nil {
		return err
	}

	// Downgrade to basic tier
	basicPlan := s.plans["basic"]
	if err := s.repo.UpdateUserSubscriptionTier(subscription.UserID, "basic", basicPlan.TokensLimit); err != nil {
		return err
	}

	return s.repo.DeleteSubscription(subscription.UserID)
}

func (s *Service) HandlePaymentSucceeded(paymentIntent *stripe.PaymentIntent) error {
	userID, err := uuid.Parse(paymentIntent.Metadata["user_id"])
	if err != nil {
		return fmt.Errorf("invalid user_id in metadata: %w", err)
	}

	payment := &Payment{
		UserID:          userID,
		StripePaymentID: paymentIntent.ID,
		Amount:          paymentIntent.Amount,
		Currency:        string(paymentIntent.Currency),
		Status:          string(paymentIntent.Status),
		Description:     paymentIntent.Description,
	}

	return s.repo.CreatePayment(payment)
}

func (s *Service) getTierFromPriceID(priceID string) string {
	for tier, plan := range s.plans {
		if plan.StripePriceID == priceID {
			return tier
		}
	}
	return "basic"
}

func (s *Service) GetUserPayments(userID uuid.UUID, limit, offset int) ([]Payment, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	return s.repo.GetUserPayments(userID, limit, offset)
}
