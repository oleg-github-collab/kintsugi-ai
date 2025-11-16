package chat

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AnalyticsService struct {
	db *gorm.DB
}

func NewAnalyticsService(db *gorm.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

// Record usage events

func (s *AnalyticsService) RecordChatUsage(userID uuid.UUID, tokens int64) error {
	return s.updateDailyAnalytics(userID, func(analytics *UsageAnalytics) {
		analytics.ChatTokens += tokens
	})
}

func (s *AnalyticsService) RecordTranslationUsage(userID uuid.UUID, chars int64) error {
	return s.updateDailyAnalytics(userID, func(analytics *UsageAnalytics) {
		analytics.TranslationChars += chars
	})
}

func (s *AnalyticsService) RecordImageGeneration(userID uuid.UUID) error {
	return s.updateDailyAnalytics(userID, func(analytics *UsageAnalytics) {
		analytics.ImagesGenerated++
	})
}

func (s *AnalyticsService) RecordVoiceMessage(userID uuid.UUID) error {
	return s.updateDailyAnalytics(userID, func(analytics *UsageAnalytics) {
		analytics.VoiceMessages++
	})
}

func (s *AnalyticsService) RecordMessage(userID uuid.UUID) error {
	return s.updateDailyAnalytics(userID, func(analytics *UsageAnalytics) {
		analytics.MessagesCount++
	})
}

func (s *AnalyticsService) RecordTimeSpent(userID uuid.UUID, minutes int) error {
	return s.updateDailyAnalytics(userID, func(analytics *UsageAnalytics) {
		analytics.TimeSpentMinutes += minutes
	})
}

// Helper to update or create daily analytics
func (s *AnalyticsService) updateDailyAnalytics(userID uuid.UUID, updateFunc func(*UsageAnalytics)) error {
	today := time.Now().Truncate(24 * time.Hour)

	var analytics UsageAnalytics
	err := s.db.Where("user_id = ? AND date = ?", userID, today).First(&analytics).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new analytics record
			analytics = UsageAnalytics{
				UserID: userID,
				Date:   today,
			}
			updateFunc(&analytics)
			return s.db.Create(&analytics).Error
		}
		return err
	}

	// Update existing record
	updateFunc(&analytics)
	analytics.UpdatedAt = time.Now()
	return s.db.Save(&analytics).Error
}

// Query analytics

func (s *AnalyticsService) GetDailyAnalytics(userID uuid.UUID, from, to time.Time) ([]UsageAnalytics, error) {
	// Truncate times to start of day
	from = from.Truncate(24 * time.Hour)
	to = to.Truncate(24 * time.Hour)

	var analytics []UsageAnalytics
	err := s.db.Where("user_id = ? AND date >= ? AND date <= ?", userID, from, to).
		Order("date ASC").
		Find(&analytics).Error

	if err != nil {
		return nil, err
	}

	return analytics, nil
}

func (s *AnalyticsService) GetAnalyticsSummary(userID uuid.UUID) (*AnalyticsResponse, error) {
	// Get last 30 days
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30).Truncate(24 * time.Hour)

	// Get daily analytics
	dailyAnalytics, err := s.GetDailyAnalytics(userID, thirtyDaysAgo, now)
	if err != nil {
		return nil, err
	}

	// Calculate summary
	response := &AnalyticsResponse{
		Daily: dailyAnalytics,
	}

	for _, day := range dailyAnalytics {
		response.Summary.TotalTokens += day.ChatTokens
		response.Summary.TotalChars += day.TranslationChars
		response.Summary.TotalImages += day.ImagesGenerated
		response.Summary.TotalVoice += day.VoiceMessages
		response.Summary.TotalMessages += day.MessagesCount
		response.Summary.TotalTimeMinutes += day.TimeSpentMinutes
	}

	// Calculate breakdown
	response.Breakdown.Chat = response.Summary.TotalTokens
	response.Breakdown.Translation = response.Summary.TotalChars
	response.Breakdown.Images = response.Summary.TotalImages

	return response, nil
}

func (s *AnalyticsService) GetBreakdown(userID uuid.UUID) (map[string]interface{}, error) {
	// Get last 30 days
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30).Truncate(24 * time.Hour)

	// Get daily analytics
	dailyAnalytics, err := s.GetDailyAnalytics(userID, thirtyDaysAgo, now)
	if err != nil {
		return nil, err
	}

	// Calculate breakdown by module
	breakdown := map[string]interface{}{
		"chat": map[string]interface{}{
			"tokens":   int64(0),
			"messages": 0,
		},
		"translation": map[string]interface{}{
			"characters": int64(0),
		},
		"images": map[string]interface{}{
			"count": 0,
		},
		"voice": map[string]interface{}{
			"count": 0,
		},
		"time_spent": map[string]interface{}{
			"minutes": 0,
		},
	}

	for _, day := range dailyAnalytics {
		breakdown["chat"].(map[string]interface{})["tokens"] = breakdown["chat"].(map[string]interface{})["tokens"].(int64) + day.ChatTokens
		breakdown["chat"].(map[string]interface{})["messages"] = breakdown["chat"].(map[string]interface{})["messages"].(int) + day.MessagesCount
		breakdown["translation"].(map[string]interface{})["characters"] = breakdown["translation"].(map[string]interface{})["characters"].(int64) + day.TranslationChars
		breakdown["images"].(map[string]interface{})["count"] = breakdown["images"].(map[string]interface{})["count"].(int) + day.ImagesGenerated
		breakdown["voice"].(map[string]interface{})["count"] = breakdown["voice"].(map[string]interface{})["count"].(int) + day.VoiceMessages
		breakdown["time_spent"].(map[string]interface{})["minutes"] = breakdown["time_spent"].(map[string]interface{})["minutes"].(int) + day.TimeSpentMinutes
	}

	return breakdown, nil
}

