package controllers

import (
	"net/http"
	"strconv"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UserController handles user-related HTTP requests
type UserController struct {
	userService        *services.UserService
	requestLogService  *services.RequestLogService
}

// NewUserController creates a new user controller
func NewUserController(userService *services.UserService, requestLogService *services.RequestLogService) *UserController {
	return &UserController{
		userService:       userService,
		requestLogService: requestLogService,
	}
}

// GetUsers retrieves all users with pagination
func (c *UserController) GetUsers(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Parse pagination parameters
	limitStr := ctx.DefaultQuery("limit", "10")
	offsetStr := ctx.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, "Invalid limit parameter"))
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, "Invalid offset parameter"))
		return
	}

	// Get users
	users, err := c.userService.GetUsers(limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, users))
}

// GetUser retrieves a user by ID
func (c *UserController) GetUser(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Parse user ID
	userIDStr := ctx.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, "Invalid user ID"))
		return
	}

	// Get user
	user, err := c.userService.GetUser(userID)
	if err != nil {
		if err.Error() == "user not found" {
			ctx.JSON(http.StatusNotFound, models.NotFoundErrorResponse(requestID, "User"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, user))
}

// UpdateUser updates a user
func (c *UserController) UpdateUser(ctx *gin.Context) {
	requestID := ctx.GetString("requestID")

	// Parse user ID
	userIDStr := ctx.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, "Invalid user ID"))
		return
	}

	// Parse request body
	var req models.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, err.Error()))
		return
	}

	// Update user
	user, err := c.userService.UpdateUser(userID, &req)
	if err != nil {
		if err.Error() == "user not found" {
			ctx.JSON(http.StatusNotFound, models.NotFoundErrorResponse(requestID, "User"))
			return
		}
		if _, ok := err.(*services.ValidationError); ok {
			ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, err.Error()))
			return
		}
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, user))
}

// DeleteUser deletes a user
func (c *UserController) DeleteUser(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Parse user ID
	userIDStr := ctx.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, "Invalid user ID"))
		return
	}

	// Delete user
	err = c.userService.DeleteUser(userID)
	if err != nil {
		if err.Error() == "user not found" {
			ctx.JSON(http.StatusNotFound, models.NotFoundErrorResponse(requestID, "User"))
			return
		}
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, gin.H{"message": "User deleted successfully"}))
}







