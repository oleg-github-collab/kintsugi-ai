package chat

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateChat(chat *Chat) error {
	return r.db.Create(chat).Error
}

func (r *Repository) GetChatByID(id uuid.UUID, userID uuid.UUID) (*Chat, error) {
	var chat Chat
	err := r.db.Where("id = ? AND user_id = ?", id, userID).
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at ASC")
		}).
		First(&chat).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("chat not found")
		}
		return nil, err
	}
	return &chat, nil
}

func (r *Repository) GetUserChats(userID uuid.UUID, limit, offset int) ([]Chat, error) {
	var chats []Chat
	err := r.db.Where("user_id = ?", userID).
		Order("updated_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&chats).Error

	if err != nil {
		return nil, err
	}
	return chats, nil
}

func (r *Repository) UpdateChat(chat *Chat) error {
	return r.db.Save(chat).Error
}

func (r *Repository) DeleteChat(id uuid.UUID, userID uuid.UUID) error {
	result := r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&Chat{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("chat not found")
	}
	return nil
}

func (r *Repository) CreateMessage(message *Message) error {
	return r.db.Create(message).Error
}

func (r *Repository) GetChatMessages(chatID uuid.UUID) ([]Message, error) {
	var messages []Message
	err := r.db.Where("chat_id = ?", chatID).
		Order("created_at ASC").
		Find(&messages).Error

	if err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *Repository) UpdateMessage(message *Message) error {
	return r.db.Save(message).Error
}

func (r *Repository) GetTotalTokensUsedToday(userID uuid.UUID) (int64, error) {
	var total int64
	err := r.db.Model(&Message{}).
		Joins("JOIN chats ON messages.chat_id = chats.id").
		Where("chats.user_id = ?", userID).
		Select("COALESCE(SUM(messages.tokens), 0)").
		Scan(&total).Error

	return total, err
}
