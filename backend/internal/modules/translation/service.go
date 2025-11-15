package translation

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo                 *Repository
	deeplAPIKey          string
	otranslatorAPIKey    string
	deeplPricePer1800    float64
	otranslatorPricePer1800 float64
	httpClient           *http.Client
}

func NewService(repo *Repository) *Service {
	deeplKey := os.Getenv("DEEPL_API_KEY")
	otranslatorKey := os.Getenv("OTRANSLATOR_API_KEY")

	// Get pricing from environment variables (per 1800 characters)
	deeplPrice, _ := strconv.ParseFloat(os.Getenv("DEEPL_PRICE_PER_1800"), 64)
	if deeplPrice == 0 {
		deeplPrice = 0.05 // Default $0.05 per 1800 chars
	}

	otranslatorPrice, _ := strconv.ParseFloat(os.Getenv("OTRANSLATOR_PRICE_PER_1800"), 64)
	if otranslatorPrice == 0 {
		otranslatorPrice = 0.10 // Default $0.10 per 1800 chars
	}

	return &Service{
		repo:                    repo,
		deeplAPIKey:             deeplKey,
		otranslatorAPIKey:       otranslatorKey,
		deeplPricePer1800:       deeplPrice,
		otranslatorPricePer1800: otranslatorPrice,
		httpClient:              &http.Client{Timeout: 60 * time.Second},
	}
}

func (s *Service) GetPricing(service string, charCount int) (*PricingInfo, error) {
	var pricePer1800 float64
	var plan string

	switch service {
	case "deepl":
		pricePer1800 = s.deeplPricePer1800
		plan = "Kintsugi Basic"
	case "otranslator":
		pricePer1800 = s.otranslatorPricePer1800
		plan = "Kintsugi Epic"
	default:
		return nil, errors.New("invalid service")
	}

	chunks := int(math.Ceil(float64(charCount) / 1800.0))
	estimatedCost := float64(chunks) * pricePer1800

	return &PricingInfo{
		Service:         service,
		Plan:            plan,
		PricePer1800:    pricePer1800,
		EstimatedCost:   estimatedCost,
		EstimatedChunks: chunks,
	}, nil
}

func (s *Service) Translate(userID uuid.UUID, req *TranslationRequest) (*Translation, error) {
	charCount := len(req.Text)
	pricing, err := s.GetPricing(req.Service, charCount)
	if err != nil {
		return nil, err
	}

	translation := &Translation{
		UserID:         userID,
		SourceLanguage: req.SourceLanguage,
		TargetLanguage: req.TargetLanguage,
		SourceText:     req.Text,
		CharCount:      charCount,
		ChunkCount:     pricing.EstimatedChunks,
		Service:        req.Service,
		Plan:           pricing.Plan,
		Cost:           pricing.EstimatedCost,
		Status:         "processing",
	}

	if err := s.repo.CreateTranslation(translation); err != nil {
		return nil, err
	}

	// Perform translation based on service
	var translatedText string
	var translationErr error

	switch req.Service {
	case "deepl":
		translatedText, translationErr = s.translateWithDeepL(req)
	case "otranslator":
		translatedText, translationErr = s.translateWithOTranslator(req)
	default:
		translationErr = errors.New("unsupported service")
	}

	if translationErr != nil {
		translation.Status = "failed"
		translation.ErrorMessage = translationErr.Error()
		s.repo.UpdateTranslation(translation)
		return translation, translationErr
	}

	now := time.Now()
	translation.TranslatedText = translatedText
	translation.Status = "completed"
	translation.CompletedAt = &now

	if err := s.repo.UpdateTranslation(translation); err != nil {
		return nil, err
	}

	return translation, nil
}

