package services

import (
	"context"
	"time"

	"angular-n-go-template/backend/models"
	"angular-n-go-template/backend/repositories"

	"github.com/google/uuid"
)

// RequestLogService handles request logging business logic
type RequestLogService struct {
	requestLogRepo *repositories.RequestLogRepository
}

// NewRequestLogService creates a new request log service
func NewRequestLogService(requestLogRepo *repositories.RequestLogRepository) *RequestLogService {
	return &RequestLogService{requestLogRepo: requestLogRepo}
}

// LogRequest logs a request
func (s *RequestLogService) LogRequest(ctx context.Context, req *models.CreateRequestLogRequest) error {
	log := &models.RequestLog{
		ID:           uuid.New(),
		RequestID:    req.RequestID,
		Method:       req.Method,
		Path:         req.Path,
		UserID:       req.UserID,
		IPAddress:    req.IPAddress,
		UserAgent:    req.UserAgent,
		StatusCode:   req.StatusCode,
		ResponseTime: req.ResponseTime,
		Timestamp:    time.Now(),
		Error:        req.Error,
	}

	return s.requestLogRepo.Create(ctx, log)
}

// GetRequestLog retrieves a request log by request ID
func (s *RequestLogService) GetRequestLog(ctx context.Context, requestID string) (*models.RequestLog, error) {
	return s.requestLogRepo.GetByRequestID(ctx, requestID)
}

// GetUserRequestLogs retrieves request logs for a specific user
func (s *RequestLogService) GetUserRequestLogs(ctx context.Context, userID uuid.UUID, limit int) ([]*models.RequestLog, error) {
	return s.requestLogRepo.GetByUserID(ctx, userID, limit)
}

// GetRecentRequestLogs retrieves recent request logs
func (s *RequestLogService) GetRecentRequestLogs(ctx context.Context, limit int) ([]*models.RequestLog, error) {
	return s.requestLogRepo.GetRecent(ctx, limit)
}

// GetRecentLogs retrieves recent request logs (admin method)
func (s *RequestLogService) GetRecentLogs(limit int) ([]*models.RequestLog, error) {
	ctx := context.Background()
	return s.requestLogRepo.GetRecent(ctx, limit)
}

// GetLogsByUser retrieves request logs for a specific user (admin method)
func (s *RequestLogService) GetLogsByUser(userIDStr string, limit int) ([]*models.RequestLog, error) {
	ctx := context.Background()
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, err
	}
	return s.requestLogRepo.GetByUserID(ctx, userID, limit)
}

// GetSystemStats retrieves system statistics (admin method)
func (s *RequestLogService) GetSystemStats() (map[string]interface{}, error) {
	ctx := context.Background()
	
	// Get recent logs to calculate stats
	logs, err := s.requestLogRepo.GetRecent(ctx, 1000)
	if err != nil {
		return nil, err
	}

	// Calculate basic stats
	totalRequests := len(logs)
	statusCodes := make(map[int]int)
	methods := make(map[string]int)
	paths := make(map[string]int)
	
	for _, log := range logs {
		statusCodes[log.StatusCode]++
		methods[log.Method]++
		paths[log.Path]++
	}

	return map[string]interface{}{
		"total_requests": totalRequests,
		"status_codes":   statusCodes,
		"methods":        methods,
		"top_paths":      paths,
		"timestamp":      time.Now(),
	}, nil
}






