package subscription

import (
	"encoding/json"
	"io"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetPlans(c *fiber.Ctx) error {
	plans := h.service.GetPlans()
	return c.JSON(plans)
}

func (h *Handler) GetUserSubscription(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	subscription, err := h.service.GetUserSubscription(userID)
	if err != nil {
		// User might not have a subscription (using basic plan)
		return c.JSON(fiber.Map{
			"tier":   "basic",
			"status": "active",
		})
	}

	return c.JSON(subscription)
}

func (h *Handler) CreateCheckoutSession(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateCheckoutSessionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	url, err := h.service.CreateCheckoutSession(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"url": url,
	})
}

func (h *Handler) CreatePortalSession(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreatePortalSessionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	url, err := h.service.CreatePortalSession(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"url": url,
	})
}

func (h *Handler) HandleWebhook(c *fiber.Ctx) error {
	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	if webhookSecret == "" {
		log.Println("Warning: STRIPE_WEBHOOK_SECRET not set")
	}

	payload, err := io.ReadAll(c.Request().BodyStream())
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid payload",
		})
	}

	var event stripe.Event
	if webhookSecret != "" {
		signature := c.Get("Stripe-Signature")
		event, err = webhook.ConstructEvent(payload, signature, webhookSecret)
		if err != nil {
			log.Printf("Webhook signature verification failed: %v", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid signature",
			})
		}
	} else {
		// In development without webhook secret
		if err := json.Unmarshal(payload, &event); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid event",
			})
		}
	}

	// Handle the event
	switch event.Type {
	case "customer.subscription.created":
		var subscription stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
			log.Printf("Error parsing subscription: %v", err)
			return c.SendStatus(fiber.StatusBadRequest)
		}
		if err := h.service.HandleSubscriptionCreated(&subscription); err != nil {
			log.Printf("Error handling subscription created: %v", err)
		}

	case "customer.subscription.updated":
		var subscription stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
			log.Printf("Error parsing subscription: %v", err)
			return c.SendStatus(fiber.StatusBadRequest)
		}
		if err := h.service.HandleSubscriptionUpdated(&subscription); err != nil {
			log.Printf("Error handling subscription updated: %v", err)
		}

	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
			log.Printf("Error parsing subscription: %v", err)
			return c.SendStatus(fiber.StatusBadRequest)
		}
		if err := h.service.HandleSubscriptionDeleted(&subscription); err != nil {
			log.Printf("Error handling subscription deleted: %v", err)
		}

	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &paymentIntent); err != nil {
			log.Printf("Error parsing payment intent: %v", err)
			return c.SendStatus(fiber.StatusBadRequest)
		}
		if err := h.service.HandlePaymentSucceeded(&paymentIntent); err != nil {
			log.Printf("Error handling payment succeeded: %v", err)
		}

	default:
		log.Printf("Unhandled event type: %s", event.Type)
	}

	return c.JSON(fiber.Map{"received": true})
}

func (h *Handler) GetUserPayments(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	payments, err := h.service.GetUserPayments(userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(payments)
}
