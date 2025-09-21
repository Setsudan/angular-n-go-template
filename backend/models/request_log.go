package models

import (
	"time"

	"github.com/google/uuid"
)

// RequestLog represents a logged request in the system
type RequestLog struct {
	ID          uuid.UUID `json:"id" redis:"id"`
	RequestID   string    `json:"request_id" redis:"request_id"`
	Method      string    `json:"method" redis:"method"`
	Path        string    `json:"path" redis:"path"`
	UserID      *uuid.UUID `json:"user_id,omitempty" redis:"user_id"`
	IPAddress   string    `json:"ip_address" redis:"ip_address"`
	UserAgent   string    `json:"user_agent" redis:"user_agent"`
	StatusCode  int       `json:"status_code" redis:"status_code"`
	ResponseTime int64    `json:"response_time_ms" redis:"response_time_ms"`
	Timestamp   time.Time `json:"timestamp" redis:"timestamp"`
	Error       *string   `json:"error,omitempty" redis:"error"`
}

// CreateRequestLogRequest represents the request payload for creating a request log
type CreateRequestLogRequest struct {
	RequestID   string     `json:"request_id" binding:"required"`
	Method      string     `json:"method" binding:"required"`
	Path        string     `json:"path" binding:"required"`
	UserID      *uuid.UUID `json:"user_id,omitempty"`
	IPAddress   string     `json:"ip_address" binding:"required"`
	UserAgent   string     `json:"user_agent" binding:"required"`
	StatusCode  int        `json:"status_code" binding:"required"`
	ResponseTime int64     `json:"response_time_ms" binding:"required"`
	Error       *string    `json:"error,omitempty"`
}






