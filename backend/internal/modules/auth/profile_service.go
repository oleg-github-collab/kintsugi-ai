package auth

import (
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// UpdateProfile updates user's username and bio
func (s *Service) UpdateProfile(userID uuid.UUID, username, bio string) (*User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Check if username is already taken by another user
	if username != user.Username {
		existingUser, _ := s.repo.GetUserByUsername(username)
		if existingUser != nil && existingUser.ID != userID {
			return nil, errors.New("username already taken")
		}
	}

	user.Username = username
	user.Bio = bio

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

// UpdateAvatar updates user's avatar URL
func (s *Service) UpdateAvatar(userID uuid.UUID, avatarURL string) (*User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	user.AvatarURL = avatarURL

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

// ChangePassword changes user's password
func (s *Service) ChangePassword(userID uuid.UUID, newPassword string) error {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return errors.New("failed to hash password")
	}

	user.PasswordHash = string(hashedPassword)

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	return nil
}

// GetPreferences returns user's preferences
func (s *Service) GetPreferences(userID uuid.UUID) (map[string]interface{}, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if len(user.Preferences) == 0 {
		return make(map[string]interface{}), nil
	}

	var preferences map[string]interface{}
	if err := json.Unmarshal(user.Preferences, &preferences); err != nil {
		return make(map[string]interface{}), nil
	}

	return preferences, nil
}

// UpdatePreferences updates user's preferences
func (s *Service) UpdatePreferences(userID uuid.UUID, preferences map[string]interface{}) error {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	preferencesJSON, err := json.Marshal(preferences)
	if err != nil {
		return errors.New("failed to marshal preferences")
	}

	user.Preferences = JSONB(preferencesJSON)

	if err := s.repo.UpdateUser(user); err != nil {
		return err
	}

	return nil
}

// GetUsageStats returns user's usage statistics
func (s *Service) GetUsageStats(userID uuid.UUID) (map[string]interface{}, error) {
	// This would normally query from various tables
	// For now, returning mock data structure
	stats := map[string]interface{}{
		"total_messages":     0,
		"total_translations": 0,
		"total_ai_chats":     0,
		"total_groups":       0,
		"tokens_used":        0,
		"tokens_limit":       20000,
	}

	user, err := s.repo.GetUserByID(userID)
	if err == nil {
		stats["tokens_used"] = user.TokensUsed
		stats["tokens_limit"] = user.TokensLimit
	}

	// TODO: Query actual stats from messenger, chat, translation modules

	return stats, nil
}
