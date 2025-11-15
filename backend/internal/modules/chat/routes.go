package chat

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
	chats := app.Group("/api/chats", authMiddleware)

	chats.Post("/", handler.CreateChat)
	chats.Get("/", handler.GetUserChats)
	chats.Get("/tokens", handler.GetTokenUsage)
	chats.Get("/:id", handler.GetChat)
	chats.Put("/:id", handler.UpdateChat)
	chats.Delete("/:id", handler.DeleteChat)
	chats.Post("/:id/messages", handler.SendMessage)
	chats.Post("/:chatId/messages/:messageId/regenerate", handler.RegenerateMessage)
}
