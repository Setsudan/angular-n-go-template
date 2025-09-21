package repositories

import (
	"database/sql"
	"fmt"

	"angular-n-go-template/backend/models"

	"github.com/google/uuid"
)

// UserRepository handles user data operations
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	query := `
		INSERT INTO users (id, email, username, password, first_name, last_name, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	
	_, err := r.db.Exec(query, user.ID, user.Email, user.Username, user.Password, 
		user.FirstName, user.LastName, user.IsActive, user.CreatedAt, user.UpdatedAt)
	
	return err
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(id uuid.UUID) (*models.User, error) {
	query := `
		SELECT id, email, username, password, first_name, last_name, is_active, created_at, updated_at
		FROM users WHERE id = $1
	`
	
	user := &models.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.Username, &user.Password,
		&user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	
	return user, nil
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, username, password, first_name, last_name, is_active, created_at, updated_at
		FROM users WHERE email = $1
	`
	
	user := &models.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Username, &user.Password,
		&user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	
	return user, nil
}

// GetByUsername retrieves a user by username
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	query := `
		SELECT id, email, username, password, first_name, last_name, is_active, created_at, updated_at
		FROM users WHERE username = $1
	`
	
	user := &models.User{}
	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.Email, &user.Username, &user.Password,
		&user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	
	return user, nil
}

// GetAll retrieves all users with pagination
func (r *UserRepository) GetAll(limit, offset int) ([]*models.User, error) {
	query := `
		SELECT id, email, username, password, first_name, last_name, is_active, created_at, updated_at
		FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2
	`
	
	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID, &user.Email, &user.Username, &user.Password,
			&user.FirstName, &user.LastName, &user.IsActive, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	
	return users, nil
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
	query := `
		UPDATE users 
		SET email = $2, username = $3, password = $4, first_name = $5, last_name = $6, 
		    is_active = $7, updated_at = $8
		WHERE id = $1
	`
	
	_, err := r.db.Exec(query, user.ID, user.Email, user.Username, user.Password,
		user.FirstName, user.LastName, user.IsActive, user.UpdatedAt)
	
	return err
}

// Delete deletes a user by ID
func (r *UserRepository) Delete(id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

// EmailExists checks if an email already exists
func (r *UserRepository) EmailExists(email string) (bool, error) {
	query := `SELECT COUNT(*) FROM users WHERE email = $1`
	var count int
	err := r.db.QueryRow(query, email).Scan(&count)
	return count > 0, err
}

// UsernameExists checks if a username already exists
func (r *UserRepository) UsernameExists(username string) (bool, error) {
	query := `SELECT COUNT(*) FROM users WHERE username = $1`
	var count int
	err := r.db.QueryRow(query, username).Scan(&count)
	return count > 0, err
}





