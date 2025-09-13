# LMS Deployment Guide

## Overview

This guide covers deploying the Learning Management System (LMS) to production environments. The system consists of a Node.js/TypeScript backend and a React frontend.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key
- Domain name (for production)
- SSL certificate (for HTTPS)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
# Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority

# JWT
ACCESS_TOKEN_SECRET=your_super_secure_jwt_secret_key_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here

# Server
PORT=8888
HOST=0.0.0.0

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## Backend Deployment

### Option 1: Traditional VPS/Server

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install nginx -y
```

#### 2. Deploy Application

```bash
# Clone repository
git clone <your-repo-url> /var/www/lms
cd /var/www/lms/backend

# Install dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name "lms-backend"
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/lms`:

```nginx
server {
    listen 80;
    server_name your-backend-domain.com;

    location / {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-backend-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8888

# Start application
CMD ["node", "dist/index.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8888:8888"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/lms
      - ACCESS_TOKEN_SECRET=your_jwt_secret
      - OPENAI_API_KEY=your_openai_key
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://localhost:8888/api
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### Heroku

1. **Install Heroku CLI**
2. **Create Heroku app**
   ```bash
   heroku create your-lms-app
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set ACCESS_TOKEN_SECRET=your_jwt_secret
   heroku config:set OPENAI_API_KEY=your_openai_key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### Railway

1. **Connect GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

#### DigitalOcean App Platform

1. **Create new app from GitHub**
2. **Configure build settings**
3. **Set environment variables**
4. **Deploy**

## Frontend Deployment

### Option 1: Static Hosting

#### 1. Build React App

```bash
cd frontend
npm run build
```

#### 2. Deploy to Netlify

1. **Connect GitHub repository**
2. **Set build command**: `npm run build`
3. **Set publish directory**: `build`
4. **Set environment variables**:
   - `REACT_APP_API_URL`: Your backend API URL

#### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### Option 2: Nginx Static Files

```bash
# Build React app
cd frontend
npm run build

# Copy to server
sudo cp -r build/* /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/lms-frontend
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas account**
2. **Create cluster**
3. **Create database user**
4. **Whitelist IP addresses**
5. **Get connection string**

### Self-hosted MongoDB

```bash
# Install MongoDB
sudo apt install mongodb -y

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use lms
db.createUser({
  user: "lms_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart lms-backend
```

### Log Management

```bash
# Install logrotate
sudo apt install logrotate -y

# Configure log rotation
sudo nano /etc/logrotate.d/lms
```

Log rotation configuration:
```
/var/log/lms/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable authentication
- Whitelist IP addresses
- Use SSL connections

### 3. API Security
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs
- Sanitize outputs

### 4. Server Security
- Keep system updated
- Use firewall
- Disable unnecessary services
- Regular security audits

## Performance Optimization

### 1. Database Optimization
- Create appropriate indexes
- Use connection pooling
- Monitor query performance

### 2. Application Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching
- Optimize images

### 3. Monitoring
- Set up application monitoring
- Monitor server resources
- Track API performance
- Set up alerts

## Backup Strategy

### Database Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://username:password@localhost:27017/lms" --out="/backups/mongodb_$DATE"
```

### Application Backup

```bash
# Backup application files
tar -czf /backups/lms_app_$(date +%Y%m%d).tar.gz /var/www/lms
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connection
   - Check logs for errors

2. **Database connection issues**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify credentials

3. **API errors**
   - Check OpenAI API key
   - Verify rate limits
   - Check input validation

### Log Locations

- **Application logs**: `/var/log/lms/`
- **Nginx logs**: `/var/log/nginx/`
- **PM2 logs**: `~/.pm2/logs/`

## Maintenance

### Regular Tasks

1. **Update dependencies**
   ```bash
   npm audit
   npm update
   ```

2. **Monitor disk space**
   ```bash
   df -h
   du -sh /var/www/lms
   ```

3. **Check system resources**
   ```bash
   htop
   free -h
   ```

4. **Backup verification**
   - Test backup restoration
   - Verify backup integrity
   - Update backup strategy

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use Nginx or HAProxy
   - Distribute traffic across instances
   - Health checks

2. **Database Scaling**
   - Read replicas
   - Sharding
   - Connection pooling

3. **Caching**
   - Redis for session storage
   - CDN for static assets
   - Application-level caching

### Vertical Scaling

1. **Increase server resources**
   - More CPU cores
   - More RAM
   - Faster storage

2. **Optimize application**
   - Code optimization
   - Database query optimization
   - Memory usage optimization

## Support

For deployment issues:
- Check logs for error messages
- Verify environment variables
- Test database connectivity
- Review security configurations

---

**Remember**: Always test deployments in a staging environment before deploying to production!
