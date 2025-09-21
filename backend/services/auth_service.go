package services

import (
	"fmt"
	"time"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/repositories"
	"angular-n-go-template/backend/security"

	"github.com/google/uuid"
)

// AuthService handles authentication business logic
type AuthService struct {
	userRepo        *repositories.UserRepository
	requestLogRepo  *repositories.RequestLogRepository
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo *repositories.UserRepository, requestLogRepo *repositories.RequestLogRepository) *AuthService {
	return &AuthService{
		userRepo:       userRepo,
		requestLogRepo: requestLogRepo,
	}
}

// LoginResponse represents the response for login
type LoginResponse struct {
	Token string             `json:"token"`
	User  models.UserResponse `json:"user"`
}

// Register registers a new user
func (s *AuthService) Register(req *models.CreateUserRequest) (*models.UserResponse, error) {
	// Check if email already exists
	emailExists, err := s.userRepo.EmailExists(req.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, &ValidationError{Message: "Email already exists"}
	}

	// Check if username already exists
	usernameExists, err := s.userRepo.UsernameExists(req.Username)
	if err != nil {
		return nil, err
	}
	if usernameExists {
		return nil, &ValidationError{Message: "Username already exists"}
	}

	// Hash password
	hashedPassword, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Set default role if not provided
	role := req.Role
	if role == "" {
		role = "user"
	}

	// Create user
	user := &models.User{
		ID:        uuid.New(),
		Email:     req.Email,
		Username:  req.Username,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      role,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

// Login authenticates a user and returns a token
func (s *AuthService) Login(req *models.LoginRequest) (*LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, &ValidationError{Message: "Invalid email or password"}
	}

	// Check if user is active
	if !user.IsActive {
		return nil, &ValidationError{Message: "Account is deactivated"}
	}

	// Verify password
	valid, err := security.VerifyPassword(req.Password, user.Password)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, &ValidationError{Message: "Invalid email or password"}
	}

	// Ensure user has a valid role (fix for existing users with empty roles)
	if user.Role == "" {
		user.Role = "user"
		// Update the user in the database
		err = s.userRepo.Update(user)
		if err != nil {
			// Log the error but don't fail the login
			fmt.Printf("Warning: Failed to update user role: %v\n", err)
		}
	}

	// Generate JWT token
	token, err := security.GenerateToken(user.ID, user.Email, user.Username, user.Role)
	if err != nil {
		return nil, err
	}

	response := &LoginResponse{
		Token: token,
		User:  user.ToResponse(),
	}

	return response, nil
}

// ValidateToken validates a JWT token and returns user info
func (s *AuthService) ValidateToken(tokenString string) (*models.UserResponse, error) {
	claims, err := security.ValidateToken(tokenString)
	if err != nil {
		return nil, &ValidationError{Message: "Invalid token"}
	}

	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, &ValidationError{Message: "User not found"}
	}

	if !user.IsActive {
		return nil, &ValidationError{Message: "Account is deactivated"}
	}

	response := user.ToResponse()
	return &response, nil
}

// Logout logs out a user (in a real application, you might want to blacklist the token)
func (s *AuthService) Logout(userID uuid.UUID) error {
	// In a real application, you might want to:
	// 1. Add the token to a blacklist in Redis
	// 2. Remove the token from the client
	// For now, we'll just return success
	return nil
}




