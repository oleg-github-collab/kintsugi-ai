package chat

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	openai "github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

type Service struct {
	repo         *Repository
	openaiClient *openai.Client
	db           *gorm.DB
}

const (
	defaultImageSize = "1024x1024"
	imageTokenCost   = 40
)

func NewService(repo *Repository, db *gorm.DB) *Service {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		panic("OPENAI_API_KEY environment variable is required")
	}

	return &Service{
		repo:         repo,
		openaiClient: openai.NewClient(apiKey),
		db:           db,
	}
}

func (s *Service) CreateChat(userID uuid.UUID, req *CreateChatRequest) (*Chat, error) {
	if req.Model == "" {
		req.Model = "gpt-4o"
	}

	chat := &Chat{
		UserID: userID,
		Title:  req.Title,
		Model:  req.Model,
	}

	if chat.Title == "" {
		chat.Title = "New Chat"
	}

	if err := s.repo.CreateChat(chat); err != nil {
		return nil, err
	}

	return chat, nil
}

func (s *Service) GetChat(chatID, userID uuid.UUID) (*Chat, error) {
	return s.repo.GetChatByID(chatID, userID)
}

func (s *Service) GetUserChats(userID uuid.UUID, limit, offset int) ([]Chat, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	return s.repo.GetUserChats(userID, limit, offset)
}

func (s *Service) UpdateChat(chatID, userID uuid.UUID, req *UpdateChatRequest) (*Chat, error) {
	chat, err := s.repo.GetChatByID(chatID, userID)
	if err != nil {
		return nil, err
	}

	if req.Title != "" {
		chat.Title = req.Title
	}
	if req.Model != "" {
		chat.Model = req.Model
	}

	if err := s.repo.UpdateChat(chat); err != nil {
		return nil, err
	}

	return chat, nil
}

func (s *Service) DeleteChat(chatID, userID uuid.UUID) error {
	return s.repo.DeleteChat(chatID, userID)
}

func (s *Service) CheckTokenLimit(userID uuid.UUID) (bool, int64, int64, error) {
	var user struct {
		SubscriptionTier string
		Role             string
		TokensUsed       int64
		TokensLimit      int64
		ResetAt          time.Time
	}

	err := s.db.Table("users").
		Where("id = ?", userID).
		Select("subscription_tier, role, tokens_used, tokens_limit, reset_at").
		Scan(&user).Error

	if err != nil {
		return false, 0, 0, err
	}

	// Superadmins have unlimited tokens
	if user.Role == "superadmin" {
		return true, 0, -1, nil
	}

	// Check if reset period has passed
	if time.Now().After(user.ResetAt) {
		// Reset tokens
		s.db.Table("users").
			Where("id = ?", userID).
			Updates(map[string]interface{}{
				"tokens_used": 0,
				"reset_at":    time.Now().Add(6 * time.Hour),
			})
		user.TokensUsed = 0
		user.ResetAt = time.Now().Add(6 * time.Hour)
	}

	// -1 means unlimited
	if user.TokensLimit == -1 {
		return true, user.TokensUsed, user.TokensLimit, nil
	}

	hasCapacity := user.TokensUsed < user.TokensLimit
	return hasCapacity, user.TokensUsed, user.TokensLimit, nil
}

