package main

import (
	"log"
	"os"

	"angular-n-go-template/backend/config"
	"angular-n-go-template/backend/controllers"
	"angular-n-go-template/backend/middleware"
	"angular-n-go-template/backend/rbac"
	"angular-n-go-template/backend/repositories"
	"angular-n-go-template/backend/security"
	"angular-n-go-template/backend/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database
	db := security.InitDB()
	defer db.Close()

	// Initialize Redis
	redisClient := security.InitRedis()
	defer redisClient.Close()

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	requestLogRepo := repositories.NewRequestLogRepository(redisClient)

	// Initialize services
	authService := services.NewAuthService(userRepo, requestLogRepo)
	userService := services.NewUserService(userRepo)
	requestLogService := services.NewRequestLogService(requestLogRepo)
	adminSeedService := services.NewAdminSeedService(userRepo)

	// Seed default admin account if configured
	if err := adminSeedService.SeedDefaultAdmin(); err != nil {
		log.Printf("Failed to seed default admin account: %v", err)
	}

	// Initialize controllers
	authController := controllers.NewAuthController(authService, requestLogService)
	userController := controllers.NewUserController(userService, requestLogService)
	adminController := controllers.NewAdminController(requestLogService)

	// Initialize RBAC configuration
	rbacConfig := rbac.DefaultRBACConfig()

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:4200"
	}
	corsConfig.AllowOrigins = []string{corsOrigin}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	corsConfig.AllowCredentials = true
	router.Use(cors.New(corsConfig))

	// Middleware
	router.Use(middleware.RequestLogger(requestLogService))

	// Setup routes with configurable RBAC
	config.SetupRoutes(router, authController, userController, adminController, rbacConfig)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(router.Run(":" + port))
}
