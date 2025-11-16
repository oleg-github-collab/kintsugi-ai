package messenger

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
	hub  *Hub
}

func NewService(repo *Repository, hub *Hub) *Service {
	return &Service{
		repo: repo,
		hub:  hub,
	}
}

// Conversations

func (s *Service) CreateConversation(userID uuid.UUID, req *CreateConversationRequest) (*Conversation, error) {
	// Create conversation
	conversation := &Conversation{
		Type:      req.Type,
		Name:      req.Name,
		CreatedBy: userID,
	}

	if err := s.repo.CreateConversation(conversation); err != nil {
		return nil, err
	}

	// Add creator as admin
	creator := &Participant{
		ConversationID: conversation.ID,
		UserID:         userID,
		Role:           "admin",
	}

	if err := s.repo.AddParticipant(creator); err != nil {
		return nil, err
	}

	// Add other participants
	for _, participantID := range req.ParticipantIDs {
		if participantID == userID {
			continue
		}

		participant := &Participant{
			ConversationID: conversation.ID,
			UserID:         participantID,
			Role:           "member",
		}

		if err := s.repo.AddParticipant(participant); err != nil {
			return nil, err
		}
	}

	// Reload with participants
	return s.repo.GetConversationByID(conversation.ID)
}

func (s *Service) GetConversation(conversationID, userID uuid.UUID) (*Conversation, error) {
	// Verify user is participant
	if !s.repo.IsParticipant(conversationID, userID) {
		return nil, errors.New("not a participant")
	}

	return s.repo.GetConversationByID(conversationID)
}

func (s *Service) GetUserConversations(userID uuid.UUID) ([]Conversation, error) {
	return s.repo.GetUserConversations(userID)
}

func (s *Service) AddParticipant(conversationID, requesterID, newParticipantID uuid.UUID) error {
	// Verify requester is admin
	requester, err := s.repo.GetParticipant(conversationID, requesterID)
	if err != nil {
		return err
	}

	if requester.Role != "admin" {
		return errors.New("only admins can add participants")
	}

	// Check if already participant
	if s.repo.IsParticipant(conversationID, newParticipantID) {
		return errors.New("user already in conversation")
	}

	participant := &Participant{
		ConversationID: conversationID,
		UserID:         newParticipantID,
		Role:           "member",
	}

	return s.repo.AddParticipant(participant)
}

func (s *Service) RemoveParticipant(conversationID, requesterID, participantID uuid.UUID) error {
	// Allow users to remove themselves, or admins to remove others
	if requesterID != participantID {
		requester, err := s.repo.GetParticipant(conversationID, requesterID)
		if err != nil {
			return err
		}

		if requester.Role != "admin" {
			return errors.New("only admins can remove other participants")
		}
	}

	return s.repo.RemoveParticipant(conversationID, participantID)
}

func (s *Service) UpdateParticipantSettings(conversationID, userID uuid.UUID, isPinned, isMuted, isArchived *bool) error {
	participant, err := s.repo.GetParticipant(conversationID, userID)
	if err != nil {
		return err
	}

	if isPinned != nil {
		participant.IsPinned = *isPinned
	}
	if isMuted != nil {
		participant.IsMuted = *isMuted
	}
	if isArchived != nil {
		participant.IsArchived = *isArchived
	}

	return s.repo.UpdateParticipant(participant)
}

// Messages

func (s *Service) SendMessage(conversationID, userID uuid.UUID, req *SendMessageRequest) (*ConversationMessage, error) {
	// Verify user is participant
	if !s.repo.IsParticipant(conversationID, userID) {
		return nil, errors.New("not a participant")
	}

	messageType := req.MessageType
	if messageType == "" {
		messageType = "text"
	}

	message := &ConversationMessage{
		ConversationID: conversationID,
		SenderID:       userID,
		Content:        req.Content,
		MessageType:    messageType,
		MediaURL:       req.MediaURL,
		ReplyToID:      req.ReplyToID,
	}

	if err := s.repo.CreateMessage(message); err != nil {
		return nil, err
	}

	// Update conversation timestamp
	conversation, _ := s.repo.GetConversationByID(conversationID)
	conversation.UpdatedAt = time.Now()
	s.repo.UpdateConversation(conversation)

	// Get all participant IDs for broadcast
	participantIDs := make([]uuid.UUID, 0)
	for _, p := range conversation.Participants {
		participantIDs = append(participantIDs, p.UserID)
	}

	// Broadcast to all participants via WebSocket
	s.hub.BroadcastToUsers(participantIDs, "new_message", message)

	// Reload with relations
	return s.repo.GetMessageByID(message.ID)
}

func (s *Service) GetMessages(conversationID, userID uuid.UUID, limit, offset int) ([]ConversationMessage, error) {
	// Verify user is participant
	if !s.repo.IsParticipant(conversationID, userID) {
		return nil, errors.New("not a participant")
	}

	if limit <= 0 || limit > 100 {
		limit = 50
	}

	return s.repo.GetConversationMessages(conversationID, limit, offset)
}

func (s *Service) UpdateMessage(messageID, userID uuid.UUID, req *UpdateMessageRequest) (*ConversationMessage, error) {
	message, err := s.repo.GetMessageByID(messageID)
	if err != nil {
		return nil, err
	}

	// Verify user is sender
	if message.SenderID != userID {
		return nil, errors.New("not authorized to edit this message")
	}

	message.Content = req.Content
	message.IsEdited = true

	if err := s.repo.UpdateMessage(message); err != nil {
		return nil, err
	}

	// Broadcast update via WebSocket
	conversation, _ := s.repo.GetConversationByID(message.ConversationID)
	participantIDs := make([]uuid.UUID, 0)
	for _, p := range conversation.Participants {
		participantIDs = append(participantIDs, p.UserID)
	}
	s.hub.BroadcastToUsers(participantIDs, "message_updated", message)

	return message, nil
}

