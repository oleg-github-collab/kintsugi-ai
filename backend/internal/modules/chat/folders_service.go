package chat

import (
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FoldersService struct {
	db *gorm.DB
}

func NewFoldersService(db *gorm.DB) *FoldersService {
	return &FoldersService{db: db}
}

// Folder Management

func (s *FoldersService) CreateFolder(userID uuid.UUID, req *CreateFolderRequest) (*ChatFolder, error) {
	// Validate folder name
	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("folder name is required")
	}

	// Check for duplicate folder name for this user
	var existingFolder ChatFolder
	err := s.db.Where("user_id = ? AND name = ?", userID, req.Name).First(&existingFolder).Error
	if err == nil {
		return nil, errors.New("folder with this name already exists")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Get max position for ordering
	var maxPosition int
	s.db.Model(&ChatFolder{}).
		Where("user_id = ?", userID).
		Select("COALESCE(MAX(position), -1)").
		Scan(&maxPosition)

	folder := &ChatFolder{
		UserID:        userID,
		Name:          req.Name,
		Color:         req.Color,
		Icon:          req.Icon,
		IsSmartFolder: req.IsSmartFolder,
		SmartRules:    req.SmartRules,
		Position:      maxPosition + 1,
	}

	if err := s.db.Create(folder).Error; err != nil {
		return nil, err
	}

	return folder, nil
}

func (s *FoldersService) UpdateFolder(folderID, userID uuid.UUID, req *UpdateFolderRequest) (*ChatFolder, error) {
	var folder ChatFolder
	err := s.db.Where("id = ? AND user_id = ?", folderID, userID).First(&folder).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("folder not found")
		}
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		// Check for duplicate name
		var existingFolder ChatFolder
		err := s.db.Where("user_id = ? AND name = ? AND id != ?", userID, req.Name, folderID).First(&existingFolder).Error
		if err == nil {
			return nil, errors.New("folder with this name already exists")
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
		folder.Name = req.Name
	}

	if req.Color != "" {
		folder.Color = req.Color
	}

	if req.Icon != "" {
		folder.Icon = req.Icon
	}

	if req.Position != nil {
		folder.Position = *req.Position
	}

	if req.SmartRules != "" {
		folder.SmartRules = req.SmartRules
	}

	folder.UpdatedAt = time.Now()

	if err := s.db.Save(&folder).Error; err != nil {
		return nil, err
	}

	return &folder, nil
}

func (s *FoldersService) DeleteFolder(folderID, userID uuid.UUID) error {
	// First remove all chat assignments
	if err := s.db.Where("folder_id = ?", folderID).Delete(&ChatFolderAssignment{}).Error; err != nil {
		return err
	}

	// Then delete the folder
	result := s.db.Where("id = ? AND user_id = ?", folderID, userID).Delete(&ChatFolder{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("folder not found")
	}

	return nil
}

func (s *FoldersService) GetUserFolders(userID uuid.UUID) ([]ChatFolder, error) {
	var folders []ChatFolder
	err := s.db.Where("user_id = ?", userID).
		Order("position ASC, created_at ASC").
		Find(&folders).Error

	if err != nil {
		return nil, err
	}

	return folders, nil
}

// Chat-Folder Assignment

func (s *FoldersService) AssignChatToFolder(chatID, folderID, userID uuid.UUID) error {
	// Verify chat belongs to user
	var chat Chat
	if err := s.db.Where("id = ? AND user_id = ?", chatID, userID).First(&chat).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("chat not found")
		}
		return err
	}

	// Verify folder belongs to user
	var folder ChatFolder
	if err := s.db.Where("id = ? AND user_id = ?", folderID, userID).First(&folder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("folder not found")
		}
		return err
	}

	// Check if assignment already exists
	var existingAssignment ChatFolderAssignment
	err := s.db.Where("chat_id = ? AND folder_id = ?", chatID, folderID).First(&existingAssignment).Error
	if err == nil {
		return errors.New("chat is already assigned to this folder")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	// Create assignment
	assignment := &ChatFolderAssignment{
		ChatID:   chatID,
		FolderID: folderID,
	}

	return s.db.Create(assignment).Error
}

