# 🚀 Quick Start Guide - Run This Project in 5 Minutes

> **For Reviewers/Evaluators**: Follow this guide to run the chat application on your system with zero configuration.

---

## ⚡ TL;DR - Fastest Method

```bash
# 1. Clone and navigate
git clone <repository-url>
cd task

# 2. Start everything with Docker
docker-compose up --build

# 3. Open browser
# Frontend: http://localhost
# Backend API: http://localhost:4000
```

**That's it! The app is running.** 🎉

---

## 📋 Prerequisites

### Required (Must Have)
- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- ✅ **Docker Compose** - Included with Docker Desktop
- ✅ **Web Browser** - Chrome, Firefox, Safari, or Edge

### Optional (For Development)
- Node.js 18+ (only if running without Docker)
- MongoDB (only if running without Docker)
- Redis (only if running without Docker)

---

## 🎯 Method 1: Docker (Recommended - Zero Configuration)

### Step 1: Verify Docker is Running

```bash
# Check Docker is installed and running
docker --version
docker-compose --version

# Expected output:
# Docker version 24.x.x
# Docker Compose version v2.x.x
```

If Docker is not running, start Docker Desktop application.

### Step 2: Clone the Repository

```bash
git clone <repository-url>
cd task
```

### Step 3: Start All Services

```bash
docker-compose up --build
```

**What this does:**
- ✅ Builds backend Docker image
- ✅ Builds frontend Docker image  
- ✅ Starts MongoDB container
- ✅ Starts Redis container
- ✅ Starts backend API on port 4000
- ✅ Starts frontend on port 80

**First-time build**: ~3-5 minutes  
**Subsequent starts**: ~30 seconds

### Step 4: Verify All Services are Running

```bash
# In a new terminal, check running containers
docker ps

# You should see 4 containers:
# - chat-backend
# - chat-frontend
# - chat-mongo
# - chat-redis
```

### Step 5: Access the Application

**Frontend**: http://localhost  
**Backend API**: http://localhost:4000/api  
**Health Check**: http://localhost:4000/api/health  

### Step 6: Create Test Users and Chat

1. **Register First User**
   - Go to http://localhost
   - Click "Sign Up"
   - Email: `user1@test.com`
   - Username: `Alice`
   - Password: `password123`

2. **Register Second User** (open in Incognito/Private window)
   - Go to http://localhost
   - Click "Sign Up"
   - Email: `user2@test.com`
   - Username: `Bob`
   - Password: `password123`

3. **Start Chatting**
   - In Alice's window: Click "New Chat" → Select "Bob"
   - In Bob's window: Click "New Chat" → Select "Alice"
   - Send messages and see them appear in real-time! 🚀

### Step 7: Stop the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## 🛠️ Method 2: Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- MongoDB running on localhost:27017
- Redis running on localhost:6379

### Step 1: Install MongoDB and Redis

**macOS (using Homebrew)**:
```bash
brew install mongodb-community
brew install redis

brew services start mongodb-community
brew services start redis
```

