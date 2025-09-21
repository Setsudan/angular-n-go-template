package services

import (
	"os"
	"testing"
)

func TestAdminSeedService_EnvironmentVariables(t *testing.T) {
	// Test case 1: No environment variables set
	os.Clearenv()
	
	email := os.Getenv("DEFAULT_ADMIN_EMAIL")
	username := os.Getenv("DEFAULT_ADMIN_USERNAME")
	password := os.Getenv("DEFAULT_ADMIN_PASSWORD")
	firstName := os.Getenv("DEFAULT_ADMIN_FIRST_NAME")
	lastName := os.Getenv("DEFAULT_ADMIN_LAST_NAME")

	if email != "" || username != "" || password != "" || firstName != "" || lastName != "" {
		t.Error("Expected all environment variables to be empty after clearing")
	}

	// Test case 2: Set environment variables
	os.Setenv("DEFAULT_ADMIN_EMAIL", "admin@test.com")
	os.Setenv("DEFAULT_ADMIN_USERNAME", "admin")
	os.Setenv("DEFAULT_ADMIN_PASSWORD", "password123")
	os.Setenv("DEFAULT_ADMIN_FIRST_NAME", "Test")
	os.Setenv("DEFAULT_ADMIN_LAST_NAME", "Admin")

	email = os.Getenv("DEFAULT_ADMIN_EMAIL")
	username = os.Getenv("DEFAULT_ADMIN_USERNAME")
	password = os.Getenv("DEFAULT_ADMIN_PASSWORD")
	firstName = os.Getenv("DEFAULT_ADMIN_FIRST_NAME")
	lastName = os.Getenv("DEFAULT_ADMIN_LAST_NAME")

	if email != "admin@test.com" {
		t.Errorf("Expected email 'admin@test.com', got '%s'", email)
	}
	if username != "admin" {
		t.Errorf("Expected username 'admin', got '%s'", username)
	}
	if password != "password123" {
		t.Errorf("Expected password 'password123', got '%s'", password)
	}
	if firstName != "Test" {
		t.Errorf("Expected first name 'Test', got '%s'", firstName)
	}
	if lastName != "Admin" {
		t.Errorf("Expected last name 'Admin', got '%s'", lastName)
	}

	// Test case 3: Incomplete configuration
	os.Clearenv()
	os.Setenv("DEFAULT_ADMIN_EMAIL", "admin@test.com")
	// Missing other variables

	email = os.Getenv("DEFAULT_ADMIN_EMAIL")
	username = os.Getenv("DEFAULT_ADMIN_USERNAME")
	password = os.Getenv("DEFAULT_ADMIN_PASSWORD")
	firstName = os.Getenv("DEFAULT_ADMIN_FIRST_NAME")
	lastName = os.Getenv("DEFAULT_ADMIN_LAST_NAME")

	if email != "admin@test.com" {
		t.Errorf("Expected email 'admin@test.com', got '%s'", email)
	}
	if username != "" {
		t.Errorf("Expected empty username, got '%s'", username)
	}
	if password != "" {
		t.Errorf("Expected empty password, got '%s'", password)
	}
	if firstName != "" {
		t.Errorf("Expected empty first name, got '%s'", firstName)
	}
	if lastName != "" {
		t.Errorf("Expected empty last name, got '%s'", lastName)
	}
}
