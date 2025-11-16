package chat

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminService struct {
	db *gorm.DB
}

func NewAdminService(db *gorm.DB) *AdminService {
	return &AdminService{db: db}
}

// User struct for admin operations (importing from auth package might cause circular dependency)
type UserInfo struct {
	ID               uuid.UUID `json:"id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	Bio              string    `json:"bio"`
	AvatarURL        string    `json:"avatar_url"`
	SubscriptionTier string    `json:"subscription_tier"`
	Role             string    `json:"role"`
	TokensUsed       int64     `json:"tokens_used"`
	TokensLimit      int64     `json:"tokens_limit"`
	ResetAt          time.Time `json:"reset_at"`
	StripeCustomerID string    `json:"stripe_customer_id"`
	IsBanned         bool      `json:"is_banned"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Check if user is admin or superadmin
func (s *AdminService) IsAdmin(userID uuid.UUID) (bool, error) {
	var role string
	err := s.db.Table("users").
		Where("id = ?", userID).
		Select("role").
		Scan(&role).Error

	if err != nil {
		return false, err
	}

	return role == "admin" || role == "superadmin", nil
}

// Get all users with pagination
func (s *AdminService) GetAllUsers(limit, offset int) ([]UserInfo, int64, error) {
	if limit <= 0 || limit > 1000 {
		limit = 50
	}

	var users []UserInfo
	var total int64

	// Get total count
	s.db.Table("users").Count(&total)

	// Get users with pagination
	err := s.db.Table("users").
		Select("id, username, email, bio, avatar_url, subscription_tier, role, tokens_used, tokens_limit, reset_at, stripe_customer_id, created_at, updated_at, deleted_at IS NOT NULL as is_banned").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&users).Error

	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// System statistics
type SystemStats struct {
	TotalUsers         int64   `json:"total_users"`
	ActiveToday        int64   `json:"active_today"`
	ActiveThisWeek     int64   `json:"active_this_week"`
	ActiveThisMonth    int64   `json:"active_this_month"`
	TotalTokensUsed    int64   `json:"total_tokens_used"`
	TotalChats         int64   `json:"total_chats"`
	TotalMessages      int64   `json:"total_messages"`
	TotalExecutions    int64   `json:"total_executions"`
	Revenue            float64 `json:"revenue"`
	BasicUsers         int64   `json:"basic_users"`
	PremiumUsers       int64   `json:"premium_users"`
	UnlimitedUsers     int64   `json:"unlimited_users"`
	NewUsersToday      int64   `json:"new_users_today"`
	NewUsersThisWeek   int64   `json:"new_users_this_week"`
	NewUsersThisMonth  int64   `json:"new_users_this_month"`
}

func (s *AdminService) GetSystemStats() (*SystemStats, error) {
	stats := &SystemStats{}

	// Total users
	s.db.Table("users").Where("deleted_at IS NULL").Count(&stats.TotalUsers)

	// Active users
	today := time.Now().Truncate(24 * time.Hour)
	weekAgo := today.AddDate(0, 0, -7)
	monthAgo := today.AddDate(0, -1, 0)

	s.db.Table("usage_analytics").
		Where("date = ?", today).
		Distinct("user_id").
		Count(&stats.ActiveToday)

	s.db.Table("usage_analytics").
		Where("date >= ?", weekAgo).
		Distinct("user_id").
		Count(&stats.ActiveThisWeek)

	s.db.Table("usage_analytics").
		Where("date >= ?", monthAgo).
		Distinct("user_id").
		Count(&stats.ActiveThisMonth)

	// Total tokens used
	s.db.Table("users").
		Where("deleted_at IS NULL").
		Select("COALESCE(SUM(tokens_used), 0)").
		Scan(&stats.TotalTokensUsed)

	// Total chats
	s.db.Table("chats").Where("deleted_at IS NULL").Count(&stats.TotalChats)

	// Total messages
	s.db.Table("messages").Count(&stats.TotalMessages)

	// Total code executions
	s.db.Table("code_executions").Count(&stats.TotalExecutions)

	// Users by subscription tier
	s.db.Table("users").
		Where("subscription_tier = ? AND deleted_at IS NULL", "basic").
		Count(&stats.BasicUsers)

	s.db.Table("users").
		Where("subscription_tier = ? AND deleted_at IS NULL", "premium").
		Count(&stats.PremiumUsers)

	s.db.Table("users").
		Where("subscription_tier = ? AND deleted_at IS NULL", "unlimited").
		Count(&stats.UnlimitedUsers)

	// New users
	s.db.Table("users").
		Where("created_at >= ? AND deleted_at IS NULL", today).
		Count(&stats.NewUsersToday)

	s.db.Table("users").
		Where("created_at >= ? AND deleted_at IS NULL", weekAgo).
		Count(&stats.NewUsersThisWeek)

	s.db.Table("users").
		Where("created_at >= ? AND deleted_at IS NULL", monthAgo).
		Count(&stats.NewUsersThisMonth)

	// Calculate revenue (simplified - based on subscription tiers)
	// Premium: $9.99/month, Unlimited: $19.99/month
	stats.Revenue = float64(stats.PremiumUsers)*9.99 + float64(stats.UnlimitedUsers)*19.99

	return stats, nil
}

// Get user details
func (s *AdminService) GetUserDetails(userID uuid.UUID) (*UserInfo, error) {
	var user UserInfo
	err := s.db.Table("users").
		Select("id, username, email, bio, avatar_url, subscription_tier, role, tokens_used, tokens_limit, reset_at, stripe_customer_id, created_at, updated_at, deleted_at IS NOT NULL as is_banned").
		Where("id = ?", userID).
		Scan(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// Update user role
func (s *AdminService) UpdateUserRole(userID uuid.UUID, role string) error {
	// Validate role
	if role != "user" && role != "admin" && role != "superadmin" {
		return errors.New("invalid role. Must be 'user', 'admin', or 'superadmin'")
	}

	result := s.db.Table("users").
		Where("id = ?", userID).
		Update("role", role)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

// Ban user (soft delete)
func (s *AdminService) BanUser(userID uuid.UUID) error {
	result := s.db.Table("users").
		Where("id = ?", userID).
		Update("deleted_at", time.Now())

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

// Unban user
func (s *AdminService) UnbanUser(userID uuid.UUID) error {
	result := s.db.Table("users").
		Where("id = ?", userID).
		Update("deleted_at", nil)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

// Token usage by user
type UserTokenUsage struct {
	UserID           uuid.UUID `json:"user_id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	SubscriptionTier string    `json:"subscription_tier"`
	TokensUsed       int64     `json:"tokens_used"`
	TokensLimit      int64     `json:"tokens_limit"`
	PercentageUsed   float64   `json:"percentage_used"`
}

func (s *AdminService) GetTokenUsageByUser(limit int) ([]UserTokenUsage, error) {
	if limit <= 0 || limit > 1000 {
		limit = 100
	}

	var usage []UserTokenUsage
	err := s.db.Table("users").
		Select("id as user_id, username, email, subscription_tier, tokens_used, tokens_limit, CASE WHEN tokens_limit > 0 THEN (tokens_used::float / tokens_limit::float * 100) ELSE 0 END as percentage_used").
		Where("deleted_at IS NULL").
		Order("tokens_used DESC").
		Limit(limit).
		Scan(&usage).Error

	if err != nil {
		return nil, err
	}

	return usage, nil
}

// Revenue analytics
type RevenueAnalytics struct {
	Date             time.Time `json:"date"`
	BasicUsers       int64     `json:"basic_users"`
	PremiumUsers     int64     `json:"premium_users"`
	UnlimitedUsers   int64     `json:"unlimited_users"`
	DailyRevenue     float64   `json:"daily_revenue"`
	CumulativeRevenue float64  `json:"cumulative_revenue"`
}

func (s *AdminService) GetRevenueAnalytics(from, to time.Time) ([]RevenueAnalytics, error) {
	from = from.Truncate(24 * time.Hour)
	to = to.Truncate(24 * time.Hour)

	var analytics []RevenueAnalytics

	// Generate date range
	current := from
	for !current.After(to) {
		var basicCount, premiumCount, unlimitedCount int64

		// Count users by tier created before or on this date
		s.db.Table("users").
			Where("subscription_tier = ? AND created_at <= ? AND deleted_at IS NULL", "basic", current).
			Count(&basicCount)

		s.db.Table("users").
			Where("subscription_tier = ? AND created_at <= ? AND deleted_at IS NULL", "premium", current).
			Count(&premiumCount)

		s.db.Table("users").
			Where("subscription_tier = ? AND created_at <= ? AND deleted_at IS NULL", "unlimited", current).
			Count(&unlimitedCount)

		dailyRevenue := float64(premiumCount)*9.99 + float64(unlimitedCount)*19.99

		analytics = append(analytics, RevenueAnalytics{
			Date:           current,
			BasicUsers:     basicCount,
			PremiumUsers:   premiumCount,
			UnlimitedUsers: unlimitedCount,
			DailyRevenue:   dailyRevenue,
		})

		current = current.AddDate(0, 0, 1)
	}

	// Calculate cumulative revenue
	var cumulative float64
	for i := range analytics {
		cumulative += analytics[i].DailyRevenue
		analytics[i].CumulativeRevenue = cumulative
	}

	return analytics, nil
}

// User activity details
type UserActivity struct {
	UserID           uuid.UUID `json:"user_id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	TotalChats       int64     `json:"total_chats"`
	TotalMessages    int64     `json:"total_messages"`
	TotalTokens      int64     `json:"total_tokens"`
	TotalExecutions  int64     `json:"total_executions"`
	LastActiveDate   time.Time `json:"last_active_date"`
}

func (s *AdminService) GetUserActivity(userID uuid.UUID) (*UserActivity, error) {
	activity := &UserActivity{
		UserID: userID,
	}

	// Get user info
	err := s.db.Table("users").
		Select("username, email").
		Where("id = ?", userID).
		Scan(&activity).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Get total chats
	s.db.Table("chats").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Count(&activity.TotalChats)

	// Get total messages
	s.db.Table("messages").
		Joins("JOIN chats ON messages.chat_id = chats.id").
		Where("chats.user_id = ?", userID).
		Count(&activity.TotalMessages)

	// Get total tokens
	s.db.Table("usage_analytics").
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(chat_tokens), 0)").
		Scan(&activity.TotalTokens)

	// Get total executions
	s.db.Table("code_executions").
		Where("user_id = ?", userID).
		Count(&activity.TotalExecutions)

	// Get last active date
	s.db.Table("usage_analytics").
		Where("user_id = ?", userID).
		Order("date DESC").
		Limit(1).
		Select("date").
		Scan(&activity.LastActiveDate)

	return activity, nil
}

// Search users
func (s *AdminService) SearchUsers(query string, limit, offset int) ([]UserInfo, int64, error) {
	if limit <= 0 || limit > 1000 {
		limit = 50
	}

	var users []UserInfo
	var total int64

	searchPattern := "%" + query + "%"

	// Get total count
	s.db.Table("users").
		Where("username ILIKE ? OR email ILIKE ?", searchPattern, searchPattern).
		Count(&total)

	// Get users
	err := s.db.Table("users").
		Select("id, username, email, bio, avatar_url, subscription_tier, role, tokens_used, tokens_limit, reset_at, stripe_customer_id, created_at, updated_at, deleted_at IS NOT NULL as is_banned").
		Where("username ILIKE ? OR email ILIKE ?", searchPattern, searchPattern).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&users).Error

	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// Update user subscription tier (admin override)
func (s *AdminService) UpdateUserSubscription(userID uuid.UUID, tier string) error {
	// Validate tier
	if tier != "basic" && tier != "premium" && tier != "unlimited" {
		return errors.New("invalid tier. Must be 'basic', 'premium', or 'unlimited'")
	}

	// Set token limits based on tier
	var tokenLimit int64
	switch tier {
	case "basic":
		tokenLimit = 20000
	case "premium":
		tokenLimit = 100000
	case "unlimited":
		tokenLimit = -1
	}

	result := s.db.Table("users").
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"subscription_tier": tier,
			"tokens_limit":      tokenLimit,
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

// Reset user tokens
func (s *AdminService) ResetUserTokens(userID uuid.UUID) error {
	result := s.db.Table("users").
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"tokens_used": 0,
			"reset_at":    time.Now().Add(6 * time.Hour),
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}
