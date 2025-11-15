package translation

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetPricing(c *fiber.Ctx) error {
	service := c.Query("service")
	charCount := c.QueryInt("char_count", 0)

	if service == "" || charCount == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "service and char_count are required",
		})
	}

	pricing, err := h.service.GetPricing(service, charCount)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(pricing)
}

func (h *Handler) Translate(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req TranslationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Basic validation
	if len(req.Text) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Text is required",
		})
	}

	translation, err := h.service.Translate(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(translation.ToResponse())
}

func (h *Handler) GetTranslation(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	translationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid translation ID",
		})
	}

	translation, err := h.service.GetTranslation(translationID, userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(translation.ToResponse())
}

func (h *Handler) GetUserTranslations(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)

	translations, err := h.service.GetUserTranslations(userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	responses := make([]*TranslationResponse, len(translations))
	for i, t := range translations {
		responses[i] = t.ToResponse()
	}

	return c.JSON(responses)
}

func (h *Handler) DeleteTranslation(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	translationID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid translation ID",
		})
	}

	if err := h.service.DeleteTranslation(translationID, userID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Translation deleted successfully",
	})
}
