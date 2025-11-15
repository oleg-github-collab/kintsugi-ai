package messenger

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Conversation struct {
	ID           uuid.UUID          `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Type         string             `gorm:"type:varchar(20);not null" json:"type"` // direct, group
	Name         string             `gorm:"type:varchar(255)" json:"name,omitempty"`
	Avatar       string             `gorm:"type:text" json:"avatar,omitempty"`
	IsAIAgent    bool               `gorm:"default:false" json:"is_ai_agent"`
	CreatedBy    uuid.UUID          `gorm:"type:uuid" json:"created_by"`
	CreatedAt    time.Time          `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time          `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt    gorm.DeletedAt     `gorm:"index" json:"-"`
	Participants []Participant      `gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE" json:"participants,omitempty"`
	Messages     []ConversationMessage `gorm:"foreignKey:ConversationID;constraint:OnDelete:CASCADE" json:"messages,omitempty"`
}

type Participant struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ConversationID uuid.UUID `gorm:"type:uuid;not null;index" json:"conversation_id"`
	UserID         uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Role           string    `gorm:"type:varchar(20);default:'member'" json:"role"` // admin, member
	IsPinned       bool      `gorm:"default:false" json:"is_pinned"`
	IsMuted        bool      `gorm:"default:false" json:"is_muted"`
	IsArchived     bool      `gorm:"default:false" json:"is_archived"`
	JoinedAt       time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"joined_at"`
}

type ConversationMessage struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ConversationID uuid.UUID      `gorm:"type:uuid;not null;index" json:"conversation_id"`
	SenderID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"sender_id"`
	Content        string         `gorm:"type:text;not null" json:"content"`
	MessageType    string         `gorm:"type:varchar(20);default:'text'" json:"message_type"` // text, image, video, audio, file
	MediaURL       string         `gorm:"type:text" json:"media_url,omitempty"`
	ReplyToID      *uuid.UUID     `gorm:"type:uuid" json:"reply_to_id,omitempty"`
	IsEdited       bool           `gorm:"default:false" json:"is_edited"`
	IsForwarded    bool           `gorm:"default:false" json:"is_forwarded"`
	CreatedAt      time.Time      `gorm:"default:CURRENT_TIMESTAMP;index" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	Reactions      []Reaction     `gorm:"foreignKey:MessageID;constraint:OnDelete:CASCADE" json:"reactions,omitempty"`
	ReadReceipts   []ReadReceipt  `gorm:"foreignKey:MessageID;constraint:OnDelete:CASCADE" json:"read_receipts,omitempty"`
}

type Reaction struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	MessageID uuid.UUID `gorm:"type:uuid;not null;index" json:"message_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Emoji     string    `gorm:"type:varchar(10);not null" json:"emoji"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

type ReadReceipt struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	MessageID uuid.UUID `gorm:"type:uuid;not null;index" json:"message_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	ReadAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"read_at"`
}

type Story struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	MediaURL  string         `gorm:"type:text;not null" json:"media_url"`
	MediaType string         `gorm:"type:varchar(20);not null" json:"media_type"` // image, video
	Caption   string         `gorm:"type:text" json:"caption,omitempty"`
	ExpiresAt time.Time      `gorm:"not null;index" json:"expires_at"`
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Views     []StoryView    `gorm:"foreignKey:StoryID;constraint:OnDelete:CASCADE" json:"views,omitempty"`
}

type StoryView struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StoryID   uuid.UUID `gorm:"type:uuid;not null;index" json:"story_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	ViewedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"viewed_at"`
}

type InviteCode struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Code      string         `gorm:"type:varchar(50);unique;not null;index" json:"code"`
	CreatedBy uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`
	UsedBy    *uuid.UUID     `gorm:"type:uuid" json:"used_by,omitempty"`
	UsedAt    *time.Time     `json:"used_at,omitempty"`
	ExpiresAt time.Time      `gorm:"not null;index" json:"expires_at"`
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// DTOs and Requests

type CreateConversationRequest struct {
	Type          string      `json:"type" validate:"required,oneof=direct group"`
	Name          string      `json:"name,omitempty"`
	ParticipantIDs []uuid.UUID `json:"participant_ids" validate:"required,min=1"`
}

type SendMessageRequest struct {
	Content     string     `json:"content" validate:"required"`
	MessageType string     `json:"message_type,omitempty"`
	MediaURL    string     `json:"media_url,omitempty"`
	ReplyToID   *uuid.UUID `json:"reply_to_id,omitempty"`
}

type UpdateMessageRequest struct {
	Content string `json:"content" validate:"required"`
}

type AddReactionRequest struct {
	Emoji string `json:"emoji" validate:"required"`
}

type CreateStoryRequest struct {
	MediaURL  string `json:"media_url" validate:"required"`
	MediaType string `json:"media_type" validate:"required,oneof=image video"`
	Caption   string `json:"caption,omitempty"`
}

type WebSocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}
