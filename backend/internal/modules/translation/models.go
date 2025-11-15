package translation

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Translation struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	SourceLanguage  string         `gorm:"type:varchar(10);not null" json:"source_language"`
	TargetLanguage  string         `gorm:"type:varchar(10);not null" json:"target_language"`
	SourceText      string         `gorm:"type:text;not null" json:"source_text"`
	TranslatedText  string         `gorm:"type:text" json:"translated_text"`
	CharCount       int            `gorm:"not null" json:"char_count"`
	ChunkCount      int            `gorm:"default:1" json:"chunk_count"` // For books split into chunks
	Service         string         `gorm:"type:varchar(20);not null" json:"service"` // deepl, otranslator
	Plan            string         `gorm:"type:varchar(50);not null" json:"plan"` // Kintsugi Basic, Kintsugi Epic
	Cost            float64        `gorm:"type:decimal(10,4)" json:"cost"`
	Status          string         `gorm:"type:varchar(20);default:'pending'" json:"status"` // pending, processing, completed, failed
	ErrorMessage    string         `gorm:"type:text" json:"error_message,omitempty"`
	CreatedAt       time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	CompletedAt     *time.Time     `json:"completed_at,omitempty"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

type TranslationRequest struct {
	SourceLanguage string `json:"source_language" validate:"required"`
	TargetLanguage string `json:"target_language" validate:"required"`
	Text           string `json:"text" validate:"required"`
	Service        string `json:"service" validate:"required,oneof=deepl otranslator"`
}

type TranslationResponse struct {
	ID             uuid.UUID  `json:"id"`
	SourceLanguage string     `json:"source_language"`
	TargetLanguage string     `json:"target_language"`
	SourceText     string     `json:"source_text"`
	TranslatedText string     `json:"translated_text"`
	CharCount      int        `json:"char_count"`
	ChunkCount     int        `json:"chunk_count"`
	Service        string     `json:"service"`
	Plan           string     `json:"plan"`
	Cost           float64    `json:"cost"`
	Status         string     `json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`
}

type PricingInfo struct {
	Service         string  `json:"service"`
	Plan            string  `json:"plan"`
	PricePer1800    float64 `json:"price_per_1800_chars"`
	EstimatedCost   float64 `json:"estimated_cost"`
	EstimatedChunks int     `json:"estimated_chunks"`
}

func (t *Translation) ToResponse() *TranslationResponse {
	return &TranslationResponse{
		ID:             t.ID,
		SourceLanguage: t.SourceLanguage,
		TargetLanguage: t.TargetLanguage,
		SourceText:     t.SourceText,
		TranslatedText: t.TranslatedText,
		CharCount:      t.CharCount,
		ChunkCount:     t.ChunkCount,
		Service:        t.Service,
		Plan:           t.Plan,
		Cost:           t.Cost,
		Status:         t.Status,
		CreatedAt:      t.CreatedAt,
		CompletedAt:    t.CompletedAt,
	}
}
