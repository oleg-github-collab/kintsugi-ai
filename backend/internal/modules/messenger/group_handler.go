package messenger

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateGroup creates a new group conversation
func (h *Handler) CreateGroup(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req CreateGroupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validation
	if len(req.Name) < 3 || len(req.Name) > 255 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Group name must be between 3 and 255 characters",
		})
	}

	if len(req.ParticipantIDs) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "At least one participant is required",
		})
	}

	// Create conversation
	conversation := &Conversation{
		Type:        "group",
		Name:        req.Name,
		Description: req.Description,
		EnableVideo: req.EnableVideo,
		CreatedBy:   userID,
	}

	if err := h.repo.CreateConversation(conversation); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create group",
		})
	}

	// Add creator as admin
	creatorParticipant := &Participant{
		ConversationID: conversation.ID,
		UserID:         userID,
		Role:           "admin",
	}

	if err := h.repo.AddParticipant(creatorParticipant); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to add creator",
		})
	}

	// Add other participants
	for _, participantID := range req.ParticipantIDs {
		if participantID == userID {
			continue // Skip creator
		}

		participant := &Participant{
			ConversationID: conversation.ID,
			UserID:         participantID,
			Role:           "member",
		}

		if err := h.repo.AddParticipant(participant); err != nil {
			continue // Skip if error
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"group": conversation,
	})
}

// GetGroup returns group details
func (h *Handler) GetGroup(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is participant
	if !h.repo.IsParticipant(groupID, userID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Not a member of this group",
		})
	}

	conversation, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	return c.JSON(fiber.Map{
		"group": conversation,
	})
}

// UpdateGroup updates group info
func (h *Handler) UpdateGroup(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is admin
	participant, err := h.repo.GetParticipant(groupID, userID)
	if err != nil || participant.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only admins can update group",
		})
	}

	var req UpdateGroupRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	conversation, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	conversation.Name = req.Name
	conversation.Description = req.Description

	if err := h.repo.UpdateConversation(conversation); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update group",
		})
	}

	return c.JSON(fiber.Map{
		"group": conversation,
	})
}

// DeleteGroup deletes a group
func (h *Handler) DeleteGroup(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	conversation, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	// Only creator can delete
	if conversation.CreatedBy != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only group creator can delete the group",
		})
	}

	if err := h.repo.DeleteConversation(groupID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete group",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Group deleted successfully",
	})
}

// GetGroupMembers returns list of group members
func (h *Handler) GetGroupMembers(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is participant
	if !h.repo.IsParticipant(groupID, userID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Not a member of this group",
		})
	}

	members, err := h.repo.GetParticipants(groupID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get members",
		})
	}

	return c.JSON(fiber.Map{
		"members": members,
	})
}

// AddGroupMembers adds new members to group
func (h *Handler) AddGroupMembers(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is admin
	participant, err := h.repo.GetParticipant(groupID, userID)
	if err != nil || participant.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only admins can add members",
		})
	}

	var req AddGroupMembersRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	for _, newUserID := range req.UserIDs {
		// Skip if already member
		if h.repo.IsParticipant(groupID, newUserID) {
			continue
		}

		newParticipant := &Participant{
			ConversationID: groupID,
			UserID:         newUserID,
			Role:           "member",
		}

		h.repo.AddParticipant(newParticipant)
	}

	return c.JSON(fiber.Map{
		"message": "Members added successfully",
	})
}

// RemoveGroupMember removes a member from group
func (h *Handler) RemoveGroupMember(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	memberID, err := uuid.Parse(c.Params("userId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID",
		})
	}

	// Check if requester is admin
	participant, err := h.repo.GetParticipant(groupID, userID)
	if err != nil || participant.Role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only admins can remove members",
		})
	}

	// Cannot remove creator
	conversation, _ := h.repo.GetConversationByID(groupID)
	if conversation != nil && conversation.CreatedBy == memberID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Cannot remove group creator",
		})
	}

	if err := h.repo.RemoveParticipant(groupID, memberID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to remove member",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Member removed successfully",
	})
}

// GenerateGroupInvite generates an invite link for the group
func (h *Handler) GenerateGroupInvite(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is participant
	if !h.repo.IsParticipant(groupID, userID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Not a member of this group",
		})
	}

	// Generate random code
	b := make([]byte, 16)
	rand.Read(b)
	code := base64.URLEncoding.EncodeToString(b)[:16]

	invite := &GroupInvite{
		GroupID:   groupID,
		Code:      code,
		CreatedBy: userID,
		MaxUses:   0, // Unlimited
	}

	if err := h.repo.CreateGroupInvite(invite); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create invite",
		})
	}

	return c.JSON(fiber.Map{
		"invite_code": code,
		"invite_link": fmt.Sprintf("/join-group?code=%s", code),
	})
}

// LeaveGroup allows user to leave a group
func (h *Handler) LeaveGroup(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Cannot leave if creator
	conversation, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	if conversation.CreatedBy == userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Group creator cannot leave. Delete the group instead.",
		})
	}

	if err := h.repo.RemoveParticipant(groupID, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to leave group",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Left group successfully",
	})
}

// Generate100msToken generates a token for video conference
func (h *Handler) Generate100msToken(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	// Check if user is participant
	if !h.repo.IsParticipant(groupID, userID) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Not a member of this group",
		})
	}

	// Check if video is enabled for group
	conversation, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	if !conversation.EnableVideo {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Video calls are not enabled for this group",
		})
	}

	var req VideoTokenRequest
	if err := c.BodyParser(&req); err != nil {
		req.UserName = "User" // Default name
	}

	// TODO: Implement actual 100ms token generation
	// This requires 100ms credentials and SDK
	token := "mock-100ms-token-" + groupID.String()

	return c.JSON(fiber.Map{
		"token":    token,
		"room_id":  groupID.String(),
		"user_id":  userID.String(),
		"username": req.UserName,
		"expires_at": time.Now().Add(24 * time.Hour),
	})
}

// Generate100msGuestToken generates a token for guest to join video call
func (h *Handler) Generate100msGuestToken(c *fiber.Ctx) error {
	groupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid group ID",
		})
	}

	var req VideoTokenRequest
	if err := c.BodyParser(&req); err != nil || req.UserName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Username is required",
		})
	}

	// Check if video is enabled for group
	conversation, err := h.repo.GetConversationByID(groupID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Group not found",
		})
	}

	if !conversation.EnableVideo {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Video calls are not enabled for this group",
		})
	}

	// TODO: Implement actual 100ms guest token generation
	guestID := uuid.New()
	token := "mock-100ms-guest-token-" + groupID.String()

	return c.JSON(fiber.Map{
		"token":    token,
		"room_id":  groupID.String(),
		"user_id":  guestID.String(),
		"username": req.UserName,
		"is_guest": true,
		"expires_at": time.Now().Add(24 * time.Hour),
	})
}


// GetAllUsers returns all users for group member selection
func (h *Handler) GetAllUsers(c *fiber.Ctx) error {
	users, err := h.repo.GetAllUsers(100) // Limit to 100 users
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get users",
		})
	}

	return c.JSON(fiber.Map{
		"users": users,
	})
}
