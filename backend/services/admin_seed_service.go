package services

import (
	"log"
	"os"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/repositories"
	"angular-n-go-template/backend/security"

	"github.com/google/uuid"
)

// AdminSeedService handles seeding of default admin account
type AdminSeedService struct {
	userRepo *repositories.UserRepository
}

// NewAdminSeedService creates a new admin seed service
func NewAdminSeedService(userRepo *repositories.UserRepository) *AdminSeedService {
	return &AdminSeedService{
		userRepo: userRepo,
	}
}

// SeedDefaultAdmin creates a default admin account if configured and doesn't exist
func (s *AdminSeedService) SeedDefaultAdmin() error {
	// Get admin configuration from environment variables
	adminEmail := os.Getenv("DEFAULT_ADMIN_EMAIL")
	adminUsername := os.Getenv("DEFAULT_ADMIN_USERNAME")
	adminPassword := os.Getenv("DEFAULT_ADMIN_PASSWORD")
	adminFirstName := os.Getenv("DEFAULT_ADMIN_FIRST_NAME")
	adminLastName := os.Getenv("DEFAULT_ADMIN_LAST_NAME")

	// Skip seeding if any required field is empty
	if adminEmail == "" || adminUsername == "" || adminPassword == "" || adminFirstName == "" || adminLastName == "" {
		log.Println("Admin seeding skipped: Environment variables not configured")
		return nil
	}

	// Check if admin account already exists
	emailExists, err := s.userRepo.EmailExists(adminEmail)
	if err != nil {
		return err
	}

	usernameExists, err := s.userRepo.UsernameExists(adminUsername)
	if err != nil {
		return err
	}

	if emailExists || usernameExists {
		log.Println("Admin seeding skipped: Admin account already exists")
		return nil
	}

	// Hash the password
	hashedPassword, err := security.HashPassword(adminPassword)
	if err != nil {
		return err
	}

	// Create admin user
	adminUser := &models.User{
		ID:        uuid.New(),
		Email:     adminEmail,
		Username:  adminUsername,
		Password:  hashedPassword,
		FirstName: adminFirstName,
		LastName:  adminLastName,
		Role:      "admin",
		IsActive:  true,
	}

	// Save admin user to database
	err = s.userRepo.Create(adminUser)
	if err != nil {
		return err
	}

	log.Printf("Default admin account created successfully: %s (%s)", adminUsername, adminEmail)
	return nil
}

