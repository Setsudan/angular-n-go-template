package services

import (
	"time"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/repositories"
	"angular-n-go-template/backend/security"

	"github.com/google/uuid"
)

// UserService handles user business logic
type UserService struct {
	userRepo *repositories.UserRepository
}

// NewUserService creates a new user service
func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(req *models.CreateUserRequest) (*models.UserResponse, error) {
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

	// Create user
	user := &models.User{
		ID:        uuid.New(),
		Email:     req.Email,
		Username:  req.Username,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
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

// GetUser retrieves a user by ID
func (s *UserService) GetUser(id uuid.UUID) (*models.UserResponse, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

// GetUsers retrieves all users with pagination
func (s *UserService) GetUsers(limit, offset int) ([]*models.UserResponse, error) {
	users, err := s.userRepo.GetAll(limit, offset)
	if err != nil {
		return nil, err
	}

	var responses []*models.UserResponse
	for _, user := range users {
		response := user.ToResponse()
		responses = append(responses, &response)
	}

	return responses, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(id uuid.UUID, req *models.UpdateUserRequest) (*models.UserResponse, error) {
	user, err := s.userRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Email != nil {
		// Check if new email already exists
		emailExists, err := s.userRepo.EmailExists(*req.Email)
		if err != nil {
			return nil, err
		}
		if emailExists && *req.Email != user.Email {
			return nil, &ValidationError{Message: "Email already exists"}
		}
		user.Email = *req.Email
	}

	if req.Username != nil {
		// Check if new username already exists
		usernameExists, err := s.userRepo.UsernameExists(*req.Username)
		if err != nil {
			return nil, err
		}
		if usernameExists && *req.Username != user.Username {
			return nil, &ValidationError{Message: "Username already exists"}
		}
		user.Username = *req.Username
	}

	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}

	if req.LastName != nil {
		user.LastName = *req.LastName
	}

	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	user.UpdatedAt = time.Now()

	err = s.userRepo.Update(user)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(id uuid.UUID) error {
	return s.userRepo.Delete(id)
}

// ValidationError represents a validation error
type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}