func (s *Service) SendMessage(chatID, userID uuid.UUID, req *SendMessageRequest) (<-chan StreamChunk, error) {
	// Get chat and verify ownership
	chat, err := s.repo.GetChatByID(chatID, userID)
	if err != nil {
		return nil, err
	}

	// Check token limit
	hasCapacity, tokensUsed, tokensLimit, err := s.CheckTokenLimit(userID)
	if err != nil {
		return nil, err
	}
	if !hasCapacity {
		return nil, fmt.Errorf("token limit exceeded: %d/%d tokens used", tokensUsed, tokensLimit)
	}

	// Save user message
	userMessage := &Message{
		ChatID:  chatID,
		Role:    "user",
		Content: req.Content,
		Tokens:  countTokens(req.Content),
	}

	if err := s.repo.CreateMessage(userMessage); err != nil {
		return nil, err
	}

	// Build conversation history
	messages, err := s.repo.GetChatMessages(chatID)
	if err != nil {
		return nil, err
	}

	openaiMessages := make([]openai.ChatCompletionMessage, 0, len(messages)+1)

	// Add system prompt if provided
	if req.SystemPrompt != "" {
		openaiMessages = append(openaiMessages, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleSystem,
			Content: req.SystemPrompt,
		})
	}

	// Add conversation history
	for _, msg := range messages {
		role := openai.ChatMessageRoleUser
		if msg.Role == "assistant" {
			role = openai.ChatMessageRoleAssistant
		} else if msg.Role == "system" {
			role = openai.ChatMessageRoleSystem
		}

		openaiMessages = append(openaiMessages, openai.ChatCompletionMessage{
			Role:    role,
			Content: msg.Content,
		})
	}

	// Create streaming request
	streamReq := openai.ChatCompletionRequest{
		Model:    chat.Model,
		Messages: openaiMessages,
		Stream:   true,
	}

	stream, err := s.openaiClient.CreateChatCompletionStream(context.Background(), streamReq)
	if err != nil {
		return nil, err
	}

	// Create channel for streaming chunks
	chunkChan := make(chan StreamChunk)
	assistantMessageID := uuid.New()

	go func() {
		defer close(chunkChan)
		defer stream.Close()

		var fullContent string
		var totalTokens int

		for {
			response, err := stream.Recv()
			if errors.Is(err, io.EOF) {
				// Stream finished - save assistant message
				assistantMessage := &Message{
					ID:      assistantMessageID,
					ChatID:  chatID,
					Role:    "assistant",
					Content: fullContent,
					Tokens:  totalTokens,
					Model:   chat.Model,
				}

				s.repo.CreateMessage(assistantMessage)

				// Update user's token usage
				s.db.Table("users").
					Where("id = ?", userID).
					UpdateColumn("tokens_used", gorm.Expr("tokens_used + ?", totalTokens+userMessage.Tokens))

				// Update chat timestamp
				chat.UpdatedAt = time.Now()
				s.repo.UpdateChat(chat)

				// Send final chunk
				chunkChan <- StreamChunk{
					Delta:       "",
					MessageID:   assistantMessageID.String(),
					Done:        true,
					TotalTokens: totalTokens,
				}
				return
			}

			if err != nil {
				chunkChan <- StreamChunk{
					Delta:     fmt.Sprintf("Error: %v", err),
					MessageID: assistantMessageID.String(),
					Done:      true,
				}
				return
			}

			if len(response.Choices) > 0 {
				delta := response.Choices[0].Delta.Content
				fullContent += delta
				totalTokens = countTokens(fullContent)

				chunkChan <- StreamChunk{
					Delta:     delta,
					MessageID: assistantMessageID.String(),
					Done:      false,
				}
			}
		}
	}()

	return chunkChan, nil
}

func (s *Service) RegenerateMessage(chatID, messageID, userID uuid.UUID) (<-chan StreamChunk, error) {
	// Get chat and verify ownership
	chat, err := s.repo.GetChatByID(chatID, userID)
	if err != nil {
		return nil, err
	}

	// Get all messages up to the one being regenerated
	messages, err := s.repo.GetChatMessages(chatID)
	if err != nil {
		return nil, err
	}

	// Find the message index
	messageIndex := -1
	for i, msg := range messages {
		if msg.ID == messageID {
			messageIndex = i
			break
		}
	}

	if messageIndex == -1 || messages[messageIndex].Role != "assistant" {
		return nil, errors.New("message not found or not an assistant message")
	}

	// Build conversation up to the previous user message
	openaiMessages := make([]openai.ChatCompletionMessage, 0)
	for i := 0; i < messageIndex; i++ {
		msg := messages[i]
		role := openai.ChatMessageRoleUser
		if msg.Role == "assistant" {
			role = openai.ChatMessageRoleAssistant
		} else if msg.Role == "system" {
			role = openai.ChatMessageRoleSystem
		}

		openaiMessages = append(openaiMessages, openai.ChatCompletionMessage{
			Role:    role,
			Content: msg.Content,
		})
	}

	// Create streaming request
	streamReq := openai.ChatCompletionRequest{
		Model:    chat.Model,
		Messages: openaiMessages,
		Stream:   true,
	}

	stream, err := s.openaiClient.CreateChatCompletionStream(context.Background(), streamReq)
	if err != nil {
		return nil, err
	}

	chunkChan := make(chan StreamChunk)

	go func() {
		defer close(chunkChan)
		defer stream.Close()

		var fullContent string
		var totalTokens int

		for {
			response, err := stream.Recv()
			if errors.Is(err, io.EOF) {
				// Update existing message
				messages[messageIndex].Content = fullContent
				messages[messageIndex].Tokens = totalTokens
				s.repo.UpdateMessage(&messages[messageIndex])

				chunkChan <- StreamChunk{
					Delta:       "",
					MessageID:   messageID.String(),
					Done:        true,
					TotalTokens: totalTokens,
				}
				return
			}

			if err != nil {
				chunkChan <- StreamChunk{
					Delta:     fmt.Sprintf("Error: %v", err),
					MessageID: messageID.String(),
					Done:      true,
				}
				return
			}

			if len(response.Choices) > 0 {
				delta := response.Choices[0].Delta.Content
				fullContent += delta
				totalTokens = countTokens(fullContent)

				chunkChan <- StreamChunk{
					Delta:     delta,
					MessageID: messageID.String(),
					Done:      false,
				}
			}
		}
	}()

	return chunkChan, nil
}

