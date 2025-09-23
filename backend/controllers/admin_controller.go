package controllers

import (
	"net/http"
	"strconv"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/services"

	"github.com/gin-gonic/gin"
)

// AdminController handles admin-related HTTP requests
type AdminController struct {
	requestLogService *services.RequestLogService
}

// NewAdminController creates a new admin controller
func NewAdminController(requestLogService *services.RequestLogService) *AdminController {
	return &AdminController{
		requestLogService: requestLogService,
	}
}

// GetRequestLogs retrieves all request logs (admin only)
func (c *AdminController) GetRequestLogs(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Get limit from query parameter, default to 100
	limitStr := ctx.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000 // Cap at 1000 for performance
	}

	// Get request logs
	logs, err := c.requestLogService.GetRecentLogs(limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, gin.H{
		"logs":  logs,
		"count": len(logs),
		"limit": limit,
	}))
}

// GetRequestLogsByUser retrieves request logs for a specific user (admin only)
func (c *AdminController) GetRequestLogsByUser(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Get user ID from URL parameter
	userIDStr := ctx.Param("userId")
	if userIDStr == "" {
		ctx.JSON(http.StatusBadRequest, models.ValidationErrorResponse(requestID, "User ID is required"))
		return
	}

	// Get limit from query parameter, default to 50
	limitStr := ctx.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500 // Cap at 500 for performance
	}

	// Get request logs for user
	logs, err := c.requestLogService.GetLogsByUser(userIDStr, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, gin.H{
		"logs":    logs,
		"count":   len(logs),
		"limit":   limit,
		"user_id": userIDStr,
	}))
}

// GetSystemStats retrieves system statistics (admin only)
func (c *AdminController) GetSystemStats(ctx *gin.Context) {
	requestID := ctx.GetString("requestId")

	// Get basic stats
	stats, err := c.requestLogService.GetSystemStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, models.InternalServerErrorResponse(requestID, err.Error()))
		return
	}

	ctx.JSON(http.StatusOK, models.SuccessResponse(requestID, stats))
}

