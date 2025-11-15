package subscription

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
	subscription := app.Group("/api/subscription")

	// Public routes
	subscription.Get("/plans", handler.GetPlans)
	subscription.Post("/webhook", handler.HandleWebhook) // Stripe webhook

	// Protected routes
	subscription.Get("/", authMiddleware, handler.GetUserSubscription)
	subscription.Post("/checkout", authMiddleware, handler.CreateCheckoutSession)
	subscription.Post("/portal", authMiddleware, handler.CreatePortalSession)
	subscription.Get("/payments", authMiddleware, handler.GetUserPayments)
}