func (s *Service) DeleteMessage(messageID, userID uuid.UUID, deleteFor string) error {
	message, err := s.repo.GetMessageByID(messageID)
	if err != nil {
		return err
	}

	// Verify user is sender (for "everyone") or participant (for "me")
	if deleteFor == "everyone" && message.SenderID != userID {
		return errors.New("only the sender can delete for everyone")
	}

	// Broadcast deletion via WebSocket
	conversation, _ := s.repo.GetConversationByID(message.ConversationID)
	participantIDs := make([]uuid.UUID, 0)
	for _, p := range conversation.Participants {
		participantIDs = append(participantIDs, p.UserID)
	}

	if deleteFor == "everyone" {
		// Broadcast to all participants
		s.hub.BroadcastToUsers(participantIDs, "message_deleted", map[string]interface{}{
			"message_id":      messageID,
			"conversation_id": message.ConversationID,
			"deleted_for":     "everyone",
		})

		// Actually delete the message from database
		return s.repo.DeleteMessage(messageID)
	} else {
		// Delete for specific user only (broadcast only to that user)
		s.hub.BroadcastToUsers([]uuid.UUID{userID}, "message_deleted", map[string]interface{}{
			"message_id":      messageID,
			"conversation_id": message.ConversationID,
			"deleted_for":     "me",
		})

		// In a full implementation, you would mark this message as hidden for this specific user
		// For now, we'll just broadcast the event
		return nil
	}
}

// Reactions

func (s *Service) AddReaction(messageID, userID uuid.UUID, req *AddReactionRequest) error {
	message, err := s.repo.GetMessageByID(messageID)
	if err != nil {
		return err
	}

	// Verify user is participant
	if !s.repo.IsParticipant(message.ConversationID, userID) {
		return errors.New("not a participant")
	}

	// Check if reaction already exists
	if s.repo.GetReactionExists(messageID, userID, req.Emoji) {
		return errors.New("reaction already exists")
	}

	reaction := &Reaction{
		MessageID: messageID,
		UserID:    userID,
		Emoji:     req.Emoji,
	}

	if err := s.repo.AddReaction(reaction); err != nil {
		return err
	}

	// Broadcast reaction via WebSocket
	conversation, _ := s.repo.GetConversationByID(message.ConversationID)
	participantIDs := make([]uuid.UUID, 0)
	for _, p := range conversation.Participants {
		participantIDs = append(participantIDs, p.UserID)
	}
	s.hub.BroadcastToUsers(participantIDs, "reaction_added", reaction)

	return nil
}

func (s *Service) RemoveReaction(messageID, userID uuid.UUID, emoji string) error {
	message, err := s.repo.GetMessageByID(messageID)
	if err != nil {
		return err
	}

	// Broadcast reaction removal via WebSocket
	conversation, _ := s.repo.GetConversationByID(message.ConversationID)
	participantIDs := make([]uuid.UUID, 0)
	for _, p := range conversation.Participants {
		participantIDs = append(participantIDs, p.UserID)
	}
	s.hub.BroadcastToUsers(participantIDs, "reaction_removed", map[string]interface{}{
		"message_id": messageID,
		"user_id":    userID,
		"emoji":      emoji,
	})

	return s.repo.RemoveReaction(messageID, userID, emoji)
}

func (s *Service) MarkAsRead(messageID, userID uuid.UUID) error {
	message, err := s.repo.GetMessageByID(messageID)
	if err != nil {
		return err
	}

	// Verify user is participant
	if !s.repo.IsParticipant(message.ConversationID, userID) {
		return errors.New("not a participant")
	}

	return s.repo.MarkAsRead(messageID, userID)
}

// Stories

func (s *Service) CreateStory(userID uuid.UUID, req *CreateStoryRequest) (*Story, error) {
	story := &Story{
		UserID:    userID,
		MediaURL:  req.MediaURL,
		MediaType: req.MediaType,
		Caption:   req.Caption,
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	if err := s.repo.CreateStory(story); err != nil {
		return nil, err
	}

	return story, nil
}

func (s *Service) GetUserStories(userID uuid.UUID) ([]Story, error) {
	return s.repo.GetActiveStories(userID)
}

func (s *Service) ViewStory(storyID, viewerID uuid.UUID) error {
	story, err := s.repo.GetStoryByID(storyID)
	if err != nil {
		return err
	}

	// Don't record view if user is viewing their own story
	if story.UserID == viewerID {
		return nil
	}

	view := &StoryView{
		StoryID: storyID,
		UserID:  viewerID,
	}

	return s.repo.AddStoryView(view)
}

func (s *Service) DeleteStory(storyID, userID uuid.UUID) error {
	return s.repo.DeleteStory(storyID, userID)
}

// Search users
func (s *Service) SearchUsers(query string) ([]map[string]interface{}, error) {
	return s.repo.SearchUsers(query)
}

// Create invite
func (s *Service) CreateInvite(userID uuid.UUID) (string, error) {
	inviteCode := uuid.New().String()[:8]
	return inviteCode, s.repo.CreateInvite(userID, inviteCode)
}
