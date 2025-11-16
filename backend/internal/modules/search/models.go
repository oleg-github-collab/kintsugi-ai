package search

import (
	"time"

	"github.com/google/uuid"
)

// SearchResult represents a unified search result
type SearchResult struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"` // chat, message, translation, user, file
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	Highlight   string    `json:"highlight"`
	Score       float64   `json:"score"`
	Module      string    `json:"module"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	URL         string    `json:"url"`
	Metadata    string    `json:"metadata"` // JSON metadata
}

// SearchRequest represents a search query
type SearchRequest struct {
	Query       string   `json:"query"`
	Modules     []string `json:"modules"`      // chat, messenger, translation, files
	Limit       int      `json:"limit"`
	Offset      int      `json:"offset"`
	SortBy      string   `json:"sort_by"`      // relevance, date, title
	DateFrom    string   `json:"date_from"`
	DateTo      string   `json:"date_to"`
	FileTypes   []string `json:"file_types"`
}

// SearchResponse represents search results
type SearchResponse struct {
	Results    []SearchResult `json:"results"`
	Total      int            `json:"total"`
	Query      string         `json:"query"`
	TimeTaken  float64        `json:"time_taken_ms"`
	Suggestions []string      `json:"suggestions"`
}

// RecentItem represents a recently accessed item
type RecentItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	ItemType  string    `gorm:"type:varchar(50);not null" json:"item_type"` // chat, message, translation, file
	ItemID    uuid.UUID `gorm:"type:uuid;not null" json:"item_id"`
	Title     string    `gorm:"type:varchar(255)" json:"title"`
	URL       string    `gorm:"type:varchar(500)" json:"url"`
	AccessedAt time.Time `gorm:"type:timestamptz;default:CURRENT_TIMESTAMP" json:"accessed_at"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// Suggestion represents an AI-powered suggestion
type Suggestion struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Type       string    `gorm:"type:varchar(50);not null" json:"type"` // action, content, user, feature
	Title      string    `gorm:"type:varchar(255);not null" json:"title"`
	Description string   `gorm:"type:text" json:"description"`
	Action     string    `gorm:"type:varchar(255)" json:"action"` // URL or action identifier
	Confidence float64   `gorm:"type:decimal(3,2)" json:"confidence"`
	IsRead     bool      `gorm:"default:false" json:"is_read"`
	CreatedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// QuickSwitcherItem represents an item in quick switcher
type QuickSwitcherItem struct {
	ID       string `json:"id"`
	Type     string `json:"type"` // chat, user, file, command
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Icon     string `json:"icon"`
	URL      string `json:"url"`
	Score    int    `json:"score"`
}
