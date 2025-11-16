package messenger

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
	hub     *Hub
	repo    *Repository
}

func NewHandler(service *Service, hub *Hub) *Handler {
	return &Handler{
		service: service,
		hub:     hub,
		repo:    service.repo,
	}
}

// WebSocket

func (h *Handler) HandleWebSocket(c *websocket.Conn) {
	// Get user ID from query (set by middleware)
	userIDStr := c.Query("user_id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.Close()
		return
	}

	client := &Client{
		ID:   userID,
		Conn: c,
		Send: make(chan []byte, 256),
		hub:  h.hub,
	}

	h.hub.register <- client

	go client.WritePump()
	client.ReadPump()
}

// Conversations

func (h *Handler) CreateConversation(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateConversationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	conversation, err := h.service.CreateConversation(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(conversation)
}

func (h *Handler) GetConversation(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	conversationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid conversation ID",
		})
	}

	conversation, err := h.service.GetConversation(conversationID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(conversation)
}

func (h *Handler) GetUserConversations(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	conversations, err := h.service.GetUserConversations(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(conversations)
}

func (h *Handler) AddParticipant(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	conversationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid conversation ID",
		})
	}

	var req struct {
		UserID uuid.UUID `json:"user_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.AddParticipant(conversationID, userID, req.UserID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Participant added successfully",
	})
}

func (h *Handler) RemoveParticipant(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	conversationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid conversation ID",
		})
	}

	participantID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid participant ID",
		})
	}

	if err := h.service.RemoveParticipant(conversationID, userID, participantID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Participant removed successfully",
	})
}

func (h *Handler) UpdateParticipantSettings(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	conversationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid conversation ID",
		})
	}

	var req struct {
		IsPinned   *bool `json:"is_pinned"`
		IsMuted    *bool `json:"is_muted"`
		IsArchived *bool `json:"is_archived"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.UpdateParticipantSettings(conversationID, userID, req.IsPinned, req.IsMuted, req.IsArchived); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Settings updated successfully",
	})
}

// Messages

func (h *Handler) SendMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	conversationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid conversation ID",
		})
	}

	var req SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	message, err := h.service.SendMessage(conversationID, userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(message)
}

func (h *Handler) GetMessages(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	conversationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid conversation ID",
		})
	}

	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	messages, err := h.service.GetMessages(conversationID, userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(messages)
}

func (h *Handler) UpdateMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	messageID, err := uuid.Parse(c.Params("messageId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	var req UpdateMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	message, err := h.service.UpdateMessage(messageID, userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(message)
}

func (h *Handler) DeleteMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	messageID, err := uuid.Parse(c.Params("messageId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	// Parse delete type from request body
	var req DeleteMessageRequest
	if err := c.BodyParser(&req); err != nil {
		// Default to "me" if no body provided
		req.DeleteFor = "me"
	}

	if err := h.service.DeleteMessage(messageID, userID, req.DeleteFor); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Message deleted successfully",
		"delete_for": req.DeleteFor,
	})
}

// Reactions

func (h *Handler) AddReaction(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	messageID, err := uuid.Parse(c.Params("messageId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	var req AddReactionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.AddReaction(messageID, userID, &req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Reaction added successfully",
	})
}

func (h *Handler) RemoveReaction(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	messageID, err := uuid.Parse(c.Params("messageId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	emoji := c.Query("emoji")
	if emoji == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Emoji is required",
		})
	}

	if err := h.service.RemoveReaction(messageID, userID, emoji); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Reaction removed successfully",
	})
}

func (h *Handler) MarkAsRead(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	messageID, err := uuid.Parse(c.Params("messageId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	if err := h.service.MarkAsRead(messageID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Marked as read",
	})
}

// Stories

func (h *Handler) CreateStory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateStoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	story, err := h.service.CreateStory(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(story)
}

func (h *Handler) GetUserStories(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	stories, err := h.service.GetUserStories(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(stories)
}

func (h *Handler) ViewStory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	storyID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid story ID",
		})
	}

	if err := h.service.ViewStory(storyID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Story viewed",
	})
}

func (h *Handler) DeleteStory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	storyID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid story ID",
		})
	}

	if err := h.service.DeleteStory(storyID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Story deleted successfully",
	})
}

// Search users
func (h *Handler) SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query parameter 'q' is required",
		})
	}

	users, err := h.service.SearchUsers(query)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"users": users,
	})
}

// Create invite link
func (h *Handler) CreateInvite(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	inviteCode, err := h.service.CreateInvite(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"invite_code": inviteCode,
	})
}
