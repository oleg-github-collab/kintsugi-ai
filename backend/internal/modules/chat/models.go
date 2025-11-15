package chat

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Chat struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Title     string         `gorm:"type:varchar(255);default:'New Chat'" json:"title"`
	Model     string         `gorm:"type:varchar(50);default:'gpt-4o'" json:"model"`
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Messages  []Message      `gorm:"foreignKey:ChatID;constraint:OnDelete:CASCADE" json:"messages,omitempty"`
}

type Message struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ChatID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"chat_id"`
	Role      string         `gorm:"type:varchar(20);not null" json:"role"` // user, assistant, system
	Content   string         `gorm:"type:text;not null" json:"content"`
	Tokens    int            `gorm:"default:0" json:"tokens"`
	Model     string         `gorm:"type:varchar(50)" json:"model,omitempty"`
	CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type CreateChatRequest struct {
	Title string `json:"title"`
	Model string `json:"model" validate:"required"`
}

type UpdateChatRequest struct {
	Title string `json:"title"`
	Model string `json:"model"`
}

type SendMessageRequest struct {
	Content      string `json:"content" validate:"required"`
	SystemPrompt string `json:"system_prompt,omitempty"`
}

type ChatResponse struct {
	ID        uuid.UUID    `json:"id"`
	UserID    uuid.UUID    `json:"user_id"`
	Title     string       `json:"title"`
	Model     string       `json:"model"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	Messages  []MessageDTO `json:"messages"`
}

type MessageDTO struct {
	ID        uuid.UUID `json:"id"`
	ChatID    uuid.UUID `json:"chat_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	Tokens    int       `json:"tokens"`
	Model     string    `json:"model,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type StreamChunk struct {
	Delta      string `json:"delta"`
	MessageID  string `json:"message_id"`
	Done       bool   `json:"done"`
	TotalTokens int   `json:"total_tokens,omitempty"`
}

func (c *Chat) ToDTO() *ChatResponse {
	messages := make([]MessageDTO, len(c.Messages))
	for i, msg := range c.Messages {
		messages[i] = MessageDTO{
			ID:        msg.ID,
			ChatID:    msg.ChatID,
			Role:      msg.Role,
			Content:   msg.Content,
			Tokens:    msg.Tokens,
			Model:     msg.Model,
			CreatedAt: msg.CreatedAt,
		}
	}

	return &ChatResponse{
		ID:        c.ID,
		UserID:    c.UserID,
		Title:     c.Title,
		Model:     c.Model,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
		Messages:  messages,
	}
}
