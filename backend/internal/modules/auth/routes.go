package auth

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, middleware *Middleware) {
	auth := app.Group("/api/auth")

	// Authentication
	auth.Post("/register", handler.Register)
	auth.Post("/login", handler.Login)
	auth.Post("/refresh", handler.Refresh)
	auth.Post("/logout", handler.Logout)
	auth.Get("/me", middleware.Protected(), handler.Me)

	// Profile management
	auth.Put("/update-profile", middleware.Protected(), handler.UpdateProfile)
	auth.Post("/update-avatar", middleware.Protected(), handler.UpdateAvatar)
	auth.Post("/change-password", middleware.Protected(), handler.ChangePassword)

	// Preferences
	auth.Get("/preferences", middleware.Protected(), handler.GetPreferences)
	auth.Put("/preferences", middleware.Protected(), handler.UpdatePreferences)

	// Usage stats
	auth.Get("/usage-stats", middleware.Protected(), handler.GetUsageStats)
}
