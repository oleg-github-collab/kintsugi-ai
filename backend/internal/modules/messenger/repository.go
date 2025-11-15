package messenger

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Conversations

func (r *Repository) CreateConversation(conversation *Conversation) error {
	return r.db.Create(conversation).Error
}

func (r *Repository) GetConversationByID(id uuid.UUID) (*Conversation, error) {
	var conversation Conversation
	err := r.db.Where("id = ?", id).
		Preload("Participants").
		First(&conversation).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("conversation not found")
		}
		return nil, err
	}
	return &conversation, nil
}

func (r *Repository) GetUserConversations(userID uuid.UUID) ([]Conversation, error) {
	var conversations []Conversation
	err := r.db.
		Joins("JOIN participants ON participants.conversation_id = conversations.id").
		Where("participants.user_id = ? AND participants.is_archived = ?", userID, false).
		Preload("Participants").
		Order("conversations.updated_at DESC").
		Find(&conversations).Error

	return conversations, err
}

func (r *Repository) UpdateConversation(conversation *Conversation) error {
	return r.db.Save(conversation).Error
}

func (r *Repository) DeleteConversation(id uuid.UUID) error {
	return r.db.Delete(&Conversation{}, id).Error
}

// Participants

func (r *Repository) AddParticipant(participant *Participant) error {
	return r.db.Create(participant).Error
}

func (r *Repository) GetParticipant(conversationID, userID uuid.UUID) (*Participant, error) {
	var participant Participant
	err := r.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		First(&participant).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("participant not found")
		}
		return nil, err
	}
	return &participant, nil
}

func (r *Repository) UpdateParticipant(participant *Participant) error {
	return r.db.Save(participant).Error
}

func (r *Repository) RemoveParticipant(conversationID, userID uuid.UUID) error {
	return r.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Delete(&Participant{}).Error
}

func (r *Repository) IsParticipant(conversationID, userID uuid.UUID) bool {
	var count int64
	r.db.Model(&Participant{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Count(&count)
	return count > 0
}

// Messages

func (r *Repository) CreateMessage(message *ConversationMessage) error {
	return r.db.Create(message).Error
}

func (r *Repository) GetMessageByID(id uuid.UUID) (*ConversationMessage, error) {
	var message ConversationMessage
	err := r.db.Where("id = ?", id).
		Preload("Reactions").
		Preload("ReadReceipts").
		First(&message).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("message not found")
		}
		return nil, err
	}
	return &message, nil
}

func (r *Repository) GetConversationMessages(conversationID uuid.UUID, limit, offset int) ([]ConversationMessage, error) {
	var messages []ConversationMessage
	err := r.db.Where("conversation_id = ?", conversationID).
		Preload("Reactions").
		Preload("ReadReceipts").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error

	return messages, err
}

func (r *Repository) UpdateMessage(message *ConversationMessage) error {
	return r.db.Save(message).Error
}

func (r *Repository) DeleteMessage(id uuid.UUID) error {
	return r.db.Delete(&ConversationMessage{}, id).Error
}

// Reactions

func (r *Repository) AddReaction(reaction *Reaction) error {
	return r.db.Create(reaction).Error
}

func (r *Repository) RemoveReaction(messageID, userID uuid.UUID, emoji string) error {
	return r.db.Where("message_id = ? AND user_id = ? AND emoji = ?", messageID, userID, emoji).
		Delete(&Reaction{}).Error
}

func (r *Repository) GetReactionExists(messageID, userID uuid.UUID, emoji string) bool {
	var count int64
	r.db.Model(&Reaction{}).
		Where("message_id = ? AND user_id = ? AND emoji = ?", messageID, userID, emoji).
		Count(&count)
	return count > 0
}

// Read Receipts

func (r *Repository) MarkAsRead(messageID, userID uuid.UUID) error {
	// Check if already exists
	var count int64
	r.db.Model(&ReadReceipt{}).
		Where("message_id = ? AND user_id = ?", messageID, userID).
		Count(&count)

	if count > 0 {
		return nil
	}

	receipt := &ReadReceipt{
		MessageID: messageID,
		UserID:    userID,
	}
	return r.db.Create(receipt).Error
}

func (r *Repository) GetUnreadCount(conversationID, userID uuid.UUID) (int64, error) {
	// Get user's last read message timestamp
	var lastRead time.Time
	err := r.db.Model(&ReadReceipt{}).
		Joins("JOIN conversation_messages ON read_receipts.message_id = conversation_messages.id").
		Where("conversation_messages.conversation_id = ? AND read_receipts.user_id = ?", conversationID, userID).
		Select("MAX(read_receipts.read_at)").
		Scan(&lastRead).Error

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, err
	}

	// Count unread messages
	var count int64
	r.db.Model(&ConversationMessage{}).
		Where("conversation_id = ? AND sender_id != ? AND created_at > ?", conversationID, userID, lastRead).
		Count(&count)

	return count, nil
}

// Stories

func (r *Repository) CreateStory(story *Story) error {
	return r.db.Create(story).Error
}

func (r *Repository) GetActiveStories(userID uuid.UUID) ([]Story, error) {
	var stories []Story
	now := time.Now()
	err := r.db.Where("user_id = ? AND expires_at > ?", userID, now).
		Preload("Views").
		Order("created_at DESC").
		Find(&stories).Error

	return stories, err
}

func (r *Repository) GetStoryByID(id uuid.UUID) (*Story, error) {
	var story Story
	err := r.db.Where("id = ?", id).
		Preload("Views").
		First(&story).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("story not found")
		}
		return nil, err
	}
	return &story, nil
}

func (r *Repository) AddStoryView(view *StoryView) error {
	// Check if already viewed
	var count int64
	r.db.Model(&StoryView{}).
		Where("story_id = ? AND user_id = ?", view.StoryID, view.UserID).
		Count(&count)

	if count > 0 {
		return nil
	}

	return r.db.Create(view).Error
}

func (r *Repository) DeleteStory(id, userID uuid.UUID) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).
		Delete(&Story{}).Error
}

// Search users by email or username
func (r *Repository) SearchUsers(query string) ([]map[string]interface{}, error) {
	var users []map[string]interface{}

	err := r.db.Table("users").
		Select("id, username, email").
		Where("email ILIKE ? OR username ILIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(20).
		Scan(&users).Error

	return users, err
}

// Create invite
func (r *Repository) CreateInvite(userID uuid.UUID, inviteCode string) error {
	invite := &InviteCode{
		Code:      inviteCode,
		CreatedBy: userID,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour), // 7 days expiry
	}
	return r.db.Create(invite).Error
}