// Get analytics for a specific date range with granular stats
func (s *AnalyticsService) GetDetailedAnalytics(userID uuid.UUID, from, to time.Time) (map[string]interface{}, error) {
	from = from.Truncate(24 * time.Hour)
	to = to.Truncate(24 * time.Hour)

	var analytics []UsageAnalytics
	err := s.db.Where("user_id = ? AND date >= ? AND date <= ?", userID, from, to).
		Order("date ASC").
		Find(&analytics).Error

	if err != nil {
		return nil, err
	}

	// Calculate totals and averages
	totalDays := int(to.Sub(from).Hours()/24) + 1
	var totalTokens int64
	var totalChars int64
	var totalImages int
	var totalVoice int
	var totalMessages int
	var totalTime int

	for _, day := range analytics {
		totalTokens += day.ChatTokens
		totalChars += day.TranslationChars
		totalImages += day.ImagesGenerated
		totalVoice += day.VoiceMessages
		totalMessages += day.MessagesCount
		totalTime += day.TimeSpentMinutes
	}

	avgTokensPerDay := int64(0)
	avgMessagesPerDay := 0
	avgTimePerDay := 0

	if totalDays > 0 {
		avgTokensPerDay = totalTokens / int64(totalDays)
		avgMessagesPerDay = totalMessages / totalDays
		avgTimePerDay = totalTime / totalDays
	}

	return map[string]interface{}{
		"period": map[string]interface{}{
			"from": from,
			"to":   to,
			"days": totalDays,
		},
		"totals": map[string]interface{}{
			"tokens":            totalTokens,
			"translation_chars": totalChars,
			"images":            totalImages,
			"voice_messages":    totalVoice,
			"messages":          totalMessages,
			"time_minutes":      totalTime,
		},
		"averages": map[string]interface{}{
			"tokens_per_day":   avgTokensPerDay,
			"messages_per_day": avgMessagesPerDay,
			"time_per_day":     avgTimePerDay,
		},
		"daily": analytics,
	}, nil
}

// Get most active days
func (s *AnalyticsService) GetMostActiveDays(userID uuid.UUID, limit int) ([]UsageAnalytics, error) {
	if limit <= 0 || limit > 100 {
		limit = 10
	}

	var analytics []UsageAnalytics
	err := s.db.Where("user_id = ?", userID).
		Order("messages_count DESC, chat_tokens DESC").
		Limit(limit).
		Find(&analytics).Error

	if err != nil {
		return nil, err
	}

	return analytics, nil
}

// Get usage trends (comparing current period to previous)
func (s *AnalyticsService) GetUsageTrends(userID uuid.UUID, days int) (map[string]interface{}, error) {
	if days <= 0 {
		days = 7
	}

	now := time.Now().Truncate(24 * time.Hour)
	currentPeriodStart := now.AddDate(0, 0, -days+1)
	previousPeriodStart := currentPeriodStart.AddDate(0, 0, -days)
	previousPeriodEnd := currentPeriodStart.AddDate(0, 0, -1)

	// Get current period analytics
	currentAnalytics, err := s.GetDailyAnalytics(userID, currentPeriodStart, now)
	if err != nil {
		return nil, err
	}

	// Get previous period analytics
	previousAnalytics, err := s.GetDailyAnalytics(userID, previousPeriodStart, previousPeriodEnd)
	if err != nil {
		return nil, err
	}

	// Calculate totals
	var currentTokens, previousTokens int64
	var currentMessages, previousMessages int
	var currentTime, previousTime int

	for _, day := range currentAnalytics {
		currentTokens += day.ChatTokens
		currentMessages += day.MessagesCount
		currentTime += day.TimeSpentMinutes
	}

	for _, day := range previousAnalytics {
		previousTokens += day.ChatTokens
		previousMessages += day.MessagesCount
		previousTime += day.TimeSpentMinutes
	}

	// Calculate percentage changes
	tokenChange := calculatePercentageChange(previousTokens, currentTokens)
	messageChange := calculatePercentageChange(int64(previousMessages), int64(currentMessages))
	timeChange := calculatePercentageChange(int64(previousTime), int64(currentTime))

	return map[string]interface{}{
		"period_days": days,
		"current": map[string]interface{}{
			"tokens":   currentTokens,
			"messages": currentMessages,
			"time":     currentTime,
		},
		"previous": map[string]interface{}{
			"tokens":   previousTokens,
			"messages": previousMessages,
			"time":     previousTime,
		},
		"changes": map[string]interface{}{
			"tokens_percent":   tokenChange,
			"messages_percent": messageChange,
			"time_percent":     timeChange,
		},
	}, nil
}

func calculatePercentageChange(old, new int64) float64 {
	if old == 0 {
		if new == 0 {
			return 0
		}
		return 100
	}
	return float64(new-old) / float64(old) * 100
}
