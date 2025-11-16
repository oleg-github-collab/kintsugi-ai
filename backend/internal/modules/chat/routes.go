package chat

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App, handler *Handler, authMiddleware fiber.Handler, foldersHandler *FoldersHandler, codeExecHandler *CodeExecutionHandler, analyticsHandler *AnalyticsHandler, adminHandler *AdminHandler) {
	// OpenAI-compatible streaming endpoint (for both chats and messenger AI)
	app.Post("/api/chat/stream", authMiddleware, handler.SendMessage)
	app.Post("/api/chat/completions", authMiddleware, handler.ChatCompletions)
	app.Post("/api/chat/generate-image", authMiddleware, handler.GenerateImage)

	chats := app.Group("/api/chats", authMiddleware)

	chats.Post("/", handler.CreateChat)
	chats.Get("/", handler.GetUserChats)
	chats.Get("/tokens", handler.GetTokenUsage)
	chats.Get("/:id", handler.GetChat)
	chats.Put("/:id", handler.UpdateChat)
	chats.Delete("/:id", handler.DeleteChat)
	chats.Post("/:id/messages", handler.SendMessage)
	chats.Post("/:chatId/messages/:messageId/regenerate", handler.RegenerateMessage)

	// Folders routes
	folders := app.Group("/api/chat/folders", authMiddleware)
	folders.Post("/", foldersHandler.CreateFolder)
	folders.Get("/", foldersHandler.GetUserFolders)
	folders.Put("/:id", foldersHandler.UpdateFolder)
	folders.Delete("/:id", foldersHandler.DeleteFolder)
	folders.Get("/:id/chats", foldersHandler.GetFolderChats)

	// Folder assignments
	app.Post("/api/chat/folders/assign", authMiddleware, foldersHandler.AssignChatToFolder)
	app.Delete("/api/chat/folders/:folderId/chats/:chatId", authMiddleware, foldersHandler.RemoveChatFromFolder)

	// Tags routes
	tags := app.Group("/api/chat/tags", authMiddleware)
	tags.Post("/", foldersHandler.CreateTag)
	tags.Get("/", foldersHandler.GetUserTags)
	tags.Delete("/:id", foldersHandler.DeleteTag)

	// Tag assignments
	app.Post("/api/chat/tags/assign", authMiddleware, foldersHandler.AssignTagToChat)
	app.Delete("/api/chat/tags/:tagId/chats/:chatId", authMiddleware, foldersHandler.RemoveTagFromChat)
	app.Get("/api/chat/chats/:id/tags", authMiddleware, foldersHandler.GetChatTags)

	// Auto-categorization
	app.Post("/api/chat/chats/:chatId/auto-categorize", authMiddleware, foldersHandler.AutoCategorizeChat)

	// Code execution routes
	codeExec := app.Group("/api/chat/execute", authMiddleware)
	codeExec.Post("/", codeExecHandler.ExecuteCode)
	codeExec.Get("/", codeExecHandler.GetUserExecutions)
	codeExec.Get("/:id", codeExecHandler.GetExecution)
	codeExec.Delete("/:id", codeExecHandler.DeleteExecution)
	app.Get("/api/chat/chats/:chatId/executions", authMiddleware, codeExecHandler.GetChatExecutions)

	// Analytics routes
	analytics := app.Group("/api/analytics", authMiddleware)
	analytics.Get("/summary", analyticsHandler.GetSummary)
	analytics.Get("/breakdown", analyticsHandler.GetBreakdown)
	analytics.Get("/daily", analyticsHandler.GetDailyAnalytics)
	analytics.Get("/detailed", analyticsHandler.GetDetailedAnalytics)
	analytics.Get("/active-days", analyticsHandler.GetMostActiveDays)
	analytics.Get("/trends", analyticsHandler.GetTrends)

	// Analytics recording endpoints (internal usage)
	analytics.Post("/record/chat", analyticsHandler.RecordChatUsage)
	analytics.Post("/record/translation", analyticsHandler.RecordTranslationUsage)
	analytics.Post("/record/image", analyticsHandler.RecordImageGeneration)
	analytics.Post("/record/voice", analyticsHandler.RecordVoiceMessage)
	analytics.Post("/record/message", analyticsHandler.RecordMessage)
	analytics.Post("/record/time", analyticsHandler.RecordTimeSpent)

	// Admin routes (protected by AdminOnly middleware)
	admin := app.Group("/api/admin", authMiddleware, adminHandler.AdminOnly())
	admin.Get("/stats", adminHandler.GetSystemStats)
	admin.Get("/dashboard", adminHandler.GetDashboardOverview)
	admin.Get("/users", adminHandler.GetAllUsers)
	admin.Get("/users/search", adminHandler.SearchUsers)
	admin.Get("/users/:userId", adminHandler.GetUserDetails)
	admin.Get("/users/:userId/activity", adminHandler.GetUserActivity)
	admin.Put("/users/:userId/role", adminHandler.UpdateUserRole)
	admin.Put("/users/:userId/subscription", adminHandler.UpdateUserSubscription)
	admin.Post("/users/:userId/ban", adminHandler.BanUser)
	admin.Post("/users/:userId/unban", adminHandler.UnbanUser)
	admin.Post("/users/:userId/reset-tokens", adminHandler.ResetUserTokens)
	admin.Get("/token-usage", adminHandler.GetTokenUsageByUser)
	admin.Get("/revenue", adminHandler.GetRevenueAnalytics)

	// Superadmin-only routes
	superAdmin := app.Group("/api/admin", authMiddleware, adminHandler.SuperAdminOnly())
	superAdmin.Delete("/users/:userId", adminHandler.DeleteUser)
}
