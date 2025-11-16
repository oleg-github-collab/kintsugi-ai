package search

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Handler struct {
	service *Service
	db      *gorm.DB
}

func NewHandler(service *Service, db *gorm.DB) *Handler {
	return &Handler{
		service: service,
		db:      db,
	}
}

// GlobalSearch handles global search request
func (h *Handler) GlobalSearch(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req SearchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	results, err := h.service.GlobalSearch(userID, req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Search failed"})
	}

	return c.JSON(results)
}

// QuickSwitch handles quick switcher search
func (h *Handler) QuickSwitch(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	query := c.Query("q", "")
	limit := c.QueryInt("limit", 10)

	items, err := h.service.QuickSwitch(userID, query, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Search failed"})
	}

	return c.JSON(fiber.Map{
		"items": items,
	})
}

// GetRecentItems returns recently accessed items
func (h *Handler) GetRecentItems(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	limit := c.QueryInt("limit", 10)

	items, err := h.service.GetRecentItems(userID, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get recent items"})
	}

	return c.JSON(fiber.Map{
		"items": items,
	})
}

// RecordRecentItem records a recently accessed item
func (h *Handler) RecordRecentItem(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		ItemType string    `json:"item_type"`
		ItemID   uuid.UUID `json:"item_id"`
		Title    string    `json:"title"`
		URL      string    `json:"url"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if err := h.service.RecordRecentItem(userID, req.ItemType, req.ItemID, req.Title, req.URL); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to record item"})
	}

	return c.JSON(fiber.Map{"success": true})
}

// GetSuggestions returns AI-powered suggestions
func (h *Handler) GetSuggestions(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	limit := c.QueryInt("limit", 5)

	suggestions, err := h.service.GetSuggestions(userID, limit)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get suggestions"})
	}

	return c.JSON(fiber.Map{
		"suggestions": suggestions,
	})
}

// MarkSuggestionRead marks a suggestion as read
func (h *Handler) MarkSuggestionRead(c *fiber.Ctx) error {
	suggestionID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid suggestion ID"})
	}

	if err := h.service.MarkSuggestionRead(suggestionID); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark suggestion as read"})
	}

	return c.JSON(fiber.Map{"success": true})
}
