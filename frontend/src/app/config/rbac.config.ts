export interface Permission {
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export interface RouteConfig {
  path: string;
  permissions?: string[];
  roles?: string[];
  public?: boolean;
  description?: string;
}

export interface RBACConfig {
  roles: Record<string, Role>;
  permissions: Record<string, Permission>;
  routes: RouteConfig[];
}

export const DEFAULT_RBAC_CONFIG: RBACConfig = {
  roles: {
    user: {
      name: 'user',
      description: 'Regular user with basic permissions',
      permissions: [
        'profile.read',
        'profile.write',
      ],
    },
    admin: {
      name: 'admin',
      description: 'Administrator with full system access',
      permissions: [
        'profile.read',
        'profile.write',
        'users.read',
        'users.write',
        'users.delete',
        'admin.logs.read',
        'admin.stats.read',
        'admin.users.manage',
      ],
    },
    moderator: {
      name: 'moderator',
      description: 'Moderator with limited admin permissions',
      permissions: [
        'profile.read',
        'profile.write',
        'users.read',
        'admin.logs.read',
      ],
    },
  },
  permissions: {
    'profile.read': {
      name: 'profile.read',
      description: 'Read own profile',
      resource: 'profile',
      action: 'read',
    },
    'profile.write': {
      name: 'profile.write',
      description: 'Update own profile',
      resource: 'profile',
      action: 'write',
    },
    'users.read': {
      name: 'users.read',
      description: 'Read user information',
      resource: 'users',
      action: 'read',
    },
    'users.write': {
      name: 'users.write',
      description: 'Create and update users',
      resource: 'users',
      action: 'write',
    },
    'users.delete': {
      name: 'users.delete',
      description: 'Delete users',
      resource: 'users',
      action: 'delete',
    },
    'admin.logs.read': {
      name: 'admin.logs.read',
      description: 'Read system logs',
      resource: 'admin.logs',
      action: 'read',
    },
    'admin.stats.read': {
      name: 'admin.stats.read',
      description: 'Read system statistics',
      resource: 'admin.stats',
      action: 'read',
    },
    'admin.users.manage': {
      name: 'admin.users.manage',
      description: 'Manage all users',
      resource: 'admin.users',
      action: 'manage',
    },
  },
  routes: [
    {
      path: '/dashboard',
      permissions: ['profile.read'],
      description: 'User dashboard',
    },
    {
      path: '/admin',
      permissions: ['admin.logs.read', 'admin.stats.read'],
      description: 'Admin dashboard',
    },
    {
      path: '/users',
      permissions: ['users.read'],
      description: 'User management',
    },
    {
      path: '/profile',
      permissions: ['profile.read'],
      description: 'User profile',
    },
  ],
};

export class RBACService {
  private config: RBACConfig;

  constructor(config: RBACConfig = DEFAULT_RBAC_CONFIG) {
    this.config = config;
  }

  hasPermission(userRole: string, permission: string): boolean {
    const role = this.config.roles[userRole];
    if (!role) {
      return false;
    }

    return role.permissions.includes(permission);
  }

  hasAnyPermission(userRole: string, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  hasAllPermissions(userRole: string, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  hasRole(userRole: string, requiredRole: string): boolean {
    return userRole === requiredRole;
  }

  hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  canAccessRoute(userRole: string, routePath: string): boolean {
    const route = this.config.routes.find(r => r.path === routePath);
    if (!route) {
      return true; // Allow access to routes not in configuration
    }

    if (route.public) {
      return true;
    }

    if (route.roles && route.roles.length > 0) {
      return this.hasAnyRole(userRole, route.roles);
    }

    if (route.permissions && route.permissions.length > 0) {
      return this.hasAnyPermission(userRole, route.permissions);
    }

    return true;
  }

  getRole(userRole: string): Role | undefined {
    return this.config.roles[userRole];
  }

  getAllRoles(): Record<string, Role> {
    return { ...this.config.roles };
  }

  getPermission(permission: string): Permission | undefined {
    return this.config.permissions[permission];
  }

  getAllPermissions(): Record<string, Permission> {
    return { ...this.config.permissions };
  }

  updateConfig(newConfig: RBACConfig): void {
    this.config = newConfig;
  }

  addRole(role: Role): void {
    this.config.roles[role.name] = role;
  }

  removeRole(roleName: string): void {
    delete this.config.roles[roleName];
  }

  addPermission(permission: Permission): void {
    this.config.permissions[permission.name] = permission;
  }

  removePermission(permissionName: string): void {
    delete this.config.permissions[permissionName];
  }
}

