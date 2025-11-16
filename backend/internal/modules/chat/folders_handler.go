package chat

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FoldersHandler struct {
	service *FoldersService
}

func NewFoldersHandler(service *FoldersService) *FoldersHandler {
	return &FoldersHandler{service: service}
}

// Folder Handlers

func (h *FoldersHandler) CreateFolder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateFolderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	folder, err := h.service.CreateFolder(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(folder)
}

func (h *FoldersHandler) GetUserFolders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	folders, err := h.service.GetUserFolders(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(folders)
}

func (h *FoldersHandler) UpdateFolder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	folderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid folder ID",
		})
	}

	var req UpdateFolderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	folder, err := h.service.UpdateFolder(folderID, userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(folder)
}

func (h *FoldersHandler) DeleteFolder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	folderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid folder ID",
		})
	}

	if err := h.service.DeleteFolder(folderID, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Folder deleted successfully",
	})
}

// Chat-Folder Assignment Handlers

func (h *FoldersHandler) AssignChatToFolder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req AssignChatToFolderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.AssignChatToFolder(req.ChatID, req.FolderID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Chat assigned to folder successfully",
	})
}

func (h *FoldersHandler) RemoveChatFromFolder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("chatId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	folderID, err := uuid.Parse(c.Params("folderId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid folder ID",
		})
	}

	if err := h.service.RemoveChatFromFolder(chatID, folderID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Chat removed from folder successfully",
	})
}

func (h *FoldersHandler) GetFolderChats(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	folderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid folder ID",
		})
	}

	chats, err := h.service.GetFolderChats(folderID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	responses := make([]*ChatResponse, len(chats))
	for i, chat := range chats {
		responses[i] = chat.ToDTO()
	}

	return c.JSON(responses)
}

// Tag Handlers

func (h *FoldersHandler) CreateTag(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateTagRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	tag, err := h.service.CreateTag(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(tag)
}

func (h *FoldersHandler) GetUserTags(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	tags, err := h.service.GetUserTags(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(tags)
}

func (h *FoldersHandler) DeleteTag(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	tagID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid tag ID",
		})
	}

	if err := h.service.DeleteTag(tagID, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Tag deleted successfully",
	})
}

// Chat-Tag Assignment Handlers

func (h *FoldersHandler) AssignTagToChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req AssignTagRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.AssignTagToChat(req.ChatID, req.TagID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Tag assigned to chat successfully",
	})
}

func (h *FoldersHandler) RemoveTagFromChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("chatId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	tagID, err := uuid.Parse(c.Params("tagId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid tag ID",
		})
	}

	if err := h.service.RemoveTagFromChat(chatID, tagID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Tag removed from chat successfully",
	})
}

func (h *FoldersHandler) GetChatTags(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	tags, err := h.service.GetChatTags(chatID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(tags)
}

// Smart Folder Auto-Categorization

func (h *FoldersHandler) AutoCategorizeChat(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	chatID, err := uuid.Parse(c.Params("chatId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	if err := h.service.AutoCategorizeChatToSmartFolders(chatID, userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Chat auto-categorized successfully",
	})
}
