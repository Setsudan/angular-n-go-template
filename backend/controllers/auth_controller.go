package controllers

import (
	"net/http"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AuthController handles authentication-related HTTP requests
type AuthController struct {
	authService        *services.AuthService
	requestLogService  *services.RequestLogService
}

// NewAuthController creates a new auth controller
func NewAuthController(authService *services.AuthService, requestLogService *services.RequestLogService) *AuthController {
	return &AuthController{
		authService:       authService,
		requestLogService: requestLogService,
	}
}

// Register registers a new user
func (c *AuthController) Register(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Parse request body
	var req models.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, err.Error()))
		return
	}

	// Register user
	user, err := c.authService.Register(&req)
	if err != nil {
		if _, ok := err.(*services.ValidationError); ok {
			ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, err.Error()))
			return
		}
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusCreated, models.SuccessResponse(requestID, user))
}

// Login authenticates a user
func (c *AuthController) Login(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Parse request body
	var req models.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, err.Error()))
		return
	}

	// Login user
	response, err := c.authService.Login(&req)
	if err != nil {
		if _, ok := err.(*services.ValidationError); ok {
			ctx.JSON(http.StatusUnauthorized, models.ValidationErrorResponse(requestID, err.Error()))
			return
		}
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, response))
}

// Logout logs out a user
func (c *AuthController) Logout(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Get user ID from context
	userIDValue, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, models.UnauthorizedErrorResponse(requestID))
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, models.UnauthorizedErrorResponse(requestID))
		return
	}

	// Logout user
	err := c.authService.Logout(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, gin.H{"message": "Logged out successfully"}))
}

// GetProfile retrieves the current user's profile
func (c *AuthController) GetProfile(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Get user ID from context
	userIDValue, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, models.UnauthorizedErrorResponse(requestID))
		return
	}

	_, ok := userIDValue.(uuid.UUID)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, models.UnauthorizedErrorResponse(requestID))
		return
	}

	// Get user profile
	user, err := c.authService.ValidateToken(ctx.GetHeader("Authorization")[7:]) // Remove "Bearer " prefix
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, models.UnauthorizedErrorResponse(requestID))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, user))
}




