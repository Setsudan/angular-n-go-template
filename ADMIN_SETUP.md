# Admin Account Setup

This document explains how to set up a default admin account for the Angular + Go template application.

## Overview

The system now supports automatic creation of a default admin account during backend initialization. This is controlled through environment variables, making it easy to configure for different environments.

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Default Admin Account Configuration
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123456
DEFAULT_ADMIN_FIRST_NAME=System
DEFAULT_ADMIN_LAST_NAME=Administrator
```

### Required Variables

All five variables must be set for the admin account to be created:
- `DEFAULT_ADMIN_EMAIL` - Admin email address
- `DEFAULT_ADMIN_USERNAME` - Admin username
- `DEFAULT_ADMIN_PASSWORD` - Admin password (minimum 8 characters)
- `DEFAULT_ADMIN_FIRST_NAME` - Admin first name
- `DEFAULT_ADMIN_LAST_NAME` - Admin last name

### Optional Configuration

If any of these variables are missing or empty, the admin seeding will be skipped. This allows you to:
- Skip admin creation in production
- Use different admin credentials per environment
- Manually manage admin accounts

## How It Works

1. **Backend Initialization**: When the backend starts, it checks for the admin environment variables
2. **Account Check**: If variables are set, it checks if an admin account already exists
3. **Account Creation**: If no admin exists, it creates one with the specified credentials
4. **Logging**: The process logs whether admin creation was skipped or successful

## Security Considerations

### Development
- Use the default values for quick setup
- Change credentials before deploying to staging/production

### Production
- **Never use default credentials in production**
- Use strong, unique passwords
- Consider using environment-specific admin accounts
- Remove or leave empty the admin variables after initial setup

## Example Usage

### Development Setup
```bash
# .env file
DEFAULT_ADMIN_EMAIL=admin@localhost.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=devadmin123
DEFAULT_ADMIN_FIRST_NAME=Dev
DEFAULT_ADMIN_LAST_NAME=Admin
```

### Docker Setup
The `docker-compose.yml` file includes default admin environment variables. You can:

1. **Use defaults**: The admin account will be created with the default values in docker-compose.yml
2. **Override with .env**: Create a `.env` file to override the admin settings:
   ```bash
   # .env file
   DEFAULT_ADMIN_EMAIL=admin@docker.local
   DEFAULT_ADMIN_USERNAME=dockeradmin
   DEFAULT_ADMIN_PASSWORD=dockeradmin123
   DEFAULT_ADMIN_FIRST_NAME=Docker
   DEFAULT_ADMIN_LAST_NAME=Admin
   ```
3. **Skip admin creation**: Leave the variables empty in your `.env` file

### Production Setup
```bash
# .env file (after initial setup)
# DEFAULT_ADMIN_EMAIL=
# DEFAULT_ADMIN_USERNAME=
# DEFAULT_ADMIN_PASSWORD=
# DEFAULT_ADMIN_FIRST_NAME=
# DEFAULT_ADMIN_LAST_NAME=
```

## Admin Permissions

The created admin account has full system permissions:
- `profile.read` and `profile.write`
- `users.read`, `users.write`, `users.delete`
- `admin.logs.read` - View system request logs
- `admin.stats.read` - View system statistics
- `admin.users.manage` - Manage user accounts

## Troubleshooting

### Admin Account Not Created
1. Check that all five environment variables are set
2. Verify the variables are loaded correctly (check logs)
3. Ensure no admin account already exists with the same email/username

### Login Issues
1. Verify the admin account was created (check database)
2. Ensure you're using the correct email and password
3. Check that the account is active

### Logs
The backend will log admin seeding activity:
- "Admin seeding skipped: Environment variables not configured"
- "Admin seeding skipped: Admin account already exists"
- "Default admin account created successfully: [username] ([email])"

## Manual Admin Creation

If you prefer to create admin accounts manually:

1. Register a regular user account
2. Update the user's role to "admin" in the database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

Or use the user management interface if available.
