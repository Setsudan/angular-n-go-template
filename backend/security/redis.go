package security

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

// InitRedis initializes and returns a Redis client
func InitRedis() *redis.Client {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal("Failed to parse Redis URL:", err)
	}

	client := redis.NewClient(opt)

	// Wait for Redis to be ready with retries
	maxRetries := 30
	retryInterval := 2 * time.Second
	
	for i := 0; i < maxRetries; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		_, err = client.Ping(ctx).Result()
		cancel()
		
		if err != nil {
			log.Printf("Redis not ready, retrying in %v... (attempt %d/%d)", retryInterval, i+1, maxRetries)
			time.Sleep(retryInterval)
			continue
		}
		break
	}

	// Final connection test
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err = client.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis after retries:", err)
	}

	log.Println("Successfully connected to Redis")
	return client
}





