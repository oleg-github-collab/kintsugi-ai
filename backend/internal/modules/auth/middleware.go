package auth

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type Middleware struct {
	service *Service
}

func NewMiddleware(service *Service) *Middleware {
	return &Middleware{service: service}
}

func (m *Middleware) Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		log.Printf("[AUTH] Path: %s, Authorization header: %s", c.Path(), authHeader)

		if authHeader == "" {
			log.Printf("[AUTH] Missing authorization header for %s", c.Path())
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[AUTH] Invalid header format for %s: %s", c.Path(), authHeader)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		tokenString := parts[1]
		claims, err := m.service.ValidateAccessToken(tokenString)
		if err != nil {
			log.Printf("[AUTH] Token validation failed for %s: %v", c.Path(), err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		log.Printf("[AUTH] Token validated for user %s", claims.Email)

		// Set user info in context
		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)

		return c.Next()
	}
}