func (s *Service) translateWithDeepL(req *TranslationRequest) (string, error) {
	if s.deeplAPIKey == "" {
		return "", errors.New("DeepL API key not configured")
	}

	// For very large texts, split into chunks
	chunks := s.splitIntoChunks(req.Text, 30000) // DeepL has ~50k limit, use 30k to be safe
	var translatedParts []string

	for _, chunk := range chunks {
		payload := map[string]interface{}{
			"text":          []string{chunk},
			"source_lang":   strings.ToUpper(req.SourceLanguage),
			"target_lang":   strings.ToUpper(req.TargetLanguage),
			"preserve_formatting": true,
		}

		jsonData, _ := json.Marshal(payload)
		httpReq, _ := http.NewRequest("POST", "https://api-free.deepl.com/v2/translate", bytes.NewBuffer(jsonData))
		httpReq.Header.Set("Authorization", "DeepL-Auth-Key "+s.deeplAPIKey)
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(httpReq)
		if err != nil {
			return "", fmt.Errorf("DeepL API request failed: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return "", fmt.Errorf("DeepL API error (status %d): %s", resp.StatusCode, string(body))
		}

		var result struct {
			Translations []struct {
				Text string `json:"text"`
			} `json:"translations"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", fmt.Errorf("failed to decode DeepL response: %w", err)
		}

		if len(result.Translations) == 0 {
			return "", errors.New("no translation returned from DeepL")
		}

		translatedParts = append(translatedParts, result.Translations[0].Text)
	}

	return strings.Join(translatedParts, ""), nil
}

func (s *Service) translateWithOTranslator(req *TranslationRequest) (string, error) {
	if s.otranslatorAPIKey == "" {
		return "", errors.New("o.translator API key not configured")
	}

	// o.translator typically supports larger texts, but still chunk for safety
	chunks := s.splitIntoChunks(req.Text, 50000)
	var translatedParts []string

	for _, chunk := range chunks {
		// Note: o.translator API format may differ - this is a placeholder
		// Adjust according to actual o.translator API documentation
		payload := map[string]interface{}{
			"text":        chunk,
			"source_lang": req.SourceLanguage,
			"target_lang": req.TargetLanguage,
		}

		jsonData, _ := json.Marshal(payload)
		httpReq, _ := http.NewRequest("POST", "https://api.o.translator/v1/translate", bytes.NewBuffer(jsonData))
		httpReq.Header.Set("Authorization", "Bearer "+s.otranslatorAPIKey)
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(httpReq)
		if err != nil {
			return "", fmt.Errorf("o.translator API request failed: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			return "", fmt.Errorf("o.translator API error (status %d): %s", resp.StatusCode, string(body))
		}

		var result struct {
			TranslatedText string `json:"translated_text"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", fmt.Errorf("failed to decode o.translator response: %w", err)
		}

		translatedParts = append(translatedParts, result.TranslatedText)
	}

	return strings.Join(translatedParts, ""), nil
}

func (s *Service) splitIntoChunks(text string, chunkSize int) []string {
	if len(text) <= chunkSize {
		return []string{text}
	}

	var chunks []string
	for i := 0; i < len(text); i += chunkSize {
		end := i + chunkSize
		if end > len(text) {
			end = len(text)
		}

		// Try to break at sentence boundaries
		chunk := text[i:end]
		if end < len(text) {
			// Look for last period, question mark, or exclamation point
			lastPeriod := strings.LastIndexAny(chunk, ".!?")
			if lastPeriod > chunkSize/2 { // Only break if we're past halfway
				chunk = chunk[:lastPeriod+1]
				i = i + lastPeriod + 1 - chunkSize // Adjust index
			}
		}

		chunks = append(chunks, chunk)
	}

	return chunks
}

func (s *Service) GetTranslation(translationID, userID uuid.UUID) (*Translation, error) {
	return s.repo.GetTranslationByID(translationID, userID)
}

func (s *Service) GetUserTranslations(userID uuid.UUID, limit, offset int) ([]Translation, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	return s.repo.GetUserTranslations(userID, limit, offset)
}

func (s *Service) DeleteTranslation(translationID, userID uuid.UUID) error {
	return s.repo.DeleteTranslation(translationID, userID)
}
