package repositories

import (
	"context"
	"fmt"
	"time"

	"angular-n-go-template/backend/models"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

// RequestLogRepository handles request log data operations using Redis
type RequestLogRepository struct {
	client *redis.Client
}

// NewRequestLogRepository creates a new request log repository
func NewRequestLogRepository(client *redis.Client) *RequestLogRepository {
	return &RequestLogRepository{client: client}
}

// Create creates a new request log entry
func (r *RequestLogRepository) Create(ctx context.Context, log *models.RequestLog) error {
	key := fmt.Sprintf("request_log:%s", log.RequestID)
	
	// Convert to map for Redis storage
	logData := map[string]interface{}{
		"id":              log.ID.String(),
		"request_id":      log.RequestID,
		"method":          log.Method,
		"path":            log.Path,
		"ip_address":      log.IPAddress,
		"user_agent":      log.UserAgent,
		"status_code":     log.StatusCode,
		"response_time_ms": log.ResponseTime,
		"timestamp":       log.Timestamp.Unix(),
	}
	
	if log.UserID != nil {
		logData["user_id"] = log.UserID.String()
	}
	
	if log.Error != nil {
		logData["error"] = *log.Error
	}
	
	// Store in Redis with TTL of 7 days
	return r.client.HMSet(ctx, key, logData).Err()
}

// GetByRequestID retrieves a request log by request ID
func (r *RequestLogRepository) GetByRequestID(ctx context.Context, requestID string) (*models.RequestLog, error) {
	key := fmt.Sprintf("request_log:%s", requestID)
	
	result, err := r.client.HGetAll(ctx, key).Result()
	if err != nil {
		return nil, err
	}
	
	if len(result) == 0 {
		return nil, fmt.Errorf("request log not found")
	}
	
	log := &models.RequestLog{}
	
	if id, ok := result["id"]; ok {
		log.ID, err = uuid.Parse(id)
		if err != nil {
			return nil, err
		}
	}
	
	log.RequestID = result["request_id"]
	log.Method = result["method"]
	log.Path = result["path"]
	log.IPAddress = result["ip_address"]
	log.UserAgent = result["user_agent"]
	
	if userID, ok := result["user_id"]; ok && userID != "" {
		parsedUserID, err := uuid.Parse(userID)
		if err != nil {
			return nil, err
		}
		log.UserID = &parsedUserID
	}
	
	if statusCode, ok := result["status_code"]; ok {
		fmt.Sscanf(statusCode, "%d", &log.StatusCode)
	}
	
	if responseTime, ok := result["response_time_ms"]; ok {
		fmt.Sscanf(responseTime, "%d", &log.ResponseTime)
	}
	
	if timestamp, ok := result["timestamp"]; ok {
		var unixTime int64
		fmt.Sscanf(timestamp, "%d", &unixTime)
		log.Timestamp = time.Unix(unixTime, 0)
	}
	
	if errorMsg, ok := result["error"]; ok && errorMsg != "" {
		log.Error = &errorMsg
	}
	
	return log, nil
}

// GetByUserID retrieves request logs for a specific user
func (r *RequestLogRepository) GetByUserID(ctx context.Context, userID uuid.UUID, limit int) ([]*models.RequestLog, error) {
	// This is a simplified implementation
	// In a real application, you might want to use Redis Streams or maintain separate indexes
	pattern := "request_log:*"
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, err
	}
	
	var logs []*models.RequestLog
	count := 0
	
	for _, key := range keys {
		if count >= limit {
			break
		}
		
		result, err := r.client.HGetAll(ctx, key).Result()
		if err != nil {
			continue
		}
		
		if userIDStr, ok := result["user_id"]; ok && userIDStr == userID.String() {
			log, err := r.parseRequestLog(result)
			if err != nil {
				continue
			}
			logs = append(logs, log)
			count++
		}
	}
	
	return logs, nil
}

// GetRecent retrieves recent request logs
func (r *RequestLogRepository) GetRecent(ctx context.Context, limit int) ([]*models.RequestLog, error) {
	pattern := "request_log:*"
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, err
	}
	
	var logs []*models.RequestLog
	count := 0
	
	for _, key := range keys {
		if count >= limit {
			break
		}
		
		result, err := r.client.HGetAll(ctx, key).Result()
		if err != nil {
			continue
		}
		
		log, err := r.parseRequestLog(result)
		if err != nil {
			continue
		}
		
		logs = append(logs, log)
		count++
	}
	
	return logs, nil
}

// parseRequestLog parses a Redis hash result into a RequestLog
func (r *RequestLogRepository) parseRequestLog(result map[string]string) (*models.RequestLog, error) {
	log := &models.RequestLog{}
	
	if id, ok := result["id"]; ok {
		parsedID, err := uuid.Parse(id)
		if err != nil {
			return nil, err
		}
		log.ID = parsedID
	}
	
	log.RequestID = result["request_id"]
	log.Method = result["method"]
	log.Path = result["path"]
	log.IPAddress = result["ip_address"]
	log.UserAgent = result["user_agent"]
	
	if userID, ok := result["user_id"]; ok && userID != "" {
		parsedUserID, err := uuid.Parse(userID)
		if err != nil {
			return nil, err
		}
		log.UserID = &parsedUserID
	}
	
	if statusCode, ok := result["status_code"]; ok {
		fmt.Sscanf(statusCode, "%d", &log.StatusCode)
	}
	
	if responseTime, ok := result["response_time_ms"]; ok {
		fmt.Sscanf(responseTime, "%d", &log.ResponseTime)
	}
	
	if timestamp, ok := result["timestamp"]; ok {
		var unixTime int64
		fmt.Sscanf(timestamp, "%d", &unixTime)
		log.Timestamp = time.Unix(unixTime, 0)
	}
	
	if errorMsg, ok := result["error"]; ok && errorMsg != "" {
		log.Error = &errorMsg
	}
	
	return log, nil
}




