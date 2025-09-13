# LMS Development Guide

## Overview

This guide covers the development workflow, coding standards, and best practices for the Learning Management System (LMS) project.

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Git
- VS Code (recommended)
- OpenAI API key

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LMS
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment configuration**
   ```bash
   # Backend .env
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Project Architecture

### Backend Architecture

```
backend/src/
├── app.ts                 # Express app configuration
├── index.ts              # Server entry point
├── models/               # MongoDB models
│   ├── user.model.ts
│   └── chat.model.ts
├── routes/               # API routes
│   ├── auth/
│   └── learning-content/
├── services/             # Business logic
│   ├── auth/
│   ├── learning-content/
│   └── llms/
├── middlewares/          # Express middlewares
├── utils/                # Utility functions
└── enums/                # TypeScript enums
```

### Frontend Architecture

```
frontend/src/
├── components/           # React components
├── context/             # React context providers
├── services/            # API services
├── App.js               # Main App component
└── index.js             # Entry point
```

## Coding Standards

### TypeScript Standards

1. **Type Safety**
   ```typescript
   // ✅ Good
   interface UserResponse {
     id: string;
     name: string;
     email: string;
   }
   
   // ❌ Bad
   const user: any = await getUser();
   ```

2. **Interface Naming**
   ```typescript
   // ✅ Good - Use descriptive names
   interface CreateUserRequest {
     name: string;
     email: string;
     password: string;
   }
   
   // ❌ Bad - Generic names
   interface Request {
     data: any;
   }
   ```

3. **Error Handling**
   ```typescript
   // ✅ Good
   try {
     const result = await someAsyncOperation();
     return result;
   } catch (error) {
     if (error instanceof Error) {
       throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
     }
     throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Unknown error');
   }
   ```

### API Design Standards

1. **RESTful Endpoints**
   ```typescript
   // ✅ Good
   POST /api/resources        # Create resource
   GET /api/resources/list    # List resources
   GET /api/resources/:id     # Get specific resource
   DELETE /api/resources/:id  # Delete resource
   
   // ❌ Bad
   POST /api/createResource
   GET /api/getAllResources
   ```

2. **Response Format**
   ```typescript
   // ✅ Good - Consistent response structure
   {
     "success": true,
     "statusCode": 200,
     "message": "Operation successful",
     "data": { ... }
   }
   ```

3. **Error Responses**
   ```typescript
   // ✅ Good
   {
     "success": false,
     "statusCode": 400,
     "message": "Validation error",
     "errors": ["Field is required"]
   }
   ```

### Database Standards

1. **Model Definition**
   ```typescript
   // ✅ Good
   const userSchema = new Schema<IUser>({
     name: {
       type: String,
       required: [true, 'Name is required'],
       trim: true,
       maxlength: [100, 'Name cannot exceed 100 characters']
     },
     email: {
       type: String,
       required: [true, 'Email is required'],
       unique: true,
       lowercase: true,
       match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
     }
   }, {
     timestamps: true
   });
   ```

2. **Query Optimization**
   ```typescript
   // ✅ Good - Use select to limit fields
   const users = await User.find({})
     .select('name email createdAt')
     .sort({ createdAt: -1 })
     .limit(10);
   
   // ❌ Bad - Fetching all fields
   const users = await User.find({});
   ```

## Development Workflow

### Git Workflow

1. **Branch Naming**
   ```bash
   # Feature branches
   feature/user-authentication
   feature/learning-resources
   
   # Bug fixes
   bugfix/login-validation
   
   # Hotfixes
   hotfix/security-patch
   ```

2. **Commit Messages**
   ```bash
   # ✅ Good
   feat: add user authentication endpoint
   fix: resolve login validation issue
   docs: update API documentation
   refactor: simplify user service logic
   
   # ❌ Bad
   fixed stuff
   updated code
   changes
   ```

3. **Pull Request Process**
   - Create feature branch
   - Make changes with tests
   - Create pull request
   - Code review
   - Merge to main

### Testing Standards

1. **Unit Tests**
   ```typescript
   // ✅ Good
   describe('UserService', () => {
     describe('createUser', () => {
       it('should create user with valid data', async () => {
         const userData = {
           name: 'John Doe',
           email: 'john@example.com',
           password: 'password123'
         };
         
         const result = await UserService.createUser(userData);
         
         expect(result).toBeDefined();
         expect(result.email).toBe(userData.email);
       });
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   // ✅ Good
   describe('POST /api/auth/register', () => {
     it('should register new user', async () => {
       const userData = {
         name: 'John Doe',
         email: 'john@example.com',
         password: 'password123'
       };
       
       const response = await request(app)
         .post('/api/auth/register')
         .send(userData)
         .expect(201);
       
       expect(response.body.success).toBe(true);
       expect(response.body.data.email).toBe(userData.email);
     });
   });
   ```

## Service Layer Patterns

### Service Structure

```typescript
// ✅ Good - Service pattern
export class CreateResourceService {
  static async execute(user: IUser, params: CreateResourceParams): Promise<CreateResourceResponse> {
    try {
      // 1. Validate input
      const validatedParams = createResourceValidator.parse(params);
      
      // 2. Business logic
      const result = await this.performBusinessLogic(user, validatedParams);
      
      // 3. Return result
      return result;
    } catch (error) {
      // 4. Error handling
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to create resource');
    }
  }
  
  private static async performBusinessLogic(user: IUser, params: CreateResourceParams) {
    // Implementation details
  }
}
```

### Validation Patterns

```typescript
// ✅ Good - Zod validation
export const createResourceValidator = z.object({
  topic: z.string()
    .min(1, 'Topic is required')
    .max(200, 'Topic cannot exceed 200 characters')
    .trim()
});

export type CreateResourceParams = z.infer<typeof createResourceValidator>;
```

## Error Handling

### Custom Error Classes

```typescript
// ✅ Good - Custom error class
export class ApiError extends Error {
  public statusCode: number;
  public errors?: string[];
  
  constructor(statusCode: number, message: string, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }
}
```

### Error Middleware

```typescript
// ✅ Good - Global error handler
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error'
  });
};
```

## Performance Best Practices

### Database Optimization

1. **Indexing**
   ```typescript
   // ✅ Good - Create indexes for frequently queried fields
   userSchema.index({ email: 1 });
   chatSchema.index({ userId: 1, createdAt: -1 });
   ```

2. **Pagination**
   ```typescript
   // ✅ Good - Implement pagination
   const skip = (page - 1) * limit;
   const results = await Model.find(filter)
     .skip(skip)
     .limit(limit)
     .sort({ createdAt: -1 });
   ```

3. **Field Selection**
   ```typescript
   // ✅ Good - Select only needed fields
   const users = await User.find({})
     .select('name email createdAt')
     .lean(); // Use lean() for better performance
   ```

### API Optimization

1. **Response Compression**
   ```typescript
   // ✅ Good - Enable compression
   app.use(compression());
   ```

2. **Rate Limiting**
   ```typescript
   // ✅ Good - Implement rate limiting
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/api/', limiter);
   ```

## Security Best Practices

### Authentication

```typescript
// ✅ Good - JWT middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Access token required');
    }
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token');
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token'));
  }
};
```

### Input Validation

```typescript
// ✅ Good - Sanitize and validate input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## Code Organization

