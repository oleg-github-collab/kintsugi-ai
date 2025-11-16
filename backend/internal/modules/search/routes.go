package search

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
	// Global search
	app.Post("/api/search", authMiddleware, handler.GlobalSearch)
	app.Get("/api/search/quick", authMiddleware, handler.QuickSwitch)

	// Recent items
	app.Get("/api/search/recent", authMiddleware, handler.GetRecentItems)
	app.Post("/api/search/recent", authMiddleware, handler.RecordRecentItem)

	// Smart suggestions
	app.Get("/api/search/suggestions", authMiddleware, handler.GetSuggestions)
	app.Post("/api/search/suggestions/:id/read", authMiddleware, handler.MarkSuggestionRead)
}
