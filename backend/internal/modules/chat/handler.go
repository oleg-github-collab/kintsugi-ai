package chat

import (
	"bufio"
	"encoding/json"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) CreateChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	chat, err := h.service.CreateChat(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(chat.ToDTO())
}

func (h *Handler) GetChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	chat, err := h.service.GetChat(chatID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(chat.ToDTO())
}

func (h *Handler) GetUserChats(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	chats, err := h.service.GetUserChats(userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	responses := make([]*ChatResponse, len(chats))
	for i, chat := range chats {
		responses[i] = chat.ToDTO()
	}

	return c.JSON(responses)
}

func (h *Handler) UpdateChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	var req UpdateChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	chat, err := h.service.UpdateChat(chatID, userID, &req)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(chat.ToDTO())
}

func (h *Handler) DeleteChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	if err := h.service.DeleteChat(chatID, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Chat deleted successfully",
	})
}

func (h *Handler) SendMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	var req SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Start streaming
	chunkChan, err := h.service.SendMessage(chatID, userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Set headers for SSE
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		for chunk := range chunkChan {
			data, _ := json.Marshal(chunk)
			fmt.Fprintf(w, "data: %s\n\n", data)
			w.Flush()
		}
	})

	return nil
}

func (h *Handler) RegenerateMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("chatId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	messageID, err := uuid.Parse(c.Params("messageId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	chunkChan, err := h.service.RegenerateMessage(chatID, messageID, userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Set headers for SSE
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Transfer-Encoding", "chunked")

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		for chunk := range chunkChan {
			data, _ := json.Marshal(chunk)
			fmt.Fprintf(w, "data: %s\n\n", data)
			w.Flush()
		}
	})

	return nil
}

func (h *Handler) GetTokenUsage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	hasCapacity, tokensUsed, tokensLimit, err := h.service.CheckTokenLimit(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"tokens_used":   tokensUsed,
		"tokens_limit":  tokensLimit,
		"has_capacity":  hasCapacity,
		"is_unlimited":  tokensLimit == -1,
	})
}

// OpenAI-compatible chat completions endpoint for messenger AI
func (h *Handler) ChatCompletions(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		Model    string                   `json:"model"`
		Messages []map[string]interface{} `json:"messages"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Call OpenAI directly for messenger AI
	response, err := h.service.CallOpenAI(userID, req.Model, req.Messages)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(response)
}
