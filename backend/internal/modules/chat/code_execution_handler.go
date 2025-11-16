package chat

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type CodeExecutionHandler struct {
	service *CodeExecutionService
}

func NewCodeExecutionHandler(service *CodeExecutionService) *CodeExecutionHandler {
	return &CodeExecutionHandler{service: service}
}

func (h *CodeExecutionHandler) ExecuteCode(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req ExecuteCodeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var execution *CodeExecution
	var err error

	// Optional chat ID
	var chatIDPtr *uuid.UUID
	if req.ChatID != uuid.Nil {
		chatIDPtr = &req.ChatID
	}

	switch req.Language {
	case "python":
		execution, err = h.service.ExecutePythonCode(userID, req.Code, chatIDPtr)
	case "javascript":
		execution, err = h.service.ExecuteJavaScriptCode(userID, req.Code, chatIDPtr)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Unsupported language. Use 'python' or 'javascript'",
		})
	}

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(execution)
}

func (h *CodeExecutionHandler) GetExecution(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	executionID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid execution ID",
		})
	}

	execution, err := h.service.GetExecution(executionID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(execution)
}

func (h *CodeExecutionHandler) GetUserExecutions(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	executions, err := h.service.GetUserExecutions(userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(executions)
}

func (h *CodeExecutionHandler) GetChatExecutions(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("chatId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	executions, err := h.service.GetChatExecutions(chatID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(executions)
}

func (h *CodeExecutionHandler) DeleteExecution(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	executionID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid execution ID",
		})
	}

	if err := h.service.DeleteExecution(executionID, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Execution deleted successfully",
	})
}
