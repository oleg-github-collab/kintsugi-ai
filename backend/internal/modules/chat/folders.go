package chat

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ChatFolder represents a folder for organizing chats
type ChatFolder struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Color       string         `gorm:"type:varchar(20)" json:"color"`      // Hex color
	Icon        string         `gorm:"type:varchar(50)" json:"icon"`       // Icon name/emoji
	Position    int            `gorm:"default:0" json:"position"`          // Order position
	IsSmartFolder bool         `gorm:"default:false" json:"is_smart_folder"` // Auto-categorization
	SmartRules  string         `gorm:"type:text" json:"smart_rules"`       // JSON rules for smart folders
	CreatedAt   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// ChatTag represents a tag that can be applied to chats
type ChatTag struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Name      string         `gorm:"type:varchar(50);not null" json:"name"`
	Color     string         `gorm:"type:varchar(20)" json:"color"`
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// ChatFolderAssignment links chats to folders
type ChatFolderAssignment struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ChatID    uuid.UUID `gorm:"type:uuid;not null;index" json:"chat_id"`
	FolderID  uuid.UUID `gorm:"type:uuid;not null;index" json:"folder_id"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// ChatTagAssignment links chats to tags
type ChatTagAssignment struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ChatID    uuid.UUID `gorm:"type:uuid;not null;index" json:"chat_id"`
	TagID     uuid.UUID `gorm:"type:uuid;not null;index" json:"tag_id"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// CodeExecution represents a code execution request
type CodeExecution struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	ChatID     uuid.UUID `gorm:"type:uuid;index" json:"chat_id,omitempty"`
	Language   string    `gorm:"type:varchar(20);not null" json:"language"` // python, javascript
	Code       string    `gorm:"type:text;not null" json:"code"`
	Output     string    `gorm:"type:text" json:"output"`
	Error      string    `gorm:"type:text" json:"error"`
	Status     string    `gorm:"type:varchar(20);default:'pending'" json:"status"` // pending, running, completed, failed
	ExecutedAt time.Time `gorm:"type:timestamptz" json:"executed_at,omitempty"`
	CreatedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// VoiceMessage represents a voice message
type VoiceMessage struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	MessageID    uuid.UUID `gorm:"type:uuid;index" json:"message_id,omitempty"` // Conversation message ID
	FileURL      string    `gorm:"type:varchar(500);not null" json:"file_url"`
	Duration     int       `gorm:"type:integer" json:"duration"` // Duration in seconds
	WaveformData string    `gorm:"type:text" json:"waveform_data"` // JSON array of amplitude values
	Transcription string   `gorm:"type:text" json:"transcription,omitempty"`
	CreatedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// FileAttachment represents a file attachment
type FileAttachment struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	MessageID   uuid.UUID `gorm:"type:uuid;index" json:"message_id,omitempty"`
	FileName    string    `gorm:"type:varchar(255);not null" json:"file_name"`
	FileType    string    `gorm:"type:varchar(100)" json:"file_type"` // MIME type
	FileSize    int64     `gorm:"type:bigint" json:"file_size"` // Size in bytes
	FileURL     string    `gorm:"type:varchar(500);not null" json:"file_url"`
	ThumbnailURL string   `gorm:"type:varchar(500)" json:"thumbnail_url,omitempty"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

// UsageAnalytics represents detailed usage statistics
type UsageAnalytics struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Date             time.Time `gorm:"type:date;not null;index" json:"date"`
	ChatTokens       int64     `gorm:"default:0" json:"chat_tokens"`
	TranslationChars int64     `gorm:"default:0" json:"translation_chars"`
	ImagesGenerated  int       `gorm:"default:0" json:"images_generated"`
	VoiceMessages    int       `gorm:"default:0" json:"voice_messages"`
	MessagesCount    int       `gorm:"default:0" json:"messages_count"`
	TimeSpentMinutes int       `gorm:"default:0" json:"time_spent_minutes"`
	CreatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

// Request/Response DTOs

type CreateFolderRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	Color       string `json:"color"`
	Icon        string `json:"icon"`
	IsSmartFolder bool `json:"is_smart_folder"`
	SmartRules  string `json:"smart_rules"`
}

type UpdateFolderRequest struct {
	Name       string `json:"name" validate:"min=1,max=100"`
	Color      string `json:"color"`
	Icon       string `json:"icon"`
	Position   *int   `json:"position"`
	SmartRules string `json:"smart_rules"`
}

type AssignChatToFolderRequest struct {
	ChatID   uuid.UUID `json:"chat_id" validate:"required"`
	FolderID uuid.UUID `json:"folder_id" validate:"required"`
}

type CreateTagRequest struct {
	Name  string `json:"name" validate:"required,min=1,max=50"`
	Color string `json:"color"`
}

type AssignTagRequest struct {
	ChatID uuid.UUID `json:"chat_id" validate:"required"`
	TagID  uuid.UUID `json:"tag_id" validate:"required"`
}

type ExecuteCodeRequest struct {
	Language string    `json:"language" validate:"required,oneof=python javascript"`
	Code     string    `json:"code" validate:"required"`
	ChatID   uuid.UUID `json:"chat_id"`
}

type UploadVoiceRequest struct {
	MessageID    uuid.UUID `json:"message_id"`
	Duration     int       `json:"duration"`
	WaveformData string    `json:"waveform_data"`
}

type SearchMessagesRequest struct {
	Query      string    `json:"query" validate:"required"`
	ChatID     uuid.UUID `json:"chat_id"`
	FromDate   string    `json:"from_date"`
	ToDate     string    `json:"to_date"`
	Sender     string    `json:"sender"`
	HasFiles   bool      `json:"has_files"`
	Limit      int       `json:"limit"`
	Offset     int       `json:"offset"`
}

type AnalyticsResponse struct {
	Daily   []UsageAnalytics `json:"daily"`
	Summary struct {
		TotalTokens      int64 `json:"total_tokens"`
		TotalChars       int64 `json:"total_chars"`
		TotalImages      int   `json:"total_images"`
		TotalVoice       int   `json:"total_voice"`
		TotalMessages    int   `json:"total_messages"`
		TotalTimeMinutes int   `json:"total_time_minutes"`
	} `json:"summary"`
	Breakdown struct {
		Chat        int64 `json:"chat"`
		Translation int64 `json:"translation"`
		Images      int   `json:"images"`
	} `json:"breakdown"`
}
