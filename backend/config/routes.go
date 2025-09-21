package config

import (
	"angular-n-go-template/backend/controllers"
	"angular-n-go-template/backend/middleware"
	"angular-n-go-template/backend/rbac"

	"github.com/gin-gonic/gin"
)

// RouteConfig holds route configuration with permissions
type RouteConfig struct {
	Path        string   `json:"path"`
	Method      string   `json:"method"`
	Handler     gin.HandlerFunc `json:"-"`
	Permissions []string `json:"permissions"`
	Description string   `json:"description"`
	Public      bool     `json:"public"`
}

// RouteGroupConfig holds configuration for a group of routes
type RouteGroupConfig struct {
	Prefix      string         `json:"prefix"`
	Permissions []string       `json:"permissions"`
	Routes      []RouteConfig  `json:"routes"`
	Description string         `json:"description"`
}

// GetRouteConfigurations returns all route configurations
func GetRouteConfigurations(
	authController *controllers.AuthController,
	userController *controllers.UserController,
	adminController *controllers.AdminController,
	rbacConfig *rbac.RBACConfig,
) []RouteGroupConfig {
	return []RouteGroupConfig{
		{
			Prefix:      "/auth",
			Description: "Authentication routes",
			Routes: []RouteConfig{
				{
					Path:        "/register",
					Method:      "POST",
					Handler:     authController.Register,
					Public:      true,
					Description: "Register a new user",
				},
				{
					Path:        "/login",
					Method:      "POST",
					Handler:     authController.Login,
					Public:      true,
					Description: "User login",
				},
				{
					Path:        "/profile",
					Method:      "GET",
					Handler:     authController.GetProfile,
					Permissions: []string{"profile.read"},
					Description: "Get user profile",
				},
				{
					Path:        "/logout",
					Method:      "POST",
					Handler:     authController.Logout,
					Permissions: []string{"profile.read"},
					Description: "User logout",
				},
			},
		},
		{
			Prefix:      "/users",
			Description: "User management routes",
			Permissions: []string{"users.read"}, // Default permission for the group
			Routes: []RouteConfig{
				{
					Path:        "",
					Method:      "GET",
					Handler:     userController.GetUsers,
					Permissions: []string{"users.read"},
					Description: "Get all users",
				},
				{
					Path:        "/:id",
					Method:      "GET",
					Handler:     userController.GetUser,
					Permissions: []string{"users.read"},
					Description: "Get user by ID",
				},
				{
					Path:        "/:id",
					Method:      "PUT",
					Handler:     userController.UpdateUser,
					Permissions: []string{"users.write"},
					Description: "Update user",
				},
				{
					Path:        "/:id",
					Method:      "DELETE",
					Handler:     userController.DeleteUser,
					Permissions: []string{"users.delete"},
					Description: "Delete user",
				},
			},
		},
		{
			Prefix:      "/admin",
			Description: "Admin routes",
			Routes: []RouteConfig{
				{
					Path:        "/logs",
					Method:      "GET",
					Handler:     adminController.GetRequestLogs,
					Permissions: []string{"admin.logs.read"},
					Description: "Get system request logs",
				},
				{
					Path:        "/logs/user/:userId",
					Method:      "GET",
					Handler:     adminController.GetRequestLogsByUser,
					Permissions: []string{"admin.logs.read"},
					Description: "Get request logs for specific user",
				},
				{
					Path:        "/stats",
					Method:      "GET",
					Handler:     adminController.GetSystemStats,
					Permissions: []string{"admin.stats.read"},
					Description: "Get system statistics",
				},
			},
		},
	}
}

// SetupRoutes configures all routes with their permissions
func SetupRoutes(
	router *gin.Engine,
	authController *controllers.AuthController,
	userController *controllers.UserController,
	adminController *controllers.AdminController,
	rbacConfig *rbac.RBACConfig,
) {
	// Health check endpoint (always public)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "angular-n-go-template",
		})
	})

	// Get route configurations
	routeConfigs := GetRouteConfigurations(authController, userController, adminController, rbacConfig)

	// API group
	api := router.Group("/api/v1")

	// Setup each route group
	for _, groupConfig := range routeConfigs {
		group := api.Group(groupConfig.Prefix)

		// Apply default permissions to the group if specified
		if len(groupConfig.Permissions) > 0 {
			group.Use(middleware.AuthMiddleware())
			group.Use(middleware.MultiplePermissionsMiddleware(groupConfig.Permissions, rbacConfig))
		}

		// Setup individual routes
		for _, route := range groupConfig.Routes {
			var handlers []gin.HandlerFunc

			// Add request logger middleware
			handlers = append(handlers, middleware.RequestLogger(nil))

			// Add auth middleware if not public
			if !route.Public {
				handlers = append(handlers, middleware.AuthMiddleware())
			}

			// Add permission middleware if permissions are specified
			if len(route.Permissions) > 0 {
				if len(route.Permissions) == 1 {
					handlers = append(handlers, middleware.PermissionMiddleware(route.Permissions[0], rbacConfig))
				} else {
					handlers = append(handlers, middleware.MultiplePermissionsMiddleware(route.Permissions, rbacConfig))
				}
			}

			// Add the actual handler
			handlers = append(handlers, route.Handler)

			// Register the route
			switch route.Method {
			case "GET":
				group.GET(route.Path, handlers...)
			case "POST":
				group.POST(route.Path, handlers...)
			case "PUT":
				group.PUT(route.Path, handlers...)
			case "DELETE":
				group.DELETE(route.Path, handlers...)
			case "PATCH":
				group.PATCH(route.Path, handlers...)
			}
		}
	}
}
