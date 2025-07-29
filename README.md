# Social Messaging Application Backend

A comprehensive Spring Boot backend system for a social messaging application with user authentication, real-time messaging, and follower relationships.

## Features

### 🔐 Authentication System
- JWT-based authentication with login/register endpoints
- Secure password hashing using BCrypt
- Role-based access control (USER, ADMIN roles)
- Refresh token mechanism for session management
- Logout functionality with token invalidation

### 👥 User Management
- User registration with email validation
- User profile management (view, update profile information)
- Password change functionality
- User search capabilities

### 💬 Messaging System
- Real-time messaging using WebSocket/STOMP protocol
- Direct messages between users
- Group conversations support
- Message history retrieval with pagination
- Message status tracking (sent, delivered, read)
- Reply to messages functionality

### 🤝 Follower/Following System
- Follow/unfollow functionality between users
- Follower and following lists with pagination
- Follow request system for private accounts
- Accept/reject follow requests

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Security**: Spring Security 6 with JWT
- **Database**: MySQL (configurable to PostgreSQL)
- **ORM**: JPA/Hibernate
- **Real-time**: WebSocket with STOMP
- **Documentation**: Swagger/OpenAPI 3
- **Testing**: JUnit 5, Mockito
- **Build Tool**: Maven

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+ (or PostgreSQL 12+)

## Setup Instructions

### 1. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE messaging_app;
```

### 2. Configuration

Update `src/main/resources/application.yml` with your database credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/messaging_app?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
    username: your_username
    password: your_password
```

### 3. Environment Variables

Set the following environment variables (optional):
```bash
export JWT_SECRET=your-secret-key-here
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

### 4. Build and Run

```bash
# Clone the repository
git clone <repository-url>
cd messaging-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Documentation

Once the application is running, access the API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/me` - Get current user profile
- `GET /api/users/{username}` - Get user by username
- `PUT /api/users/me` - Update user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/search` - Search users
- `POST /api/users/{username}/follow` - Follow user
- `DELETE /api/users/{username}/follow` - Unfollow user
- `GET /api/users/{username}/followers` - Get followers
- `GET /api/users/{username}/following` - Get following
- `GET /api/users/follow-requests` - Get follow requests
- `POST /api/users/follow-requests/{id}/accept` - Accept follow request
- `POST /api/users/follow-requests/{id}/reject` - Reject follow request

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/{userId}` - Get conversation
- `GET /api/messages/conversations/{conversationId}` - Get group conversation messages
- `POST /api/messages/{messageId}/read` - Mark message as read
- `POST /api/messages/conversation/{userId}/read` - Mark conversation as read
- `GET /api/messages/unread-count` - Get unread message count
- `GET /api/messages/recent-conversations` - Get recent conversations

### Group Conversations
- `POST /api/conversations` - Create group conversation
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/{id}` - Get conversation details
- `POST /api/conversations/{id}/participants` - Add participant
- `DELETE /api/conversations/{id}/participants/{userId}` - Remove participant
- `POST /api/conversations/{id}/admins` - Make user admin
- `POST /api/conversations/{id}/leave` - Leave conversation

## WebSocket Endpoints

Connect to WebSocket at: `ws://localhost:8080/ws`

### Message Destinations
- `/app/chat.sendMessage` - Send message
- `/app/chat.addUser` - Add user to chat
- `/topic/public` - Public messages
- `/user/{username}/queue/messages` - Private messages
- `/user/{username}/queue/read-receipts` - Read receipts

## Testing

Run tests with:
```bash
mvn test
```

## Database Schema

The application creates the following main tables:
- `users` - User information
- `messages` - Message data
- `conversations` - Group conversation data
- `conversation_participants` - Conversation membership
- `conversation_admins` - Conversation administrators
- `user_follows` - Follow relationships
- `follow_requests` - Follow request data
- `refresh_tokens` - Refresh token storage

## Security

- Passwords are hashed using BCrypt
- JWT tokens for stateless authentication
- CORS configured for frontend integration
- Input validation on all endpoints
- SQL injection protection through JPA

## Monitoring

Health check endpoint: `http://localhost:8080/actuator/health`

## Example Usage

### Register a new user
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Send a message
```bash
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipientId": 2,
    "content": "Hello there!"
  }'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.