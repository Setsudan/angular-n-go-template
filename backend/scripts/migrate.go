package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/lib/pq"
)

func main() {
	// Get database URL from environment
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/angular_n_go_template?sslmode=disable"
	}

	// Connect to database
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Create migrations table if it doesn't exist
	createMigrationsTable(db)

	// Get list of migration files
	migrationFiles, err := getMigrationFiles()
	if err != nil {
		log.Fatal("Failed to get migration files:", err)
	}

	// Run migrations
	for _, file := range migrationFiles {
		if !isMigrationApplied(db, file) {
			fmt.Printf("Running migration: %s\n", file)
			if err := runMigration(db, file); err != nil {
				log.Fatal("Failed to run migration:", err)
			}
			markMigrationAsApplied(db, file)
			fmt.Printf("Migration %s completed successfully\n", file)
		} else {
			fmt.Printf("Migration %s already applied, skipping\n", file)
		}
	}

	fmt.Println("All migrations completed successfully")
}

func createMigrationsTable(db *sql.DB) {
	query := `
		CREATE TABLE IF NOT EXISTS migrations (
			id SERIAL PRIMARY KEY,
			filename VARCHAR(255) UNIQUE NOT NULL,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`
	if _, err := db.Exec(query); err != nil {
		log.Fatal("Failed to create migrations table:", err)
	}
}

func getMigrationFiles() ([]string, error) {
	migrationsDir := "migrations"
	files, err := ioutil.ReadDir(migrationsDir)
	if err != nil {
		return nil, err
	}

	var migrationFiles []string
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".sql") {
			migrationFiles = append(migrationFiles, file.Name())
		}
	}

	sort.Strings(migrationFiles)
	return migrationFiles, nil
}

func isMigrationApplied(db *sql.DB, filename string) bool {
	query := "SELECT COUNT(*) FROM migrations WHERE filename = $1"
	var count int
	err := db.QueryRow(query, filename).Scan(&count)
	if err != nil {
		log.Fatal("Failed to check migration status:", err)
	}
	return count > 0
}

func runMigration(db *sql.DB, filename string) error {
	filePath := filepath.Join("migrations", filename)
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return err
	}

	_, err = db.Exec(string(content))
	return err
}

func markMigrationAsApplied(db *sql.DB, filename string) {
	query := "INSERT INTO migrations (filename) VALUES ($1)"
	if _, err := db.Exec(query, filename); err != nil {
		log.Fatal("Failed to mark migration as applied:", err)
	}
}
