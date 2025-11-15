package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo      *Repository
	jwtSecret []byte
}

func NewService(repo *Repository) *Service {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "kintsugi-ai-super-secret-key-change-in-production"
	}
	return &Service{
		repo:      repo,
		jwtSecret: []byte(secret),
	}
}

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

func (s *Service) Register(req *RegisterRequest) (*AuthResponse, error) {
	// Check if email already exists
	existingUser, _ := s.repo.GetUserByEmail(req.Email)
	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Check if username already exists
	existingUser, _ = s.repo.GetUserByUsername(req.Username)
	if existingUser != nil {
		return nil, errors.New("username already taken")
	}

	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &User{
		Username:         req.Username,
		Email:            req.Email,
		PasswordHash:     string(passwordHash),
		SubscriptionTier: "basic",
		TokensLimit:      100000,
		TokensUsed:       0,
		ResetAt:          time.Now().Add(6 * time.Hour),
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return s.generateAuthResponse(user)
}

func (s *Service) Login(req *LoginRequest) (*AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	return s.generateAuthResponse(user)
}

func (s *Service) RefreshAccessToken(req *RefreshRequest) (*AuthResponse, error) {
	refreshToken, err := s.repo.GetRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Check if token is expired
	if time.Now().After(refreshToken.ExpiresAt) {
		s.repo.DeleteRefreshToken(req.RefreshToken)
		return nil, errors.New("refresh token expired")
	}

	return s.generateAuthResponse(&refreshToken.User)
}

func (s *Service) Logout(refreshToken string) error {
	return s.repo.DeleteRefreshToken(refreshToken)
}

func (s *Service) GetUserByID(id uuid.UUID) (*User, error) {
	return s.repo.GetUserByID(id)
}

func (s *Service) ValidateAccessToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *Service) generateAuthResponse(user *User) (*AuthResponse, error) {
	// Generate access token (15 minutes)
	accessTokenExpiry := time.Now().Add(15 * time.Minute)
	accessClaims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(accessTokenExpiry),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, err
	}

	// Generate refresh token (7 days)
	refreshTokenExpiry := time.Now().Add(7 * 24 * time.Hour)
	refreshClaims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(refreshTokenExpiry),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, err
	}

	// Save refresh token to database
	refreshTokenRecord := &RefreshToken{
		UserID:    user.ID,
		Token:     refreshTokenString,
		ExpiresAt: refreshTokenExpiry,
	}

	if err := s.repo.CreateRefreshToken(refreshTokenRecord); err != nil {
		return nil, err
	}

	return &AuthResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresAt:    accessTokenExpiry,
		User:         user.ToDTO(),
	}, nil
}
