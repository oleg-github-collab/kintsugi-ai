package chat

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminHandler struct {
	service *AdminService
	db      *gorm.DB
}

func NewAdminHandler(service *AdminService, db *gorm.DB) *AdminHandler {
	return &AdminHandler{
		service: service,
		db:      db,
	}
}

// Middleware to check if user is admin or superadmin
func (h *AdminHandler) AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(uuid.UUID)

		isAdmin, err := h.service.IsAdmin(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to verify admin status",
			})
		}

		if !isAdmin {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied. Admin privileges required",
			})
		}

		// Get user role and set in context for fine-grained control
		var role string
		h.db.Table("users").
			Where("id = ?", userID).
			Select("role").
			Scan(&role)

		c.Locals("user_role", role)

		return c.Next()
	}
}

// Middleware to check if user is superadmin only
func (h *AdminHandler) SuperAdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := c.Locals("user_id").(uuid.UUID)

		var role string
		err := h.db.Table("users").
			Where("id = ?", userID).
			Select("role").
			Scan(&role).Error

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to verify superadmin status",
			})
		}

		if role != "superadmin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied. Superadmin privileges required",
			})
		}

		c.Locals("user_role", role)

		return c.Next()
	}
}

// Get all users with pagination
func (h *AdminHandler) GetAllUsers(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	users, total, err := h.service.GetAllUsers(limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"users":  users,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// Get system statistics
func (h *AdminHandler) GetSystemStats(c *fiber.Ctx) error {
	stats, err := h.service.GetSystemStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(stats)
}

// Get user details
func (h *AdminHandler) GetUserDetails(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	userDetails, err := h.service.GetUserDetails(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(userDetails)
}

// Get user activity
func (h *AdminHandler) GetUserActivity(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	activity, err := h.service.GetUserActivity(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(activity)
}

// Update user role
func (h *AdminHandler) UpdateUserRole(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var req struct {
		Role string `json:"role" validate:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Only superadmins can promote to admin or superadmin
	if req.Role == "admin" || req.Role == "superadmin" {
		userRole := c.Locals("user_role").(string)
		if userRole != "superadmin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Only superadmins can grant admin privileges",
			})
		}
	}

	if err := h.service.UpdateUserRole(userID, req.Role); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "User role updated successfully",
	})
}

// Ban user
func (h *AdminHandler) BanUser(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Prevent banning other admins (only superadmin can ban admins)
	targetUser, err := h.service.GetUserDetails(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if targetUser.Role == "admin" || targetUser.Role == "superadmin" {
		userRole := c.Locals("user_role").(string)
		if userRole != "superadmin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Only superadmins can ban other admins",
			})
		}
	}

	if err := h.service.BanUser(userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "User banned successfully",
	})
}

// Unban user
func (h *AdminHandler) UnbanUser(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	if err := h.service.UnbanUser(userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "User unbanned successfully",
	})
}

// Get token usage by user
func (h *AdminHandler) GetTokenUsageByUser(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 100)

	usage, err := h.service.GetTokenUsageByUser(limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(usage)
}

// Get revenue analytics
func (h *AdminHandler) GetRevenueAnalytics(c *fiber.Ctx) error {
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

	if to.Before(from) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "'to' date must be after 'from' date",
		})
	}

	analytics, err := h.service.GetRevenueAnalytics(from, to)
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

// Search users
func (h *AdminHandler) SearchUsers(c *fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	users, total, err := h.service.SearchUsers(query, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"users":  users,
		"total":  total,
		"query":  query,
		"limit":  limit,
		"offset": offset,
	})
}

// Update user subscription tier
func (h *AdminHandler) UpdateUserSubscription(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	var req struct {
		Tier string `json:"tier" validate:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := h.service.UpdateUserSubscription(userID, req.Tier); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "User subscription updated successfully",
	})
}

// Reset user tokens
func (h *AdminHandler) ResetUserTokens(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	if err := h.service.ResetUserTokens(userID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "User tokens reset successfully",
	})
}

// Delete user permanently (superadmin only)
func (h *AdminHandler) DeleteUser(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Prevent deleting other superadmins
	targetUser, err := h.service.GetUserDetails(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if targetUser.Role == "superadmin" {
		currentUserID := c.Locals("user_id").(uuid.UUID)
		if currentUserID != userID {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Cannot delete other superadmins",
			})
		}
	}

	// Permanently delete user and all related data
	tx := h.db.Begin()

	// Delete user's chats (will cascade to messages)
	if err := tx.Where("user_id = ?", userID).Delete(&Chat{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user chats",
		})
	}

	// Delete user's folders
	if err := tx.Where("user_id = ?", userID).Delete(&ChatFolder{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user folders",
		})
	}

	// Delete user's tags
	if err := tx.Where("user_id = ?", userID).Delete(&ChatTag{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user tags",
		})
	}

	// Delete user's code executions
	if err := tx.Where("user_id = ?", userID).Delete(&CodeExecution{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user code executions",
		})
	}

	// Delete user's analytics
	if err := tx.Where("user_id = ?", userID).Delete(&UsageAnalytics{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user analytics",
		})
	}

	// Delete user
	if err := tx.Table("users").Where("id = ?", userID).Delete(nil).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user",
		})
	}

	tx.Commit()

	return c.JSON(fiber.Map{
		"message": "User deleted permanently",
	})
}

// Get admin dashboard overview
func (h *AdminHandler) GetDashboardOverview(c *fiber.Ctx) error {
	stats, err := h.service.GetSystemStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Get top users by token usage
	topUsers, err := h.service.GetTokenUsageByUser(10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Get revenue for last 7 days
	now := time.Now().Truncate(24 * time.Hour)
	weekAgo := now.AddDate(0, 0, -7)
	revenueData, err := h.service.GetRevenueAnalytics(weekAgo, now)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"stats":        stats,
		"top_users":    topUsers,
		"revenue_week": revenueData,
	})
}
