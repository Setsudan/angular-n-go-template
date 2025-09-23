package rbac

import (
    "encoding/json"
    "os"
    "sync"
)

// Role represents a user role with its permissions
type Role struct {
	Name        string   `json:"name"`
	Permissions []string `json:"permissions"`
	Description string   `json:"description"`
}

// Permission represents a system permission
type Permission struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Resource    string `json:"resource"`
	Action      string `json:"action"`
}

// RBACConfig holds the RBAC configuration
type RBACConfig struct {
	Roles       map[string]*Role       `json:"roles"`
	Permissions map[string]*Permission `json:"permissions"`
	mu          sync.RWMutex
}

// DefaultRBACConfig returns the default RBAC configuration
func DefaultRBACConfig() *RBACConfig {
	config := &RBACConfig{
		Roles:       make(map[string]*Role),
		Permissions: make(map[string]*Permission),
	}

	// Define permissions
	permissions := map[string]*Permission{
		"users.read": {
			Name:        "users.read",
			Description: "Read user information",
			Resource:    "users",
			Action:      "read",
		},
		"users.write": {
			Name:        "users.write",
			Description: "Create and update users",
			Resource:    "users",
			Action:      "write",
		},
		"users.delete": {
			Name:        "users.delete",
			Description: "Delete users",
			Resource:    "users",
			Action:      "delete",
		},
		"admin.logs.read": {
			Name:        "admin.logs.read",
			Description: "Read system logs",
			Resource:    "admin.logs",
			Action:      "read",
		},
		"admin.stats.read": {
			Name:        "admin.stats.read",
			Description: "Read system statistics",
			Resource:    "admin.stats",
			Action:      "read",
		},
		"admin.users.manage": {
			Name:        "admin.users.manage",
			Description: "Manage all users",
			Resource:    "admin.users",
			Action:      "manage",
		},
		"profile.read": {
			Name:        "profile.read",
			Description: "Read own profile",
			Resource:    "profile",
			Action:      "read",
		},
		"profile.write": {
			Name:        "profile.write",
			Description: "Update own profile",
			Resource:    "profile",
			Action:      "write",
		},
	}

	// Define roles
	roles := map[string]*Role{
		"user": {
			Name:        "user",
			Description: "Regular user with basic permissions",
			Permissions: []string{
				"profile.read",
				"profile.write",
			},
		},
		"admin": {
			Name:        "admin",
			Description: "Administrator with full system access",
			Permissions: []string{
				"profile.read",
				"profile.write",
				"users.read",
				"users.write",
				"users.delete",
				"admin.logs.read",
				"admin.stats.read",
				"admin.users.manage",
			},
		},
		"moderator": {
			Name:        "moderator",
			Description: "Moderator with limited admin permissions",
			Permissions: []string{
				"profile.read",
				"profile.write",
				"users.read",
				"admin.logs.read",
			},
		},
	}

	// Set permissions and roles
	config.mu.Lock()
	defer config.mu.Unlock()
	
	config.Permissions = permissions
	config.Roles = roles

	return config
}

// HasPermission checks if a role has a specific permission
func (r *RBACConfig) HasPermission(roleName, permission string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()

	role, exists := r.Roles[roleName]
	if !exists {
		return false
	}

	for _, perm := range role.Permissions {
		if perm == permission {
			return true
		}
	}

	return false
}

// GetRole returns a role by name
func (r *RBACConfig) GetRole(roleName string) (*Role, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	role, exists := r.Roles[roleName]
	return role, exists
}

// GetAllRoles returns all available roles
func (r *RBACConfig) GetAllRoles() map[string]*Role {
	r.mu.RLock()
	defer r.mu.RUnlock()

	// Return a copy to prevent external modifications
	roles := make(map[string]*Role)
	for name, role := range r.Roles {
		roles[name] = role
	}
	return roles
}

// AddRole adds a new role to the configuration
func (r *RBACConfig) AddRole(role *Role) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.Roles[role.Name] = role
}

// RemoveRole removes a role from the configuration
func (r *RBACConfig) RemoveRole(roleName string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.Roles, roleName)
}

// AddPermission adds a new permission to the configuration
func (r *RBACConfig) AddPermission(permission *Permission) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.Permissions[permission.Name] = permission
}

// GetPermission returns a permission by name
func (r *RBACConfig) GetPermission(permissionName string) (*Permission, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	permission, exists := r.Permissions[permissionName]
	return permission, exists
}

// LoadRBACConfigFromFile reads an RBAC configuration from a JSON file.
// Returns the parsed configuration or an error if the file cannot be read or parsed.
func LoadRBACConfigFromFile(filename string) (*RBACConfig, error) {
    data, err := os.ReadFile(filename)
    if err != nil {
        return nil, err
    }

    var cfg RBACConfig
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, err
    }

    // Ensure maps are initialized to avoid nil map access
    if cfg.Roles == nil {
        cfg.Roles = make(map[string]*Role)
    }
    if cfg.Permissions == nil {
        cfg.Permissions = make(map[string]*Permission)
    }

    return &cfg, nil
}

