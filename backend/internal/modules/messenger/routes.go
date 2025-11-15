package messenger

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler) {
	// WebSocket endpoint
	app.Get("/ws", websocket.New(handler.HandleWebSocket))

	// Messenger API routes
	messenger := app.Group("/api/messenger", authMiddleware)

	// Conversations
	messenger.Post("/conversations", handler.CreateConversation)
	messenger.Get("/conversations", handler.GetUserConversations)
	messenger.Get("/conversations/:id", handler.GetConversation)
	messenger.Post("/conversations/:id/participants", handler.AddParticipant)
	messenger.Delete("/conversations/:id/participants/:userId", handler.RemoveParticipant)
	messenger.Put("/conversations/:id/settings", handler.UpdateParticipantSettings)

	// Messages
	messenger.Post("/conversations/:id/messages", handler.SendMessage)
	messenger.Get("/conversations/:id/messages", handler.GetMessages)
	messenger.Put("/messages/:messageId", handler.UpdateMessage)
	messenger.Delete("/messages/:messageId", handler.DeleteMessage)

	// Reactions
	messenger.Post("/messages/:messageId/reactions", handler.AddReaction)
	messenger.Delete("/messages/:messageId/reactions", handler.RemoveReaction)

	// Read receipts
	messenger.Post("/messages/:messageId/read", handler.MarkAsRead)

	// Stories
	messenger.Post("/stories", handler.CreateStory)
	messenger.Get("/users/:userId/stories", handler.GetUserStories)
	messenger.Post("/stories/:id/view", handler.ViewStory)
	messenger.Delete("/stories/:id", handler.DeleteStory)

	// User search
	messenger.Get("/search-users", handler.SearchUsers)

	// Invite links
	messenger.Post("/create-invite", handler.CreateInvite)

	// Group chat endpoints
	messenger.Post("/groups", handler.CreateGroup)
	messenger.Get("/groups/:id", handler.GetGroup)
	messenger.Put("/groups/:id", handler.UpdateGroup)
	messenger.Delete("/groups/:id", handler.DeleteGroup)
	messenger.Get("/groups/:id/members", handler.GetGroupMembers)
	messenger.Post("/groups/:id/members", handler.AddGroupMembers)
	messenger.Delete("/groups/:id/members/:userId", handler.RemoveGroupMember)
	messenger.Post("/groups/:id/invite", handler.GenerateGroupInvite)
	messenger.Post("/groups/:id/leave", handler.LeaveGroup)

	// 100ms Video integration
	messenger.Post("/groups/:id/video/token", handler.Generate100msToken)
	messenger.Post("/groups/:id/video/guest-token", handler.Generate100msGuestToken)

	// Get all users for group creation
	messenger.Get("/users", handler.GetAllUsers)
}
