# Angular + Go + Redis + PostgreSQL Template

A full-stack web application template featuring Angular frontend, Go backend, Redis for caching, and PostgreSQL for data persistence.

## 🚀 Features

- **Frontend**: Angular 20+ with standalone components, reactive forms, and modern routing
- **Backend**: Go with Gin framework, JWT authentication, and clean architecture
- **Database**: PostgreSQL with migration system
- **Cache**: Redis for session management and caching
- **Authentication**: JWT-based authentication with protected routes
- **Docker**: Complete containerization with docker-compose
- **Development**: Hot reload, linting, testing, and automated setup

## 📋 Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- Docker and Docker Compose
- Git

## 🛠️ Quick Start

### Option 1: Docker Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/setsudan/angular-n-go-template
cd angular-n-go-template

# Start all services with Docker (includes database setup)
docker-compose up -d

# Wait for services to be ready, then check logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:4200
# Backend: http://localhost:8080
```

### Option 2: Development Setup

```bash
# 1. Install dependencies
make install

# 2. Start database services
docker-compose up -d postgres redis

# 3. Run database migrations
make migrate

# 4. Start development servers
make dev
```

### Option 3: Complete Setup (with Make)

```bash
# Run complete setup (installs dependencies, starts services, runs migrations)
make setup

# Start development servers
make dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/health

## 📁 Project Structure

```
angular-n-go-template/
├── backend/                 # Go backend application
│   ├── controllers/         # HTTP request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Data models and DTOs
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic
│   ├── security/           # Authentication and security
│   ├── migrations/         # Database migrations
│   ├── scripts/            # Utility scripts
│   └── main.go            # Application entry point
├── frontend/               # Angular frontend application
│   ├── src/
│   │   └── app/
│   │       ├── components/ # Angular components
│   │       ├── services/   # API services
│   │       ├── guards/     # Route guards
│   │       └── interceptors/ # HTTP interceptors
│   └── package.json
├── docker-compose.yml      # Docker services configuration
└── Makefile               # Development commands
```

## 🔧 Available Commands

### Development
- `make dev` - Start both frontend and backend in development mode
- `make run` - Run backend only
- `make build` - Build both applications
- `make test` - Run tests for both frontend and backend

### Docker
- `make docker-up` - Start all services with Docker
- `make docker-down` - Stop all Docker services
- `make docker-build` - Build Docker images
- `make logs` - View Docker logs

### Database
- `make migrate` - Run database migrations
- `make db-shell` - Connect to PostgreSQL shell
- `make redis-cli` - Connect to Redis CLI

### Utilities
- `make install` - Install all dependencies
- `make clean` - Clean build artifacts
- `make setup` - Complete environment setup

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Register**: Create a new account at `/register`
2. **Login**: Authenticate at `/login`
3. **Protected Routes**: Access dashboard and user management
4. **Auto-logout**: Automatic logout on token expiration

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/logout` - User logout

#### Users
- `GET /api/v1/users` - List users (with pagination)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `username` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Request Logs Table
- `id` (UUID, Primary Key)
- `request_id` (VARCHAR, Unique)
- `method` (VARCHAR)
- `path` (VARCHAR)
- `user_agent` (TEXT)
- `ip_address` (INET)
- `user_id` (UUID, Foreign Key)
- `status_code` (INTEGER)
- `response_time_ms` (INTEGER)
- `created_at` (TIMESTAMP)

## 🔧 Configuration

### Environment Variables

#### For Docker Development (Automatic)
When using `docker-compose up`, environment variables are automatically configured. No `.env` file needed.

#### For Local Development
Create a `.env` file in the project root:

```bash
# Copy the example file
cp env.example .env
```

Then edit `.env` with your local settings:

```env
# Database Configuration (for local development)
DATABASE_URL=postgres://user:password@localhost:5432/angular_n_go_template?sslmode=disable

# Redis Configuration (for local development)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Server Configuration
PORT=8080
GIN_MODE=debug

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

#### Docker vs Local Configuration
- **Docker**: Uses service names (`postgres`, `redis`) for internal communication
- **Local**: Uses `localhost` for direct connections

### Frontend Environment Configuration

The frontend automatically uses the correct API URL based on the environment:

- **Development**: `http://localhost:8080/api/v1` (direct backend connection)
- **Production/Docker**: `/api/v1` (proxied through nginx)

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
go test ./...
```

### E2E Tests
```bash
cd frontend
npm run e2e
```

## 🚀 Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Deployment

1. Build the applications:
   ```bash
   make build
   ```

2. Set up production environment variables

3. Run database migrations:
   ```bash
   make migrate
   ```

4. Start the backend server:
   ```bash
   cd backend && ./bin/main
   ```

5. Serve the frontend (using nginx or similar)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 4200, 5432, 6379, and 8080 are available
2. **Database connection**: Ensure PostgreSQL is running and accessible
3. **Redis connection**: Verify Redis is running and accessible
4. **CORS issues**: Check that CORS_ORIGIN matches your frontend URL
5. **Docker build failures**: 
   - Frontend: Ensure Node.js version is 20+ (updated in Dockerfile)
   - Backend: Check Go version compatibility
6. **Environment variables**: 
   - For Docker: Variables are set automatically in docker-compose.yml
   - For local development: Create `.env` file from `env.example`

### Docker-Specific Issues

#### Backend can't connect to database
```bash
# Check if services are healthy
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

#### Frontend build fails
```bash
# Check Node.js version in container
docker-compose exec frontend node --version

# Rebuild frontend
docker-compose build --no-cache frontend
```

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Clean Docker system
docker system prune -f

# Rebuild and start
docker-compose up -d --build
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Go Documentation](https://golang.org/doc/)
- [Gin Framework](https://gin-gonic.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
