package chat

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AnalyticsHandler struct {
	service *AnalyticsService
}

func NewAnalyticsHandler(service *AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

// Get analytics summary (last 30 days)
func (h *AnalyticsHandler) GetSummary(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	summary, err := h.service.GetAnalyticsSummary(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(summary)
}

// Get usage breakdown by module
func (h *AnalyticsHandler) GetBreakdown(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	breakdown, err := h.service.GetBreakdown(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(breakdown)
}

// Get daily analytics for a date range
func (h *AnalyticsHandler) GetDailyAnalytics(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	// Parse query parameters
	fromStr := c.Query("from")
	toStr := c.Query("to")

	var from, to time.Time
	var err error

	if fromStr == "" {
		// Default to 30 days ago
		from = time.Now().AddDate(0, 0, -30).Truncate(24 * time.Hour)
	} else {
		from, err = time.Parse("2006-01-02", fromStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid 'from' date format. Use YYYY-MM-DD",
			})
		}
	}

	if toStr == "" {
		// Default to today
		to = time.Now().Truncate(24 * time.Hour)
	} else {
		to, err = time.Parse("2006-01-02", toStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid 'to' date format. Use YYYY-MM-DD",
			})
		}
	}

	// Validate date range
	if to.Before(from) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "'to' date must be after 'from' date",
		})
	}

	analytics, err := h.service.GetDailyAnalytics(userID, from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"from":      from.Format("2006-01-02"),
		"to":        to.Format("2006-01-02"),
		"analytics": analytics,
	})
}

// Get detailed analytics with totals and averages
func (h *AnalyticsHandler) GetDetailedAnalytics(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	// Parse query parameters
	fromStr := c.Query("from")
	toStr := c.Query("to")

	var from, to time.Time
	var err error

	if fromStr == "" {
		from = time.Now().AddDate(0, 0, -30).Truncate(24 * time.Hour)
	} else {
		from, err = time.Parse("2006-01-02", fromStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid 'from' date format. Use YYYY-MM-DD",
			})
		}
	}

	if toStr == "" {
		to = time.Now().Truncate(24 * time.Hour)
	} else {
		to, err = time.Parse("2006-01-02", toStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid 'to' date format. Use YYYY-MM-DD",
			})
		}
	}

	if to.Before(from) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "'to' date must be after 'from' date",
		})
	}

	analytics, err := h.service.GetDetailedAnalytics(userID, from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(analytics)
}

// Get most active days
func (h *AnalyticsHandler) GetMostActiveDays(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	limit := c.QueryInt("limit", 10)
	if limit > 100 {
		limit = 100
	}

	activeDays, err := h.service.GetMostActiveDays(userID, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(activeDays)
}

// Get usage trends (comparing current period to previous)
func (h *AnalyticsHandler) GetTrends(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	days := c.QueryInt("days", 7)
	if days <= 0 {
		days = 7
	}
	if days > 365 {
		days = 365
	}

	trends, err := h.service.GetUsageTrends(userID, days)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(trends)
}

// Record usage events (these would typically be called internally by other services)

func (h *AnalyticsHandler) RecordChatUsage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		Tokens int64 `json:"tokens"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.RecordChatUsage(userID, req.Tokens); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usage recorded successfully",
	})
}

func (h *AnalyticsHandler) RecordTranslationUsage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		Characters int64 `json:"characters"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.RecordTranslationUsage(userID, req.Characters); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usage recorded successfully",
	})
}

func (h *AnalyticsHandler) RecordImageGeneration(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	if err := h.service.RecordImageGeneration(userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usage recorded successfully",
	})
}

func (h *AnalyticsHandler) RecordVoiceMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	if err := h.service.RecordVoiceMessage(userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usage recorded successfully",
	})
}

func (h *AnalyticsHandler) RecordMessage(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	if err := h.service.RecordMessage(userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usage recorded successfully",
	})
}

func (h *AnalyticsHandler) RecordTimeSpent(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		Minutes int `json:"minutes"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.RecordTimeSpent(userID, req.Minutes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usage recorded successfully",
	})
}