func (s *FoldersService) RemoveChatFromFolder(chatID, folderID, userID uuid.UUID) error {
	// Verify chat belongs to user
	var chat Chat
	if err := s.db.Where("id = ? AND user_id = ?", chatID, userID).First(&chat).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("chat not found")
		}
		return err
	}

	// Verify folder belongs to user
	var folder ChatFolder
	if err := s.db.Where("id = ? AND user_id = ?", folderID, userID).First(&folder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("folder not found")
		}
		return err
	}

	// Delete assignment
	result := s.db.Where("chat_id = ? AND folder_id = ?", chatID, folderID).Delete(&ChatFolderAssignment{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("chat is not assigned to this folder")
	}

	return nil
}

func (s *FoldersService) GetFolderChats(folderID, userID uuid.UUID) ([]Chat, error) {
	// Verify folder belongs to user
	var folder ChatFolder
	if err := s.db.Where("id = ? AND user_id = ?", folderID, userID).First(&folder).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("folder not found")
		}
		return nil, err
	}

	// Get chat IDs assigned to this folder
	var assignments []ChatFolderAssignment
	if err := s.db.Where("folder_id = ?", folderID).Find(&assignments).Error; err != nil {
		return nil, err
	}

	if len(assignments) == 0 {
		return []Chat{}, nil
	}

	// Extract chat IDs
	chatIDs := make([]uuid.UUID, len(assignments))
	for i, assignment := range assignments {
		chatIDs[i] = assignment.ChatID
	}

	// Get chats
	var chats []Chat
	err := s.db.Where("id IN ? AND user_id = ?", chatIDs, userID).
		Order("updated_at DESC").
		Find(&chats).Error

	if err != nil {
		return nil, err
	}

	return chats, nil
}

// Tag Management

func (s *FoldersService) CreateTag(userID uuid.UUID, req *CreateTagRequest) (*ChatTag, error) {
	// Validate tag name
	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("tag name is required")
	}

	// Check for duplicate tag name for this user
	var existingTag ChatTag
	err := s.db.Where("user_id = ? AND name = ?", userID, req.Name).First(&existingTag).Error
	if err == nil {
		return nil, errors.New("tag with this name already exists")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	tag := &ChatTag{
		UserID: userID,
		Name:   req.Name,
		Color:  req.Color,
	}

	if err := s.db.Create(tag).Error; err != nil {
		return nil, err
	}

	return tag, nil
}

func (s *FoldersService) DeleteTag(tagID, userID uuid.UUID) error {
	// First remove all chat assignments
	if err := s.db.Where("tag_id = ?", tagID).Delete(&ChatTagAssignment{}).Error; err != nil {
		return err
	}

	// Then delete the tag
	result := s.db.Where("id = ? AND user_id = ?", tagID, userID).Delete(&ChatTag{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("tag not found")
	}

	return nil
}

func (s *FoldersService) GetUserTags(userID uuid.UUID) ([]ChatTag, error) {
	var tags []ChatTag
	err := s.db.Where("user_id = ?", userID).
		Order("name ASC").
		Find(&tags).Error

	if err != nil {
		return nil, err
	}

	return tags, nil
}

// Chat-Tag Assignment

func (s *FoldersService) AssignTagToChat(chatID, tagID, userID uuid.UUID) error {
	// Verify chat belongs to user
	var chat Chat
	if err := s.db.Where("id = ? AND user_id = ?", chatID, userID).First(&chat).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("chat not found")
		}
		return err
	}

	// Verify tag belongs to user
	var tag ChatTag
	if err := s.db.Where("id = ? AND user_id = ?", tagID, userID).First(&tag).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tag not found")
		}
		return err
	}

	// Check if assignment already exists
	var existingAssignment ChatTagAssignment
	err := s.db.Where("chat_id = ? AND tag_id = ?", chatID, tagID).First(&existingAssignment).Error
	if err == nil {
		return errors.New("tag is already assigned to this chat")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	// Create assignment
	assignment := &ChatTagAssignment{
		ChatID: chatID,
		TagID:  tagID,
	}

	return s.db.Create(assignment).Error
}

