# RBAC Configuration Guide

This document explains how to configure Role-Based Access Control (RBAC) in the Angular + Go template application.

## Overview

The RBAC system is designed to be easily configurable through JSON configuration files and TypeScript/Go configuration objects. This allows you to:

- Define custom roles and permissions
- Configure route access based on roles or permissions
- Easily add new roles without code changes
- Maintain consistent RBAC across frontend and backend

## Configuration Files

### Backend Configuration

**File:** `backend/config/rbac.json`

```json
{
  "roles": {
    "user": {
      "name": "user",
      "description": "Regular user with basic permissions",
      "permissions": ["profile.read", "profile.write"]
    },
    "admin": {
      "name": "admin", 
      "description": "Administrator with full system access",
      "permissions": [
        "profile.read", "profile.write", "users.read", 
        "users.write", "users.delete", "admin.logs.read",
        "admin.stats.read", "admin.users.manage"
      ]
    }
  },
  "permissions": {
    "profile.read": {
      "name": "profile.read",
      "description": "Read own profile",
      "resource": "profile",
      "action": "read"
    }
  }
}
```

### Frontend Configuration

**File:** `frontend/src/app/config/rbac.json`

Same structure as backend configuration.

## Adding New Roles

### 1. Backend

1. **Update Database Schema:**
   ```sql
   -- Add new role to the CHECK constraint
   ALTER TABLE users DROP CONSTRAINT users_role_check;
   ALTER TABLE users ADD CONSTRAINT users_role_check 
   CHECK (role IN ('admin', 'user', 'moderator', 'your_new_role'));
   ```

2. **Update Configuration:**
   ```json
   {
     "roles": {
       "your_new_role": {
         "name": "your_new_role",
         "description": "Description of your new role",
         "permissions": ["permission1", "permission2"]
       }
     }
   }
   ```

3. **Add Route Protection:**
   ```go
   // In backend/config/routes.go
   {
     Path:        "/your-route",
     Method:      "GET",
     Handler:     yourController.YourHandler,
     Permissions: []string{"your.permission"},
     Description: "Your route description",
   }
   ```

### 2. Frontend

1. **Update Route Configuration:**
   ```typescript
   // In frontend/src/app/config/routes.config.ts
   {
     path: 'your-route',
     loadComponent: () => import('../pages/your-page/your-page.component').then(m => m.YourPageComponent),
     canActivate: ['AuthGuard', 'PermissionGuard'],
     data: {
       permissions: ['your.permission'],
       description: 'Your route description',
     },
   }
   ```

2. **Update Component Logic:**
   ```typescript
   // In your component
   canAccessFeature(): boolean {
     return this.authService.hasPermission('your.permission');
   }
   ```

## Adding New Permissions

### 1. Define Permission

```json
{
  "permissions": {
    "your.permission": {
      "name": "your.permission",
      "description": "Description of what this permission allows",
      "resource": "your_resource",
      "action": "your_action"
    }
  }
}
```

### 2. Assign to Roles

```json
{
  "roles": {
    "admin": {
      "permissions": [
        "existing.permission",
        "your.permission"
      ]
    }
  }
}
```

### 3. Use in Routes

```go
// Backend
{
  Path:        "/protected-route",
  Method:      "GET",
  Handler:     yourHandler,
  Permissions: []string{"your.permission"},
}
```

```typescript
// Frontend
{
  path: 'protected-route',
  data: {
    permissions: ['your.permission']
  }
}
```

## Route Protection Examples

### Backend Route Protection

```go
// Single permission
{
  Path:        "/users",
  Method:      "GET",
  Handler:     userController.GetUsers,
  Permissions: []string{"users.read"},
}

// Multiple permissions (user needs ANY of these)
{
  Path:        "/admin",
  Method:      "GET", 
  Handler:     adminController.GetDashboard,
  Permissions: []string{"admin.logs.read", "admin.stats.read"},
}

// Public route
{
  Path:        "/health",
  Method:      "GET",
  Handler:     healthHandler,
  Public:      true,
}
```

