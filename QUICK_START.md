# LMS Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you get the Learning Management System up and running quickly.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- OpenAI API key

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd LMS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create `.env` file in `backend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lms

# JWT Secret (use a strong secret in production)
ACCESS_TOKEN_SECRET=your_super_secret_jwt_key_here

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Server Port
PORT=8888
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 4. Test the API

Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8888/api

## 🧪 Quick API Test

### Register a User
```bash
curl -X POST http://localhost:8888/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Learning Resource (replace TOKEN with JWT from login)
```bash
curl -X POST http://localhost:8888/api/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"topic":"JavaScript"}'
```

## 📁 Project Structure

```
LMS/
├── backend/          # Node.js/TypeScript API
│   ├── src/
│   │   ├── models/   # Database models
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utilities
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── package.json
└── README.md
```

## 🔑 Key Features

- **AI-Powered Learning**: Generate learning resources using OpenAI
- **YouTube Integration**: Real YouTube video links with metadata
- **User Authentication**: JWT-based auth system
- **Chat History**: Track learning conversations
- **Resource Management**: Create, list, and delete resources

## 🛠️ Available Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm start        # Start production server
npm test         # Run tests
```

### Frontend
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## 🐛 Common Issues

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
sudo systemctl start mongodb
# or
brew services start mongodb-community
```

### Port Already in Use
```bash
# Find and kill process using port 8888
lsof -i :8888
kill -9 <PID>
```

### OpenAI API Error
- Check your API key is correct
- Ensure you have credits in your OpenAI account
- Verify the key has the right permissions

## 📚 Next Steps

1. **Read the full documentation**: Check `README.md` for detailed information
2. **Explore the API**: Use the Postman collection in `LMS_API_Postman_Collection.json`
3. **Check the development guide**: See `DEVELOPMENT_GUIDE.md` for coding standards
4. **Deploy to production**: Follow `DEPLOYMENT_GUIDE.md`

## 🆘 Need Help?

- Check the troubleshooting section in the main README
- Review error messages in the console
- Ensure all environment variables are set correctly
- Verify MongoDB is running and accessible

## 🎯 What's Next?

Once you have the system running:

1. **Test the AI features**: Create learning resources for different topics
2. **Explore the YouTube integration**: See how real video data is fetched
3. **Try the chat history**: Create multiple resources and view the list
4. **Customize the system**: Modify the AI prompts or add new features

---

**You're all set! Happy learning! 🎉**
