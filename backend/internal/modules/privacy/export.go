package privacy

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ExportService struct {
	db *gorm.DB
}

func NewExportService(db *gorm.DB) *ExportService {
	return &ExportService{db: db}
}

// UserDataExport represents all user data for export
type UserDataExport struct {
	User            UserData             `json:"user"`
	Chats           []ChatData           `json:"chats"`
	Messages        []MessageData        `json:"messages"`
	Conversations   []ConversationData   `json:"conversations"`
	Translations    []TranslationData    `json:"translations"`
	FileAttachments []FileAttachmentData `json:"file_attachments"`
	Analytics       []AnalyticsData      `json:"analytics"`
	ExportedAt      time.Time            `json:"exported_at"`
}

type UserData struct {
	ID               string    `json:"id"`
	Username         string    `json:"username"`
	Email            string    `json:"email"`
	SubscriptionTier string    `json:"subscription_tier"`
	Role             string    `json:"role"`
	TokensUsed       int64     `json:"tokens_used"`
	TokensLimit      int64     `json:"tokens_limit"`
	CreatedAt        time.Time `json:"created_at"`
}

type ChatData struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
}

type MessageData struct {
	ID        string    `json:"id"`
	ChatID    string    `json:"chat_id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type ConversationData struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	IsGroup     bool      `json:"is_group"`
	CreatedAt   time.Time `json:"created_at"`
	MessageCount int      `json:"message_count"`
}

type TranslationData struct {
	ID             string    `json:"id"`
	SourceLang     string    `json:"source_lang"`
	TargetLang     string    `json:"target_lang"`
	SourceText     string    `json:"source_text"`
	TranslatedText string    `json:"translated_text"`
	CharCount      int       `json:"char_count"`
	CreatedAt      time.Time `json:"created_at"`
}

type FileAttachmentData struct {
	ID        string    `json:"id"`
	FileName  string    `json:"file_name"`
	FileType  string    `json:"file_type"`
	FileSize  int64     `json:"file_size"`
	FileURL   string    `json:"file_url"`
	CreatedAt time.Time `json:"created_at"`
}

type AnalyticsData struct {
	Date             time.Time `json:"date"`
	ChatTokens       int64     `json:"chat_tokens"`
	TranslationChars int64     `json:"translation_chars"`
	ImagesGenerated  int       `json:"images_generated"`
	VoiceMessages    int       `json:"voice_messages"`
	MessagesCount    int       `json:"messages_count"`
	TimeSpentMinutes int       `json:"time_spent_minutes"`
}

// ExportUserData exports all user data
func (s *ExportService) ExportUserData(userID uuid.UUID) (*UserDataExport, error) {
	export := &UserDataExport{
		ExportedAt: time.Now(),
	}

	// Export user profile
	var user struct {
		ID               uuid.UUID
		Username         string
		Email            string
		SubscriptionTier string
		Role             string
		TokensUsed       int64
		TokensLimit      int64
		CreatedAt        time.Time
	}

	if err := s.db.Table("users").Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}

	export.User = UserData{
		ID:               user.ID.String(),
		Username:         user.Username,
		Email:            user.Email,
		SubscriptionTier: user.SubscriptionTier,
		Role:             user.Role,
		TokensUsed:       user.TokensUsed,
		TokensLimit:      user.TokensLimit,
		CreatedAt:        user.CreatedAt,
	}

	// Export chats
	var chats []struct {
		ID        uuid.UUID
		Title     string
		Model     string
		CreatedAt time.Time
	}

	s.db.Table("chats").Where("user_id = ?", userID).Find(&chats)
	for _, chat := range chats {
		export.Chats = append(export.Chats, ChatData{
			ID:        chat.ID.String(),
			Title:     chat.Title,
			Model:     chat.Model,
			CreatedAt: chat.CreatedAt,
		})
	}

	// Export messages
	var messages []struct {
		ID        uuid.UUID
		ChatID    uuid.UUID
		Role      string
		Content   string
		CreatedAt time.Time
	}

	s.db.Raw(`
		SELECT m.id, m.chat_id, m.role, m.content, m.created_at
		FROM messages m
		JOIN chats c ON m.chat_id = c.id
		WHERE c.user_id = ?
	`, userID).Scan(&messages)

	for _, msg := range messages {
		export.Messages = append(export.Messages, MessageData{
			ID:        msg.ID.String(),
			ChatID:    msg.ChatID.String(),
			Role:      msg.Role,
			Content:   msg.Content,
			CreatedAt: msg.CreatedAt,
		})
	}

	// Export conversations
	var conversations []struct {
		ID          uuid.UUID
		Name        string
		IsGroup     bool
		CreatedAt   time.Time
		MessageCount int
	}

	s.db.Raw(`
		SELECT c.id, c.name, c.is_group, c.created_at,
			(SELECT COUNT(*) FROM conversation_messages WHERE conversation_id = c.id) as message_count
		FROM conversations c
		JOIN conversation_participants cp ON c.id = cp.conversation_id
		WHERE cp.user_id = ?
	`, userID).Scan(&conversations)

	for _, conv := range conversations {
		export.Conversations = append(export.Conversations, ConversationData{
			ID:          conv.ID.String(),
			Name:        conv.Name,
			IsGroup:     conv.IsGroup,
			CreatedAt:   conv.CreatedAt,
			MessageCount: conv.MessageCount,
		})
	}

	// Export translations
	var translations []struct {
		ID             uuid.UUID
		SourceLang     string
		TargetLang     string
		SourceText     string
		TranslatedText string
		CharCount      int
		CreatedAt      time.Time
	}

	s.db.Table("translations").Where("user_id = ?", userID).Find(&translations)
	for _, trans := range translations {
		export.Translations = append(export.Translations, TranslationData{
			ID:             trans.ID.String(),
			SourceLang:     trans.SourceLang,
			TargetLang:     trans.TargetLang,
			SourceText:     trans.SourceText,
			TranslatedText: trans.TranslatedText,
			CharCount:      trans.CharCount,
			CreatedAt:      trans.CreatedAt,
		})
	}

	// Export file attachments
	var files []struct {
		ID        uuid.UUID
		FileName  string
		FileType  string
		FileSize  int64
		FileURL   string
		CreatedAt time.Time
	}

	s.db.Table("file_attachments").Where("user_id = ?", userID).Find(&files)
	for _, file := range files {
		export.FileAttachments = append(export.FileAttachments, FileAttachmentData{
			ID:        file.ID.String(),
			FileName:  file.FileName,
			FileType:  file.FileType,
			FileSize:  file.FileSize,
			FileURL:   file.FileURL,
			CreatedAt: file.CreatedAt,
		})
	}

	// Export analytics
	var analytics []struct {
		Date             time.Time
		ChatTokens       int64
		TranslationChars int64
		ImagesGenerated  int
		VoiceMessages    int
		MessagesCount    int
		TimeSpentMinutes int
	}

	s.db.Table("usage_analytics").Where("user_id = ?", userID).Order("date DESC").Find(&analytics)
	for _, a := range analytics {
		export.Analytics = append(export.Analytics, AnalyticsData{
			Date:             a.Date,
			ChatTokens:       a.ChatTokens,
			TranslationChars: a.TranslationChars,
			ImagesGenerated:  a.ImagesGenerated,
			VoiceMessages:    a.VoiceMessages,
			MessagesCount:    a.MessagesCount,
			TimeSpentMinutes: a.TimeSpentMinutes,
		})
	}

	return export, nil
}

// ExportToJSON exports data to JSON format
func (s *ExportService) ExportToJSON(userID uuid.UUID) ([]byte, error) {
	data, err := s.ExportUserData(userID)
	if err != nil {
		return nil, err
	}

	return json.MarshalIndent(data, "", "  ")
}

// ExportToCSV exports data to CSV format
func (s *ExportService) ExportToCSV(userID uuid.UUID) (map[string][][]string, error) {
	data, err := s.ExportUserData(userID)
	if err != nil {
		return nil, err
	}

	csvData := make(map[string][][]string)

	// User CSV
	userRows := [][]string{
		{"ID", "Username", "Email", "Subscription", "Role", "Tokens Used", "Tokens Limit", "Created At"},
		{
			data.User.ID,
			data.User.Username,
			data.User.Email,
			data.User.SubscriptionTier,
			data.User.Role,
			fmt.Sprintf("%d", data.User.TokensUsed),
			fmt.Sprintf("%d", data.User.TokensLimit),
			data.User.CreatedAt.Format(time.RFC3339),
		},
	}
	csvData["user"] = userRows

	// Chats CSV
	chatRows := [][]string{{"ID", "Title", "Model", "Created At"}}
	for _, chat := range data.Chats {
		chatRows = append(chatRows, []string{
			chat.ID,
			chat.Title,
			chat.Model,
			chat.CreatedAt.Format(time.RFC3339),
		})
	}
	csvData["chats"] = chatRows

	// Messages CSV
	messageRows := [][]string{{"ID", "Chat ID", "Role", "Content", "Created At"}}
	for _, msg := range data.Messages {
		messageRows = append(messageRows, []string{
			msg.ID,
			msg.ChatID,
			msg.Role,
			msg.Content,
			msg.CreatedAt.Format(time.RFC3339),
		})
	}
	csvData["messages"] = messageRows

	// Translations CSV
	translationRows := [][]string{{"ID", "Source Lang", "Target Lang", "Source Text", "Translated Text", "Char Count", "Created At"}}
	for _, trans := range data.Translations {
		translationRows = append(translationRows, []string{
			trans.ID,
			trans.SourceLang,
			trans.TargetLang,
			trans.SourceText,
			trans.TranslatedText,
			fmt.Sprintf("%d", trans.CharCount),
			trans.CreatedAt.Format(time.RFC3339),
		})
	}
	csvData["translations"] = translationRows

	// Analytics CSV
	analyticsRows := [][]string{{"Date", "Chat Tokens", "Translation Chars", "Images", "Voice Messages", "Messages", "Time Spent (min)"}}
	for _, a := range data.Analytics {
		analyticsRows = append(analyticsRows, []string{
			a.Date.Format("2006-01-02"),
			fmt.Sprintf("%d", a.ChatTokens),
			fmt.Sprintf("%d", a.TranslationChars),
			fmt.Sprintf("%d", a.ImagesGenerated),
			fmt.Sprintf("%d", a.VoiceMessages),
			fmt.Sprintf("%d", a.MessagesCount),
			fmt.Sprintf("%d", a.TimeSpentMinutes),
		})
	}
	csvData["analytics"] = analyticsRows

	return csvData, nil
}

// GenerateCSVFile generates a CSV file from rows
func GenerateCSVFile(rows [][]string) ([]byte, error) {
	var result []byte
	writer := csv.NewWriter(&csvWriter{data: &result})

	for _, row := range rows {
		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	return result, writer.Error()
}

type csvWriter struct {
	data *[]byte
}

func (w *csvWriter) Write(p []byte) (n int, err error) {
	*w.data = append(*w.data, p...)
	return len(p), nil
}
