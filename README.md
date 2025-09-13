# Learning Management System (LMS)

A comprehensive Learning Management System built with Node.js, TypeScript, and React, featuring AI-powered learning resource generation and YouTube integration.

## 🚀 Features

### Core Functionality
- **AI-Powered Learning Resources**: Generate comprehensive learning materials using OpenAI GPT
- **YouTube Integration**: Real YouTube video links with metadata using youtubei.js
- **User Authentication**: JWT-based authentication system
- **Chat History**: Track and manage learning conversations
- **Resource Management**: Create, list, and delete learning resources
- **Pagination & Filtering**: Efficient data retrieval with pagination and topic filtering

### Technical Features
- **TypeScript**: Full type safety across the entire stack
- **MongoDB**: Document-based database with Mongoose ODM
- **Express.js**: RESTful API with middleware support
- **React Frontend**: Modern UI with Tailwind CSS
- **Real-time Updates**: Live server reloading with nodemon
- **Error Handling**: Comprehensive error handling and validation

## 📁 Project Structure

```
LMS/
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── app.ts          # Express app configuration
│   │   ├── index.ts        # Server entry point
│   │   ├── models/         # MongoDB models
│   │   │   ├── user.model.ts
│   │   │   └── chat.model.ts
│   │   ├── routes/         # API routes
│   │   │   ├── auth/
│   │   │   └── learning-content/
│   │   ├── services/       # Business logic
│   │   │   ├── auth/
│   │   │   ├── learning-content/
│   │   │   └── llms/
│   │   ├── middlewares/    # Express middlewares
│   │   ├── utils/          # Utility functions
│   │   └── enums/          # TypeScript enums
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API services
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Zod** - Schema validation
- **OpenAI API** - AI-powered content generation
- **youtubei.js** - YouTube data extraction

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LMS
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/lms
   
   # JWT
   ACCESS_TOKEN_SECRET=your_jwt_secret_key
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   
   # Server
   PORT=8888
   ```

5. **Start the development servers**
   
   Backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

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

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Learning Resources Endpoints

#### Create Learning Resource
```http
POST /api/resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "React Hooks"
}
```

#### Get Resources List
```http
GET /api/resources/list?page=1&limit=10&topic=react
Authorization: Bearer <token>
```

### Chat Management Endpoints

#### Get Chat History
```http
GET /api/chats?page=1&limit=10
Authorization: Bearer <token>
```

#### Delete Chat
```http
DELETE /api/chats/:chatId
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `ACCESS_TOKEN_SECRET` | JWT secret key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `PORT` | Server port (default: 8888) | No |

## 🧪 Testing

### API Testing with Postman

Import the provided Postman collection:
```bash
# Import the collection file
LMS_API_Postman_Collection.json
```

## 🚀 Deployment

### Backend Deployment

1. **Build the project**
   ```bash
   cd backend
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   ACCESS_TOKEN_SECRET=your_production_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   PORT=8888
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Express rate limiting middleware
- **CORS**: Cross-origin resource sharing configuration
- **Error Handling**: Secure error messages without sensitive data exposure

## 🤖 AI Integration

### OpenAI Integration
- **Model**: GPT-3.5-turbo
- **Features**: 
  - Intelligent learning resource generation
  - Contextual summaries
  - Structured learning paths
  - Difficulty assessment

### YouTube Integration
- **Library**: youtubei.js
- **Features**:
  - Real YouTube video links
  - Video metadata (title, channel, duration, views)
  - No API key required
  - Fast video search

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: MongoDB connection failed
   ```
   **Solution**: Check your MongoDB URI and ensure MongoDB is running

2. **OpenAI API Error**
   ```
   Error: OpenAI API key not found
   ```
   **Solution**: Set the OPENAI_API_KEY environment variable

3. **JWT Token Error**
   ```
   Error: jwt malformed
   ```
   **Solution**: Ensure you're sending the token in the correct format: `Bearer <token>`

## 📝 API Response Format

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

## 📈 Future Enhancements

- [ ] Real-time chat functionality
- [ ] Progress tracking
- [ ] Learning analytics
- [ ] Mobile app support
- [ ] Advanced AI features
- [ ] Multi-language support
- [ ] Social learning features
- [ ] Gamification elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Node.js, TypeScript, React, and AI**