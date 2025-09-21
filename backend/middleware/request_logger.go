package middleware

import (
	"context"
	"time"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RequestLogger logs all requests to Redis
func RequestLogger(requestLogService *services.RequestLogService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID
		requestID := uuid.New().String()
		c.Set("requestId", requestID)

		// Start timer
		start := time.Now()

		// Process request
		c.Next()

		// Calculate response time
		responseTime := time.Since(start).Milliseconds()

		// Get user ID if authenticated
		var userID *uuid.UUID
		if userIDValue, exists := c.Get("userID"); exists {
			if id, ok := userIDValue.(uuid.UUID); ok {
				userID = &id
			}
		}

		// Get error message if any
		var errorMsg *string
		if len(c.Errors) > 0 {
			errorStr := c.Errors.String()
			errorMsg = &errorStr
		}

		// Create request log
		requestLog := &models.CreateRequestLogRequest{
			RequestID:    requestID,
			Method:       c.Request.Method,
			Path:         c.Request.URL.Path,
			UserID:       userID,
			IPAddress:    c.ClientIP(),
			UserAgent:    c.Request.UserAgent(),
			StatusCode:   c.Writer.Status(),
			ResponseTime: responseTime,
			Error:        errorMsg,
		}

		// Log request asynchronously
		go func() {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			
			if err := requestLogService.LogRequest(ctx, requestLog); err != nil {
				// Log error but don't fail the request
				// In production, you might want to use a proper logger
				_ = err
			}
		}()
	}
}