**Windows**:
- MongoDB: [Download installer](https://www.mongodb.com/try/download/community)
- Redis: [Download from GitHub](https://github.com/microsoftarchive/redis/releases)

**Linux (Ubuntu)**:
```bash
sudo apt-get update
sudo apt-get install -y mongodb redis-server

sudo systemctl start mongodb
sudo systemctl start redis
```

### Step 2: Set Up Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (or use defaults)
```

**Minimal `.env` file**:
```env
# Backend
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/chat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
CORS_ORIGIN=http://localhost:5173

# AWS S3 (optional - for file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### Step 3: Start Backend

```bash
cd backend
npm install
npm run dev

# Backend will start on http://localhost:4000
```

### Step 4: Start Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev

# Frontend will start on http://localhost:5173
```

### Step 5: Access Application

**Frontend**: http://localhost:5173  
**Backend API**: http://localhost:4000/api  

---

## 🧪 Testing the Application

### 1. Health Check

```bash
# Check backend is responding
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 2. Register User (API Test)

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# Expected: User created successfully
```

### 3. Test Real-Time Features

1. Open two browser windows side-by-side
2. Register different users in each
3. Start a conversation
4. Type in one window → See typing indicator in other
5. Send message → Appears instantly in both windows
6. Close one window → See "Offline" status in other window
7. Reopen → See "Online" status return

---

## ❌ Troubleshooting

### Problem: "Port already in use"

**Error**: `bind: address already in use`

**Solution**:
```bash
# Find what's using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5000
```

### Problem: "Cannot connect to MongoDB"

**Error**: `MongoServerError: connect ECONNREFUSED`

**Docker Solution**:
```bash
# Restart containers
docker-compose down
docker-compose up --build
```

**Local Solution**:
```bash
# Check MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongodb            # Linux
```

### Problem: "Cannot connect to Redis"

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Check Redis is running
redis-cli ping

# Expected: PONG

# If not running, start it
brew services start redis      # macOS
sudo systemctl start redis     # Linux
```

### Problem: "Frontend shows blank page"

**Solution**:
```bash
# Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)

# Rebuild frontend
docker-compose up --build frontend

# Or for local dev
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

### Problem: "CORS error in browser"

**Error**: `Access to XMLHttpRequest blocked by CORS`

**Solution**:
Check `CORS_ORIGIN` in `.env`:
```env
# For Docker
CORS_ORIGIN=http://localhost

# For local dev
CORS_ORIGIN=http://localhost:5173
```

Then restart backend:
```bash
docker-compose restart backend
```

### Problem: "Socket.IO connection failed"

**Error**: WebSocket connection failed in console

**Solution**:
1. Check backend is running: http://localhost:4000/api/health
2. Clear browser cache
3. Check CORS settings
4. Verify nginx proxy (for Docker setup)

### Problem: "npm install fails"

**Error**: `npm ERR! code EINTEGRITY`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete package-lock.json
rm package-lock.json

# Reinstall
npm install
```

---

## 🔍 Verification Checklist

After starting the application, verify these work:

### ✅ Backend
- [ ] Health check responds: http://localhost:4000/api/health
- [ ] Can register user via UI
- [ ] Can login via UI
- [ ] No errors in backend logs

### ✅ Frontend  
- [ ] Page loads: http://localhost
- [ ] Login/Register forms visible
- [ ] No console errors in browser

### ✅ Database
- [ ] MongoDB is running
- [ ] Redis is running
- [ ] Data persists after restart

### ✅ Real-Time Features
- [ ] Messages appear instantly
- [ ] Typing indicators work
- [ ] Online/offline status updates
- [ ] Read receipts show (checkmarks)

### ✅ Docker (if using)
- [ ] All 4 containers running: `docker ps`
- [ ] No container errors: `docker-compose logs`

---

## 📊 System Requirements

### Minimum
- **RAM**: 4 GB
- **Disk**: 2 GB free space
- **CPU**: 2 cores
- **OS**: macOS, Windows, or Linux

### Recommended
- **RAM**: 8 GB
- **Disk**: 5 GB free space
- **CPU**: 4 cores
- **OS**: Latest version

---

## 🎬 Demo Scenario (For Presentation)

### Scenario 1: Real-Time Messaging
1. Open two browser windows (or use incognito)
2. Register as "Alice" and "Bob"
3. Start conversation from Alice to Bob
4. Type message in Alice's window
5. **Show**: Bob sees typing indicator
6. Send message
7. **Show**: Message appears instantly in Bob's window with "Sent" checkmark
8. Bob views message
9. **Show**: Alice sees "Read" checkmark (double check)

### Scenario 2: Presence Tracking
1. With Alice and Bob connected
2. **Show**: Green dot next to "Online" status
3. Close Bob's window
4. **Show**: Alice sees Bob go "Offline"
5. Reopen Bob's window
6. **Show**: Alice sees Bob come back "Online"

### Scenario 3: Offline Message Delivery
1. Start with Alice online, Bob offline
2. Alice sends message to Bob
3. **Show**: Message shows "Sent" (not delivered)
4. Bob comes online
5. **Show**: Message automatically delivered
6. **Show**: Alice's message updates to "Delivered"

### Scenario 4: Message History
1. Send 10+ messages between users
2. Refresh browser
3. **Show**: All messages persist (loaded from MongoDB)
4. **Show**: Scroll to load more (pagination)

---

## 📞 Support & Documentation

### Documentation Files
- **README.md** - Main documentation and API reference
- **PROJECT_STRUCTURE.md** - Architecture and folder layout
- **PROJECT_CHECKLIST.md** - Feature compliance checklist
- **FINAL_ASSESSMENT.md** - Complete project assessment

### Quick Links
- API Documentation: See README.md → "API Documentation"
- Socket Events: See README.md → "Socket.IO Events"
- Architecture: See PROJECT_STRUCTURE.md
- Troubleshooting: This file (above)

### Need Help?

1. Check logs:
   ```bash
   # Docker
   docker-compose logs backend
   docker-compose logs frontend
   
   # Local
   Check terminal output
   ```

2. Verify services:
   ```bash
   docker ps                    # Docker
   curl http://localhost:4000/api/health  # Backend
   ```

3. Clean restart:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

---

## 🎯 Expected Behavior

### After Successful Setup

**Homepage (Not Logged In)**:
- Login and Register buttons visible
- Clean, modern UI with blue header

**After Registration**:
- Redirected to chat interface
- Empty conversation list (no chats yet)
- "New Chat" button visible

**After Starting Chat**:
- Conversation appears in left sidebar
- Chat window opens on right
- Can send messages
- Real-time updates work

**Performance**:
- Messages sent in < 100ms
- Page load in < 2 seconds
- No lag or freezing

---

## 🚀 Production Deployment Notes

For production deployment (not needed for testing):

### Option 1: Docker Compose (Quick)
```bash
docker-compose -f docker-compose.yml up -d
```

### Option 2: PM2 (Node.js)
```bash
./scripts/deploy.sh
```

### Option 3: Cloud Platforms
- **AWS**: ECS, EC2, or Elastic Beanstalk
- **Google Cloud**: Cloud Run or GKE
- **Azure**: App Service or AKS
- **Heroku**: Easy deployment with buildpacks
- **DigitalOcean**: App Platform or Droplets

---

## ✅ Success Criteria

You've successfully run the application when:

✅ Frontend loads at http://localhost  
✅ You can register and login  
✅ You can send messages between users  
✅ Messages appear in real-time  
✅ Typing indicators work  
✅ Online/offline status updates  
✅ Messages persist after refresh  
✅ No errors in console or logs  

---

## 🎉 You're All Set!

The application should now be running smoothly. Enjoy exploring the features:

- 💬 **Real-time messaging**
- 👥 **Presence tracking**  
- ⌨️ **Typing indicators**
- ✅ **Read receipts**
- 📱 **Responsive UI**
- 🔒 **Secure authentication**

**Happy testing!** 🚀

---

**Last Updated**: November 12, 2025  
**Version**: 1.0.0  
**Tested On**: macOS, Windows 11, Ubuntu 22.04