// Simple token counter (approximation: ~4 chars per token for English)
// In production, use tiktoken-go for accurate counting
func countTokens(text string) int {
	return len(text) / 4
}

// CallOpenAI for messenger AI integration
func (s *Service) CallOpenAI(userID uuid.UUID, model string, messages []map[string]interface{}) (map[string]interface{}, error) {
	// Check token limit
	hasCapacity, _, _, err := s.CheckTokenLimit(userID)
	if err != nil {
		return nil, err
	}
	if !hasCapacity {
		return nil, errors.New("token limit exceeded")
	}

	// Convert messages to OpenAI format
	openaiMessages := make([]openai.ChatCompletionMessage, 0)
	for _, msg := range messages {
		role := ""
		if r, ok := msg["role"].(string); ok {
			role = r
		}
		content := ""
		if c, ok := msg["content"].(string); ok {
			content = c
		}

		var chatRole string
		switch role {
		case "system":
			chatRole = openai.ChatMessageRoleSystem
		case "assistant":
			chatRole = openai.ChatMessageRoleAssistant
		default:
			chatRole = openai.ChatMessageRoleUser
		}

		openaiMessages = append(openaiMessages, openai.ChatCompletionMessage{
			Role:    chatRole,
			Content: content,
		})
	}

	// Use default model if not specified
	if model == "" {
		model = "gpt-4o"
	}

	req := openai.ChatCompletionRequest{
		Model:    model,
		Messages: openaiMessages,
	}

	resp, err := s.openaiClient.CreateChatCompletion(context.Background(), req)
	if err != nil {
		return nil, err
	}

	// Update token usage
	tokensUsed := resp.Usage.TotalTokens
	s.db.Table("users").
		Where("id = ?", userID).
		UpdateColumn("tokens_used", gorm.Expr("tokens_used + ?", tokensUsed))

	// Return in OpenAI format
	return map[string]interface{}{
		"id":      resp.ID,
		"model":   resp.Model,
		"choices": resp.Choices,
		"usage":   resp.Usage,
	}, nil
}

func (s *Service) GenerateImage(userID uuid.UUID, prompt, size string) (string, error) {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" {
		return "", errors.New("prompt is required")
	}

	if size == "" {
		size = defaultImageSize
	}

	// Check user subscription tier - only Premium+ can generate images
	var user struct {
		SubscriptionTier string
		Role             string
		TokensUsed       int64
		TokensLimit      int64
	}

	err := s.db.Table("users").
		Where("id = ?", userID).
		Select("subscription_tier, role, tokens_used, tokens_limit").
		Scan(&user).Error

	if err != nil {
		return "", err
	}

	// Superadmins can always generate images
	if user.Role != "superadmin" {
		// Only Premium and Unlimited tiers can generate images
		if user.SubscriptionTier == "basic" {
			return "", errors.New("image generation is only available for Premium and Unlimited subscribers")
		}
	}

	hasCapacity, tokensUsed, tokensLimit, err := s.CheckTokenLimit(userID)
	if err != nil {
		return "", err
	}

	if !hasCapacity {
		return "", errors.New("token limit exceeded")
	}

	projectedTokens := tokensUsed + imageTokenCost
	if tokensLimit != -1 && projectedTokens > tokensLimit {
		return "", fmt.Errorf("not enough tokens for image generation (%d/%d)", projectedTokens, tokensLimit)
	}

	req := openai.ImageRequest{
		Prompt:         prompt,
		Size:           size,
		N:              1,
		ResponseFormat: openai.CreateImageResponseFormatURL,
	}

	resp, err := s.openaiClient.CreateImage(context.Background(), req)
	if err != nil {
		return "", err
	}

	if len(resp.Data) == 0 || resp.Data[0].URL == "" {
		return "", errors.New("image service returned an invalid response")
	}

	if err := s.db.Table("users").
		Where("id = ?", userID).
		UpdateColumn("tokens_used", gorm.Expr("tokens_used + ?", imageTokenCost)).Error; err != nil {
		return "", err
	}

	return resp.Data[0].URL, nil
}
