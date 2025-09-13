# LMS API Documentation

## Overview

The Learning Management System (LMS) API provides endpoints for user authentication, learning resource generation, and chat management. All endpoints require authentication except for registration and login.

## Base URL

```
http://localhost:8888/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "statusCode": number,
  "message": string,
  "data": any,
  "errors": string[] (optional)
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Learning Resources

#### Create Learning Resource
```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "React Hooks"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Learning resources generated successfully",
  "data": {
    "topic": "React Hooks",
    "summary": "React Hooks are functions that let you use state and other React features in functional components. They provide a more direct API to the React concepts you already know: props, state, context, refs, and lifecycle. Hooks are a powerful way to write reusable logic and share stateful logic between components.",
    "resources": {
      "documentation": [
        {
          "title": "React Hooks Documentation",
          "url": "https://reactjs.org/docs/hooks-intro.html",
          "description": "Official React Hooks documentation with examples and best practices",
          "source": "Official"
        },
        {
          "title": "React Hooks API Reference",
          "url": "https://reactjs.org/docs/hooks-reference.html",
          "description": "Complete API reference for all React Hooks",
          "source": "Official"
        }
      ],
      "youtube": [
        {
          "title": "React Hooks Tutorial",
          "url": "https://www.youtube.com/watch?v=TNhaISOUy6Q",
          "description": "Complete React Hooks tutorial for beginners",
          "channel": "freeCodeCamp",
          "duration": "15:30",
          "viewCount": "1.2M",
          "publishedAt": "2024-01-15T10:30:00.000Z",
          "thumbnail": "https://img.youtube.com/vi/TNhaISOUy6Q/maxresdefault.jpg"
        }
      ],
      "googleLinks": [
        {
          "title": "React Hooks Best Practices",
          "url": "https://www.google.com/search?q=react+hooks+best+practices",
          "description": "Search for React Hooks best practices and patterns",
          "searchQuery": "react hooks best practices"
        }
      ]
    },
    "learningPath": {
      "beginner": [
        "Learn useState hook for state management",
        "Practice with useEffect for side effects",
        "Build simple components using hooks"
      ],
      "intermediate": [
        "Master custom hooks creation",
        "Implement complex state logic with useReducer",
        "Optimize performance with useMemo and useCallback"
      ],
      "advanced": [
        "Create reusable hook libraries",
        "Implement advanced patterns like compound components",
        "Contribute to open source React projects"
      ]
    },
    "estimatedTime": "2-3 weeks for basics, 2-3 months for proficiency",
    "difficulty": "Beginner"
  }
}
```

#### Get Resources List
```http
GET /api/resources/list?page=1&limit=10&topic=react
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `topic` (optional): Filter by topic (case-insensitive)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Learning resources retrieved successfully",
  "data": {
    "resources": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "topic": "React Hooks",
        "summary": "React Hooks are functions that let you use state and other React features...",
        "difficulty": "Beginner",
        "estimatedTime": "2-3 weeks for basics, 2-3 months for proficiency",
        "learningPath": {
          "beginner": ["Learn useState hook", "Practice with useEffect"],
          "intermediate": ["Master custom hooks", "Implement complex state logic"],
          "advanced": ["Create reusable hook libraries", "Contribute to open source"]
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "resourceCounts": {
          "documentation": 5,
          "youtube": 3,
          "googleLinks": 4
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResources": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "topic": "react"
    }
  }
}
```

### Chat Management

#### Get Chat History
```http
GET /api/chats?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chat history retrieved successfully",
  "data": {
    "chats": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "topic": "React Hooks",
        "response": {
          "topic": "React Hooks",
          "summary": "React Hooks are functions that let you use state...",
          "resources": {
            "documentation": [...],
            "youtube": [...],
            "googleLinks": [...]
          },
          "learningPath": {...},
          "estimatedTime": "2-3 weeks for basics",
          "difficulty": "Beginner"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "fetchedResultCount": 10
}
```

#### Delete Chat
```http
DELETE /api/chats/:chatId
Authorization: Bearer <token>
```

**Path Parameters:**
- `chatId`: MongoDB ObjectId of the chat to delete

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Chat deleted successfully",
  "data": {
    "message": "Chat deleted successfully"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errors": [
    "Topic is required",
    "Topic must be less than 200 characters"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "User not authenticated"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Chat not found or you do not have permission to delete it"
}
```

### 409 Conflict
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Failed to generate learning resources",
  "errors": [
    "OpenAI API error: Rate limit exceeded"
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 8888 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers
- **Error**: Returns 429 status code when limit is exceeded

## Data Models

### User Model
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;
  password: string; // hashed
  createdAt: Date;
  updatedAt: Date;
}
```

### Chat Model
```typescript
interface IChat {
  _id: ObjectId;
  userId: ObjectId; // reference to User
  topic: string;
  response: {
    topic: string;
    summary: string;
    resources: {
      documentation: Array<{
        title: string;
        url: string;
        description: string;
        source: string;
      }>;
      youtube: Array<{
        title: string;
        url: string;
        description: string;
        channel: string;
        duration?: string;
        viewCount?: string;
        publishedAt?: string;
        thumbnail?: string;
      }>;
      googleLinks: Array<{
        title: string;
        url: string;
        description: string;
        searchQuery: string;
      }>;
    };
    learningPath?: {
      beginner: string[];
      intermediate: string[];
      advanced: string[];
    };
    estimatedTime?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  createdAt: Date;
}
```

## Testing

### Postman Collection

Import the provided Postman collection for easy API testing:
- File: `LMS_API_Postman_Collection.json`
- Includes all endpoints with example requests and responses
- Pre-configured with environment variables

### cURL Examples

#### Register User
```bash
curl -X POST http://localhost:8888/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

#### Login User
```bash
curl -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

#### Create Learning Resource
```bash
curl -X POST http://localhost:8888/api/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"topic":"JavaScript"}'
```

#### Get Resources List
```bash
curl -X GET "http://localhost:8888/api/resources/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Webhooks

Currently, the API does not support webhooks. This feature may be added in future versions.

## SDKs

No official SDKs are currently available. The API is designed to be consumed directly via HTTP requests.

## Support

For API support and questions:
- Check the troubleshooting section in the main README
- Review error responses for specific error details
- Ensure all required headers and authentication are included
