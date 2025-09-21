package main

import (
	"log"
	"os"

	"angular-n-go-template/backend/controllers"
	"angular-n-go-template/backend/middleware"
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

	// Initialize controllers
	authController := controllers.NewAuthController(authService, requestLogService)
	userController := controllers.NewUserController(userService, requestLogService)

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:4200"
	}
	config.AllowOrigins = []string{corsOrigin}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	// Middleware
	router.Use(middleware.RequestLogger(requestLogService))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "angular-n-go-template",
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
			auth.GET("/profile", middleware.AuthMiddleware(), authController.GetProfile)
			auth.POST("/logout", middleware.AuthMiddleware(), authController.Logout)
		}

		// User routes (protected)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("", userController.GetUsers)
			users.GET("/:id", userController.GetUser)
			users.PUT("/:id", userController.UpdateUser)
			users.DELETE("/:id", userController.DeleteUser)
		}
	}

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(router.Run(":" + port))
}
