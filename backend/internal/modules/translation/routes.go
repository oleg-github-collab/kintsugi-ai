package translation

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
	translation := app.Group("/api/translation", authMiddleware)

	translation.Get("/pricing", handler.GetPricing)
	translation.Post("/", handler.Translate)
	translation.Get("/", handler.GetUserTranslations)
	translation.Get("/:id", handler.GetTranslation)
	translation.Delete("/:id", handler.DeleteTranslation)
}
