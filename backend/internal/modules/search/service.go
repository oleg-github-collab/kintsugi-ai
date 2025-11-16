package search

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// GlobalSearch performs search across all modules
func (s *Service) GlobalSearch(userID uuid.UUID, req SearchRequest) (*SearchResponse, error) {
	startTime := time.Now()

	if req.Limit == 0 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	var allResults []SearchResult
	modules := req.Modules
	if len(modules) == 0 {
		modules = []string{"chat", "messenger", "translation", "files"}
	}

	// Search in each module
	for _, module := range modules {
		var moduleResults []SearchResult
		var err error

		switch module {
		case "chat":
			moduleResults, err = s.searchChats(userID, req.Query)
		case "messenger":
			moduleResults, err = s.searchMessages(userID, req.Query)
		case "translation":
			moduleResults, err = s.searchTranslations(userID, req.Query)
		case "files":
			moduleResults, err = s.searchFiles(userID, req.Query)
		}

		if err != nil {
			continue
		}

		allResults = append(allResults, moduleResults...)
	}

	// Sort by relevance/date
	if req.SortBy == "date" {
		// Sort by created_at descending
		for i := 0; i < len(allResults); i++ {
			for j := i + 1; j < len(allResults); j++ {
				if allResults[i].CreatedAt.Before(allResults[j].CreatedAt) {
					allResults[i], allResults[j] = allResults[j], allResults[i]
				}
			}
		}
	}

	// Apply pagination
	total := len(allResults)
	if req.Offset >= total {
		allResults = []SearchResult{}
	} else {
		end := req.Offset + req.Limit
		if end > total {
			end = total
		}
		allResults = allResults[req.Offset:end]
	}

	timeTaken := float64(time.Since(startTime).Microseconds()) / 1000.0

	return &SearchResponse{
		Results:     allResults,
		Total:       total,
		Query:       req.Query,
		TimeTaken:   timeTaken,
		Suggestions: s.generateSuggestions(req.Query),
	}, nil
}

// searchChats searches in chat messages
func (s *Service) searchChats(userID uuid.UUID, query string) ([]SearchResult, error) {
	var results []SearchResult

	queryPattern := "%" + strings.ToLower(query) + "%"

	rows, err := s.db.Raw(`
		SELECT
			m.id,
			'message' as type,
			c.title,
			m.content,
			'chat' as module,
			m.created_at,
			m.updated_at
		FROM messages m
		JOIN chats c ON m.chat_id = c.id
		WHERE c.user_id = ?
		AND LOWER(m.content) LIKE ?
		ORDER BY m.created_at DESC
		LIMIT 50
	`, userID, queryPattern).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.ID, &r.Type, &r.Title, &r.Content, &r.Module, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		r.Highlight = s.highlightText(r.Content, query)
		r.URL = fmt.Sprintf("/chat.html?id=%s", r.ID)
		r.Score = s.calculateScore(r.Content, query)
		results = append(results, r)
	}

	return results, nil
}

// searchMessages searches in messenger conversations
func (s *Service) searchMessages(userID uuid.UUID, query string) ([]SearchResult, error) {
	var results []SearchResult

	queryPattern := "%" + strings.ToLower(query) + "%"

	rows, err := s.db.Raw(`
		SELECT DISTINCT
			cm.id,
			'messenger_message' as type,
			c.name as title,
			cm.content,
			'messenger' as module,
			cm.created_at,
			cm.updated_at
		FROM conversation_messages cm
		JOIN conversations c ON cm.conversation_id = c.id
		JOIN conversation_participants cp ON c.id = cp.conversation_id
		WHERE cp.user_id = ?
		AND LOWER(cm.content) LIKE ?
		ORDER BY cm.created_at DESC
		LIMIT 50
	`, userID, queryPattern).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.ID, &r.Type, &r.Title, &r.Content, &r.Module, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		r.Highlight = s.highlightText(r.Content, query)
		r.URL = fmt.Sprintf("/messenger.html?conversation=%s", r.ID)
		r.Score = s.calculateScore(r.Content, query)
		results = append(results, r)
	}

	return results, nil
}

// searchTranslations searches in translations
func (s *Service) searchTranslations(userID uuid.UUID, query string) ([]SearchResult, error) {
	var results []SearchResult

	queryPattern := "%" + strings.ToLower(query) + "%"

	rows, err := s.db.Raw(`
		SELECT
			id,
			'translation' as type,
			COALESCE(source_lang, 'Unknown') || ' → ' || COALESCE(target_lang, 'Unknown') as title,
			COALESCE(source_text, '') as content,
			'translation' as module,
			created_at,
			updated_at
		FROM translations
		WHERE user_id = ?
		AND (LOWER(source_text) LIKE ? OR LOWER(translated_text) LIKE ?)
		ORDER BY created_at DESC
		LIMIT 50
	`, userID, queryPattern, queryPattern).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.ID, &r.Type, &r.Title, &r.Content, &r.Module, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		r.Highlight = s.highlightText(r.Content, query)
		r.URL = fmt.Sprintf("/translation.html?id=%s", r.ID)
		r.Score = s.calculateScore(r.Content, query)
		results = append(results, r)
	}

	return results, nil
}

// searchFiles searches in file attachments
func (s *Service) searchFiles(userID uuid.UUID, query string) ([]SearchResult, error) {
	var results []SearchResult

	queryPattern := "%" + strings.ToLower(query) + "%"

	rows, err := s.db.Raw(`
		SELECT
			id,
			'file' as type,
			file_name as title,
			file_type as content,
			'files' as module,
			created_at,
			updated_at
		FROM file_attachments
		WHERE user_id = ?
		AND LOWER(file_name) LIKE ?
		ORDER BY created_at DESC
		LIMIT 50
	`, userID, queryPattern).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(&r.ID, &r.Type, &r.Title, &r.Content, &r.Module, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		r.Highlight = r.Title
		r.URL = fmt.Sprintf("/files/%s", r.ID)
		r.Score = s.calculateScore(r.Title, query)
		results = append(results, r)
	}

	return results, nil
}