### File Naming Conventions

```
# ✅ Good
user.model.ts
create-user.service.ts
user.validator.ts
user.routes.ts

# ❌ Bad
UserModel.ts
CreateUserService.ts
userValidator.ts
userRoutes.ts
```

### Import Organization

```typescript
// ✅ Good - Organized imports
// 1. Node modules
import express from 'express';
import mongoose from 'mongoose';

// 2. Internal modules
import { IUser } from '../models/user.model';
import { ApiError } from '../utils/ApiError';

// 3. Types
import type { Request, Response, NextFunction } from 'express';
```

## Debugging

### Logging

```typescript
// ✅ Good - Structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User created successfully', { userId: user._id });
logger.error('Database connection failed', { error: error.message });
```

### Development Tools

1. **VS Code Extensions**
   - TypeScript Importer
   - ESLint
   - Prettier
   - REST Client
   - MongoDB for VS Code

2. **Debugging**
   ```typescript
   // ✅ Good - Use debugger statements
   const result = await someAsyncOperation();
   debugger; // Set breakpoint here
   return result;
   ```

## Documentation

### Code Documentation

```typescript
// ✅ Good - JSDoc comments
/**
 * Creates a new learning resource for the authenticated user
 * @param user - The authenticated user
 * @param params - The resource creation parameters
 * @returns Promise<CreateResourceResponse> - The created resource data
 * @throws {ApiError} When validation fails or OpenAI API error occurs
 */
export class CreateResourceService {
  static async execute(user: IUser, params: CreateResourceParams): Promise<CreateResourceResponse> {
    // Implementation
  }
}
```

### API Documentation

- Use Postman collections for API testing
- Document all endpoints with examples
- Include error response examples
- Update documentation with code changes

## Testing Strategy

### Test Structure

```
tests/
├── unit/                  # Unit tests
│   ├── services/
│   ├── models/
│   └── utils/
├── integration/           # Integration tests
│   ├── auth/
│   └── resources/
└── e2e/                   # End-to-end tests
    └── user-flows/
```

### Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security scan completed
- [ ] Performance testing done

### Post-deployment

- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Logs being collected
- [ ] Backup strategy in place
- [ ] Documentation updated

## Troubleshooting

### Common Development Issues

1. **TypeScript compilation errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   
   # Clear TypeScript cache
   rm -rf node_modules/.cache
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongodb
   
   # Check connection string
   echo $MONGODB_URI
   ```

3. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :8888
   
   # Kill process
   kill -9 <PID>
   ```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Happy Coding! 🚀**