func (s *FoldersService) RemoveTagFromChat(chatID, tagID, userID uuid.UUID) error {
	// Verify chat belongs to user
	var chat Chat
	if err := s.db.Where("id = ? AND user_id = ?", chatID, userID).First(&chat).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("chat not found")
		}
		return err
	}

	// Verify tag belongs to user
	var tag ChatTag
	if err := s.db.Where("id = ? AND user_id = ?", tagID, userID).First(&tag).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tag not found")
		}
		return err
	}

	// Delete assignment
	result := s.db.Where("chat_id = ? AND tag_id = ?", chatID, tagID).Delete(&ChatTagAssignment{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("tag is not assigned to this chat")
	}

	return nil
}

func (s *FoldersService) GetChatTags(chatID, userID uuid.UUID) ([]ChatTag, error) {
	// Verify chat belongs to user
	var chat Chat
	if err := s.db.Where("id = ? AND user_id = ?", chatID, userID).First(&chat).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("chat not found")
		}
		return nil, err
	}

	// Get tag IDs assigned to this chat
	var assignments []ChatTagAssignment
	if err := s.db.Where("chat_id = ?", chatID).Find(&assignments).Error; err != nil {
		return nil, err
	}

	if len(assignments) == 0 {
		return []ChatTag{}, nil
	}

	// Extract tag IDs
	tagIDs := make([]uuid.UUID, len(assignments))
	for i, assignment := range assignments {
		tagIDs[i] = assignment.TagID
	}

	// Get tags
	var tags []ChatTag
	err := s.db.Where("id IN ? AND user_id = ?", tagIDs, userID).
		Order("name ASC").
		Find(&tags).Error

	if err != nil {
		return nil, err
	}

	return tags, nil
}

// Smart Folder Auto-Categorization

type SmartFolderRules struct {
	Keywords     []string `json:"keywords"`
	MinMessages  int      `json:"min_messages"`
	ModelPattern string   `json:"model_pattern"`
}

func (s *FoldersService) AutoCategorizeChatToSmartFolders(chatID, userID uuid.UUID) error {
	// Get chat with messages
	var chat Chat
	err := s.db.Where("id = ? AND user_id = ?", chatID, userID).
		Preload("Messages").
		First(&chat).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("chat not found")
		}
		return err
	}

	// Get all smart folders for this user
	var smartFolders []ChatFolder
	err = s.db.Where("user_id = ? AND is_smart_folder = ?", userID, true).Find(&smartFolders).Error
	if err != nil {
		return err
	}

	// Analyze chat and assign to matching smart folders
	for _, folder := range smartFolders {
		if folder.SmartRules == "" {
			continue
		}

		var rules SmartFolderRules
		if err := json.Unmarshal([]byte(folder.SmartRules), &rules); err != nil {
			continue
		}

		// Check if chat matches rules
		if s.chatMatchesRules(&chat, &rules) {
			// Assign chat to folder (ignore if already assigned)
			assignment := &ChatFolderAssignment{
				ChatID:   chatID,
				FolderID: folder.ID,
			}

			// Check if already assigned
			var existingAssignment ChatFolderAssignment
			err := s.db.Where("chat_id = ? AND folder_id = ?", chatID, folder.ID).First(&existingAssignment).Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				s.db.Create(assignment)
			}
		}
	}

	return nil
}

func (s *FoldersService) chatMatchesRules(chat *Chat, rules *SmartFolderRules) bool {
	// Check minimum messages
	if rules.MinMessages > 0 && len(chat.Messages) < rules.MinMessages {
		return false
	}

	// Check model pattern
	if rules.ModelPattern != "" && !strings.Contains(strings.ToLower(chat.Model), strings.ToLower(rules.ModelPattern)) {
		return false
	}

	// Check keywords in chat content
	if len(rules.Keywords) > 0 {
		chatContent := strings.ToLower(chat.Title)
		for _, msg := range chat.Messages {
			chatContent += " " + strings.ToLower(msg.Content)
		}

		matchedKeywords := 0
		for _, keyword := range rules.Keywords {
			if strings.Contains(chatContent, strings.ToLower(keyword)) {
				matchedKeywords++
			}
		}

		// Require at least one keyword match
		if matchedKeywords == 0 {
			return false
		}
	}

	return true
}
