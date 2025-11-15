package messenger

import (
	"github.com/google/uuid"
)

// Group-related repository methods

func (r *Repository) IsParticipant(conversationID, userID uuid.UUID) bool {
	var count int64
	r.db.Model(&Participant{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Count(&count)
	return count > 0
}

func (r *Repository) GetParticipant(conversationID, userID uuid.UUID) (*Participant, error) {
	var participant Participant
	if err := r.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		First(&participant).Error; err != nil {
		return nil, err
	}
	return &participant, nil
}

func (r *Repository) GetParticipants(conversationID uuid.UUID) ([]Participant, error) {
	var participants []Participant
	if err := r.db.Where("conversation_id = ?", conversationID).
		Find(&participants).Error; err != nil {
		return nil, err
	}
	return participants, nil
}

func (r *Repository) AddParticipant(participant *Participant) error {
	return r.db.Create(participant).Error
}

func (r *Repository) RemoveParticipant(conversationID, userID uuid.UUID) error {
	return r.db.Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Delete(&Participant{}).Error
}

func (r *Repository) UpdateConversation(conversation *Conversation) error {
	return r.db.Save(conversation).Error
}

func (r *Repository) DeleteConversation(conversationID uuid.UUID) error {
	return r.db.Delete(&Conversation{}, conversationID).Error
}

func (r *Repository) CreateGroupInvite(invite *GroupInvite) error {
	return r.db.Create(invite).Error
}

func (r *Repository) GetGroupInviteByCode(code string) (*GroupInvite, error) {
	var invite GroupInvite
	if err := r.db.Where("code = ?", code).First(&invite).Error; err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *Repository) IncrementInviteUseCount(inviteID uuid.UUID) error {
	return r.db.Model(&GroupInvite{}).
		Where("id = ?", inviteID).
		Update("used_count", r.db.Raw("used_count + 1")).Error
}

// GetAllUsers returns all users (for group member selection)
func (r *Repository) GetAllUsers(limit int) ([]map[string]interface{}, error) {
	var users []map[string]interface{}

	// Query users table directly
	rows, err := r.db.Raw(`
		SELECT id, username, email, avatar_url
		FROM users
		WHERE deleted_at IS NULL
		ORDER BY username
		LIMIT ?`, limit).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id, username, email string
		var avatarURL *string

		if err := rows.Scan(&id, &username, &email, &avatarURL); err != nil {
			continue
		}

		user := map[string]interface{}{
			"id":       id,
			"username": username,
			"email":    email,
		}

		if avatarURL != nil {
			user["avatar_url"] = *avatarURL
		}

		users = append(users, user)
	}

	return users, nil
}