// highlightText highlights search query in text
func (s *Service) highlightText(text, query string) string {
	lowerText := strings.ToLower(text)
	lowerQuery := strings.ToLower(query)

	index := strings.Index(lowerText, lowerQuery)
	if index == -1 {
		if len(text) > 150 {
			return text[:150] + "..."
		}
		return text
	}

	start := index - 50
	if start < 0 {
		start = 0
	}

	end := index + len(query) + 50
	if end > len(text) {
		end = len(text)
	}

	snippet := text[start:end]
	if start > 0 {
		snippet = "..." + snippet
	}
	if end < len(text) {
		snippet = snippet + "..."
	}

	return snippet
}

// calculateScore calculates relevance score
func (s *Service) calculateScore(text, query string) float64 {
	lowerText := strings.ToLower(text)
	lowerQuery := strings.ToLower(query)

	// Simple scoring based on occurrences
	count := float64(strings.Count(lowerText, lowerQuery))
	if count == 0 {
		return 0
	}

	// Boost if query is at the start
	if strings.HasPrefix(lowerText, lowerQuery) {
		count *= 2
	}

	return count * 10.0
}

// generateSuggestions generates search suggestions
func (s *Service) generateSuggestions(query string) []string {
	// Simple suggestions based on common searches
	suggestions := []string{
		query + " today",
		query + " this week",
		query + " files",
		query + " messages",
	}
	return suggestions
}

// RecordRecentItem records a recently accessed item
func (s *Service) RecordRecentItem(userID uuid.UUID, itemType string, itemID uuid.UUID, title, url string) error {
	// Delete old entry if exists
	s.db.Where("user_id = ? AND item_type = ? AND item_id = ?", userID, itemType, itemID).Delete(&RecentItem{})

	item := RecentItem{
		UserID:     userID,
		ItemType:   itemType,
		ItemID:     itemID,
		Title:      title,
		URL:        url,
		AccessedAt: time.Now(),
	}

	return s.db.Create(&item).Error
}

// GetRecentItems returns recent items
func (s *Service) GetRecentItems(userID uuid.UUID, limit int) ([]RecentItem, error) {
	if limit == 0 {
		limit = 10
	}

	var items []RecentItem
	err := s.db.Where("user_id = ?", userID).
		Order("accessed_at DESC").
		Limit(limit).
		Find(&items).Error

	return items, err
}

// CreateSuggestion creates an AI-powered suggestion
func (s *Service) CreateSuggestion(userID uuid.UUID, suggestionType, title, description, action string, confidence float64) error {
	suggestion := Suggestion{
		UserID:      userID,
		Type:        suggestionType,
		Title:       title,
		Description: description,
		Action:      action,
		Confidence:  confidence,
	}

	return s.db.Create(&suggestion).Error
}

// GetSuggestions returns user suggestions
func (s *Service) GetSuggestions(userID uuid.UUID, limit int) ([]Suggestion, error) {
	if limit == 0 {
		limit = 5
	}

	var suggestions []Suggestion
	err := s.db.Where("user_id = ? AND is_read = ?", userID, false).
		Order("confidence DESC, created_at DESC").
		Limit(limit).
		Find(&suggestions).Error

	return suggestions, err
}

// MarkSuggestionRead marks suggestion as read
func (s *Service) MarkSuggestionRead(suggestionID uuid.UUID) error {
	return s.db.Model(&Suggestion{}).
		Where("id = ?", suggestionID).
		Update("is_read", true).Error
}

// QuickSwitch performs quick switcher search
func (s *Service) QuickSwitch(userID uuid.UUID, query string, limit int) ([]QuickSwitcherItem, error) {
	if limit == 0 {
		limit = 10
	}

	var items []QuickSwitcherItem
	queryPattern := "%" + strings.ToLower(query) + "%"

	// Search chats
	var chats []struct {
		ID    string
		Title string
	}
	s.db.Raw(`
		SELECT id, title
		FROM chats
		WHERE user_id = ? AND LOWER(title) LIKE ?
		LIMIT ?
	`, userID, queryPattern, limit/2).Scan(&chats)

	for _, chat := range chats {
		items = append(items, QuickSwitcherItem{
			ID:       chat.ID,
			Type:     "chat",
			Title:    chat.Title,
			Subtitle: "AI Chat",
			Icon:     "💬",
			URL:      "/chat.html?id=" + chat.ID,
			Score:    100,
		})
	}

	// Search conversations
	var convs []struct {
		ID   string
		Name string
	}
	s.db.Raw(`
		SELECT DISTINCT c.id, c.name
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id
		WHERE cp.user_id = ? AND LOWER(c.name) LIKE ?
		LIMIT ?
	`, userID, queryPattern, limit/2).Scan(&convs)

	for _, conv := range convs {
		items = append(items, QuickSwitcherItem{
			ID:       conv.ID,
			Type:     "conversation",
			Title:    conv.Name,
			Subtitle: "Messenger",
			Icon:     "💬",
			URL:      "/messenger.html?conversation=" + conv.ID,
			Score:    90,
		})
	}

	return items, nil
}

// GenerateMetadata generates metadata JSON for search result
func (s *Service) GenerateMetadata(data interface{}) string {
	bytes, err := json.Marshal(data)
	if err != nil {
		return "{}"
	}
	return string(bytes)
}
