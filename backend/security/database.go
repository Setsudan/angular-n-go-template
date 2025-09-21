package security

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// InitDB initializes and returns a PostgreSQL database connection
func InitDB() *sql.DB {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/angular_n_go_template?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to open database connection:", err)
	}

	// Wait for database to be ready with retries
	maxRetries := 30
	retryInterval := 2 * time.Second
	
	for i := 0; i < maxRetries; i++ {
		if err := db.Ping(); err != nil {
			log.Printf("Database not ready, retrying in %v... (attempt %d/%d)", retryInterval, i+1, maxRetries)
			time.Sleep(retryInterval)
			continue
		}
		break
	}

	// Final connection test
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database after retries:", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * 60 * 60 * 1000 * 1000 * 1000) // 5 minutes

	log.Println("Successfully connected to PostgreSQL database")
	return db
}





