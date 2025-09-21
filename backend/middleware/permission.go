package middleware

import (
	"net/http"

	"angular-n-go-template/backend/rbac"
	"angular-n-go-template/backend/models"

	"github.com/gin-gonic/gin"
)

// PermissionMiddleware checks if the user has the required permission
func PermissionMiddleware(requiredPermission string, rbacConfig *rbac.RBACConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusForbidden, models.ForbiddenErrorResponse(c.GetString("requestId")))
			c.Abort()
			return
		}

		role, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusForbidden, models.ForbiddenErrorResponse(c.GetString("requestId")))
			c.Abort()
			return
		}

		if !rbacConfig.HasPermission(role, requiredPermission) {
			c.JSON(http.StatusForbidden, models.ForbiddenErrorResponse(c.GetString("requestId")))
			c.Abort()
			return
		}

		c.Next()
	}
}

// MultiplePermissionsMiddleware checks if the user has any of the required permissions
func MultiplePermissionsMiddleware(requiredPermissions []string, rbacConfig *rbac.RBACConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusForbidden, models.ForbiddenErrorResponse(c.GetString("requestId")))
			c.Abort()
			return
		}

		role, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusForbidden, models.ForbiddenErrorResponse(c.GetString("requestId")))
			c.Abort()
			return
		}

		hasPermission := false
		for _, permission := range requiredPermissions {
			if rbacConfig.HasPermission(role, permission) {
				hasPermission = true
				break
			}
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, models.ForbiddenErrorResponse(c.GetString("requestId")))
			c.Abort()
			return
		}

		c.Next()
	}
}

