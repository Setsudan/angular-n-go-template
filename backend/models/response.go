package models

import (
	"time"
)

// APIResponse represents the standard API response structure
type APIResponse struct {
	RequestID string      `json:"requestId"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data,omitempty"`
	Status    string      `json:"status"`
	Error     *APIError   `json:"error,omitempty"`
}

// APIError represents an error in the API response
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

// SuccessResponse creates a successful API response
func SuccessResponse(requestID string, data interface{}) APIResponse {
	return APIResponse{
		RequestID: requestID,
		Timestamp: time.Now(),
		Data:      data,
		Status:    "success",
	}
}

// ErrorResponse creates an error API response
func ErrorResponse(requestID string, code, message, details string) APIResponse {
	return APIResponse{
		RequestID: requestID,
		Timestamp: time.Now(),
		Status:    "error",
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
	}
}

// ValidationErrorResponse creates a validation error API response
func ValidationErrorResponse(requestID string, message string) APIResponse {
	return ErrorResponse(requestID, "VALIDATION_ERROR", message, "")
}

// UnauthorizedErrorResponse creates an unauthorized error API response
func UnauthorizedErrorResponse(requestID string) APIResponse {
	return ErrorResponse(requestID, "UNAUTHORIZED", "Unauthorized access", "")
}

// NotFoundErrorResponse creates a not found error API response
func NotFoundErrorResponse(requestID string, resource string) APIResponse {
	return ErrorResponse(requestID, "NOT_FOUND", "Resource not found", resource)
}

// InternalServerErrorResponse creates an internal server error API response
func InternalServerErrorResponse(requestID string, message string) APIResponse {
	return ErrorResponse(requestID, "INTERNAL_SERVER_ERROR", "Internal server error", message)
}