### Frontend Route Protection

```typescript
// Single permission
{
  path: 'users',
  data: {
    permissions: ['users.read']
  }
}

// Multiple permissions (user needs ANY of these)
{
  path: 'admin',
  data: {
    permissions: ['admin.logs.read', 'admin.stats.read']
  }
}

// Role-based protection
{
  path: 'admin-only',
  data: {
    roles: ['admin']
  }
}

// Public route
{
  path: 'login',
  data: {
    public: true
  }
}
```

## Component-Level Permission Checks

```typescript
// In your component
export class YourComponent {
  constructor(private authService: AuthService) {}

  // Check single permission
  canEdit(): boolean {
    return this.authService.hasPermission('users.write');
  }

  // Check multiple permissions
  canAccessAdmin(): boolean {
    return this.authService.hasAnyPermission(['admin.logs.read', 'admin.stats.read']);
  }

  // Check role
  isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  // Check multiple roles
  isAdminOrModerator(): boolean {
    return this.authService.hasAnyRole(['admin', 'moderator']);
  }
}
```

## Template-Level Permission Checks

```html
<!-- Show/hide based on permission -->
<div *ngIf="authService.hasPermission('admin.logs.read')">
  Admin logs content
</div>

<!-- Show/hide based on role -->
<button *ngIf="authService.hasRole('admin')" (click)="deleteUser()">
  Delete User
</button>

<!-- Show/hide based on multiple permissions -->
<div *ngIf="authService.hasAnyPermission(['users.read', 'users.write'])">
  User management content
</div>
```

## Dynamic Configuration Loading

### Backend

```go
// Load configuration from file
func LoadRBACConfigFromFile(filename string) (*RBACConfig, error) {
    data, err := ioutil.ReadFile(filename)
    if err != nil {
        return nil, err
    }
    
    var config RBACConfig
    err = json.Unmarshal(data, &config)
    return &config, err
}
```

### Frontend

```typescript
// Load configuration from API
async loadRBACConfig(): Promise<void> {
  const config = await this.http.get<RBACConfig>('/api/v1/config/rbac').toPromise();
  this.rbacService.updateConfig(config);
}
```

## Best Practices

1. **Consistent Naming:** Use consistent naming conventions for permissions (e.g., `resource.action`)

2. **Granular Permissions:** Create specific permissions rather than broad ones

3. **Documentation:** Always document what each permission allows

4. **Testing:** Test permission changes thoroughly

5. **Backup:** Keep backups of configuration files

6. **Version Control:** Track configuration changes in version control

## Migration Guide

### From Hardcoded to Configurable

1. **Identify hardcoded roles/permissions** in your code
2. **Create configuration files** with current setup
3. **Update code** to use configuration
4. **Test thoroughly** to ensure same behavior
5. **Document** the new configuration system

### Example Migration

**Before (Hardcoded):**
```go
if userRole == "admin" {
    // Allow access
}
```

**After (Configurable):**
```go
if rbacConfig.HasPermission(userRole, "admin.logs.read") {
    // Allow access
}
```

## Troubleshooting

### Common Issues

1. **Permission not working:** Check if permission is defined in configuration
2. **Route not accessible:** Verify route configuration and user permissions
3. **Configuration not loading:** Check file paths and JSON syntax

### Debug Tips

1. **Log permissions:** Add logging to see what permissions are being checked
2. **Test with different roles:** Verify behavior with different user roles
3. **Check configuration:** Validate JSON configuration files

## Security Considerations

1. **Validate permissions** on both frontend and backend
2. **Never trust frontend** - always validate on backend
3. **Use HTTPS** for configuration loading
4. **Regular audits** of permissions and roles
5. **Principle of least privilege** - give minimum required permissions

