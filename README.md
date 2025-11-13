# Real-Time Chat Application

A full-stack, production-ready real-time chat application built with TypeScript, React, Node.js, Socket.IO, MongoDB, and Redis. This MVP demonstrates enterprise-level architecture with real-time messaging, authentication, presence tracking, background job processing, and horizontal scalability.

> **Project Status**: ✅ Production-ready | 100% complete
> 
> **Latest Features**: Group chat functionality and unread message badges added!

---

## � **Quick Start - Run in 5 Minutes**

```bash
# 1. Clone the repository
git clone <repository-url>
cd task

# 2. Start with Docker (zero configuration)
docker-compose up --build

# 3. Open browser → http://localhost
```

**📖 For detailed setup instructions, troubleshooting, and demos**: See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## �📑 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - ⭐ **Start here!** Complete setup & troubleshooting
- **[README.md](./README.md)** - Main documentation (this file)
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Detailed folder structure & architecture
- **[PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md)** - Feature completion checklist
- **[FINAL_ASSESSMENT.md](./FINAL_ASSESSMENT.md)** - Comprehensive project assessment

## 🎯 Tech Stack

### Frontend
- **React.js** (18.2.0) - UI library
- **React Router** (6.21.1) - Client-side routing
- **Zustand** (4.4.7) - Lightweight state management
- **Socket.IO Client** (4.6.0) - Real-time WebSocket client
- **Tailwind CSS** (3.4.1) - Utility-first styling
- **TypeScript** (5.3.3) - Type safety
- **Vite** (5.0.11) - Build tool and dev server
- **Axios** (1.6.5) - HTTP client

### Backend
- **Node.js** (18-alpine) - Runtime environment
- **Express.js** (4.18.2) - Web framework
- **Socket.IO** (4.6.0) - Real-time bidirectional communication
- **Mongoose** (8.0.3) - MongoDB ODM
- **Redis** (ioredis 5.3.2) - Pub/Sub, session store, presence tracking
- **BullMQ** (5.63.0) - Background job processing
- **TypeScript** (5.3.3) - Type safety

### Database & Cache
- **MongoDB** (7.0) - Primary database with indexes
- **Redis** (7-alpine) - In-memory cache and pub/sub

### Authentication & Security
- **JWT** (jsonwebtoken 9.0.2) - Access + refresh tokens
- **bcrypt** (5.1.1) - Password hashing
- **Helmet** (7.1.0) - Security headers
- **Rate Limiting** (express-rate-limit 7.1.5)

### DevOps & Tools
- **Docker** & **Docker Compose** - Containerization
- **PM2** (6.0.13) - Process manager for Node.js
- **GitHub Actions** - CI/CD pipeline
- **Winston** (3.11.0) - Logging
- **Jest** (29.7.0) - Testing framework

## 🚀 Features

### Core Functionality
- ✅ **One-to-One Chat**: Direct messaging between users with persistent message storage
- ✅ **Group Chat**: Create and manage group conversations with multiple participants
- ✅ **Group Management**: Add/remove members, update group name and avatar, admin controls
- ✅ **Unread Message Badges**: Real-time unread count indicators for all conversations
- ✅ **JWT Authentication**: Access & refresh token flow with secure httpOnly cookies
- ✅ **Real-Time Communication**: Socket.IO for instant message delivery
- ✅ **Presence Management**: Online/offline status tracking across instances
- ✅ **Typing Indicators**: Real-time typing status
- ✅ **Message Receipts**: Delivery and read receipts
- ✅ **Offline Messages**: Automatic delivery of undelivered messages on reconnect
- ✅ **Paginated History**: Cursor-based pagination for efficient message loading
- ✅ **File Uploads**: Signed S3 URLs for direct client-to-S3 uploads
- ✅ **Background Jobs**: BullMQ for email and push notification queues

### Technical Highlights
- ✅ **TypeScript**: Full type safety across backend and frontend
- ✅ **MongoDB Indexes**: Optimized queries with compound and text indexes
- ✅ **Redis Adapter**: Multi-instance Socket.IO scaling support
- ✅ **BullMQ Queues**: Background job processing for emails and notifications
- ✅ **PM2 Ready**: Process management with cluster mode support
- ✅ **MVC Architecture**: Clean separation of concerns
- ✅ **Security**: Helmet, rate limiting, input validation
- ✅ **Testing**: Unit and integration tests with Jest
- ✅ **Docker**: Complete development environment
- ✅ **CI/CD**: GitHub Actions for automated testing and builds

## 📁 Project Structure

```
.
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Configuration and logger
│   │   ├── models/            # Mongoose models (User, Message, Conversation)
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middlewares/       # Auth, validation, error handling
│   │   ├── sockets/           # Socket.IO handlers
│   │   │   └── handlers/      # Message & presence handlers
│   │   ├── queues/            # BullMQ job queues (email, notifications)
│   │   ├── utils/             # JWT, DB, S3 utilities
│   │   ├── tests/             # Jest tests
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── ecosystem.config.js    # PM2 configuration
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── api/               # API client & endpoints
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── stores/            # Zustand state management
│   │   ├── sockets/           # Socket.IO client
│   │   ├── styles/            # Tailwind CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml          # Development environment
├── .env.example                # Environment variables template
├── .github/workflows/ci.yml    # GitHub Actions CI/CD
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Cache/PubSub**: Redis & Socket.IO Redis Adapter
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken, bcrypt)
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, CORS
- **File Storage**: AWS S3 (SDK v3)
- **Testing**: Jest, Supertest, MongoDB Memory Server
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Styling**: Tailwind CSS
- **Date Utilities**: date-fns

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- AWS S3 bucket (optional, for file uploads)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd task

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Run with Docker (Recommended)

```bash
# Start all services (MongoDB, Redis, Backend, Frontend)
docker-compose up --build

# Backend API: http://localhost:4000
# Frontend: http://localhost:80
```

### 3. Run Locally (Development)

**Backend:**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

Make sure MongoDB and Redis are running locally or update `.env` with remote connection strings.

### 4. Run with PM2 (Production)

PM2 is a production-grade process manager for Node.js with built-in load balancing.

```bash
# Build the backend
cd backend
npm run build

# Start with PM2 (cluster mode)
npm run pm2:start

# PM2 management commands
npm run pm2:logs        # View logs
npm run pm2:monit       # Monitor processes
npm run pm2:restart     # Restart application
npm run pm2:stop        # Stop application
npm run pm2:delete      # Remove from PM2

# View PM2 dashboard
pm2 list
pm2 describe chat-backend
```

**PM2 Features:**
- ✅ Cluster mode - Uses all CPU cores
- ✅ Auto-restart on crash
- ✅ Log management
- ✅ Memory monitoring
- ✅ Load balancing
- ✅ Zero-downtime reload

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage
```

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users (for contact list)
- `PATCH /api/users/me` - Update profile

### Conversations
- `GET /api/conversations` - Get all conversations for current user
- `GET /api/conversations/direct/:userId` - Get or create one-to-one conversation
- `POST /api/conversations/groups` - Create a new group conversation
- `POST /api/conversations/groups/:id/members` - Add members to a group
- `DELETE /api/conversations/groups/:id/members/:userId` - Remove a member from a group
- `PATCH /api/conversations/groups/:id` - Update group information (name, avatar)
- `GET /api/conversations/unread-counts` - Get unread message counts for all conversations

### Messages
- `GET /api/messages/:conversationId?limit=50&cursor=<timestamp>` - Get messages with pagination

### Uploads
- `POST /api/uploads/signed-url` - Get signed S3 upload URL

### Socket.IO Events

**Client → Server:**
- `message:send` - Send a message
- `message:delivered` - Confirm message delivery
- `message:read` - Mark message as read
- `typing` - User is typing
- `typing:stop` - User stopped typing

**Server → Client:**
- `message:received` - New message received
- `message:sent` - Message successfully sent (ack)
- `message:delivery-status` - Message delivered to recipient
- `message:read-status` - Message read by recipient
- `user:typing` - Another user is typing
- `user:typing:stop` - Another user stopped typing
- `presence:update` - User online/offline status changed
- `messages:undelivered` - Undelivered messages on reconnect

## 🔄 Background Jobs (BullMQ)

The application uses BullMQ for processing background jobs asynchronously:

### Available Queues

1. **Email Queue** (`email.queue.ts`)
   - Welcome emails
   - Password reset emails
   - Notification emails
   - Configurable retry with exponential backoff
   - 3 attempts per job

2. **Notification Queue** (`notification.queue.ts`)
   - Push notifications for new messages
   - System notifications
   - Friend request notifications
   - High concurrency (10 workers)

### Queue Features
- ✅ **Redis-backed** - Persistent job storage
- ✅ **Automatic retries** - Exponential backoff on failures
- ✅ **Job cleanup** - Auto-remove completed/failed jobs
- ✅ **Concurrency control** - Parallel job processing
- ✅ **Event handlers** - Completion and failure callbacks
- ✅ **Logging** - Winston integration for job tracking

### Usage Example

```typescript
// Send a notification (queued in background)
import { sendNotification } from './queues';

await sendNotification({
  userId: '123',
  title: 'New Message',
  message: 'You have a new message from Alice',
  type: 'message'
});
```

**Note:** The actual email/push notification sending is stubbed. Integrate with SendGrid, AWS SES, Firebase, or OneSignal as needed.

## 🎯 How to Demo

1. **Start the application** using Docker or locally
2. **Open multiple browser windows/tabs** (at least 3 for testing group chat)
3. **Register different users:**
   - Window 1: Register as `alice@example.com`
   - Window 2: Register as `bob@example.com`
   - Window 3: Register as `charlie@example.com`

### Test One-to-One Chat
4. **In Window 1 (Alice):**
   - Click "New Chat"
   - Select Bob from the user list
   - Send a message
5. **In Window 2 (Bob):**
   - See Alice's message appear in real-time with unread badge
   - Reply to Alice
6. **Observe:**
   - Real-time message delivery
   - Online/offline indicators (green dot)
   - Typing indicators (type without sending)
   - Message delivery & read receipts (checkmarks)
   - Unread count badges on conversations

### Test Group Chat
7. **In Window 1 (Alice):**
   - Click "New Group" button
   - Enter group name (e.g., "Team Chat")
   - Select Bob and Charlie as members
   - Click "Create Group"
8. **In Windows 2 & 3 (Bob & Charlie):**
   - See the new group appear in the chat list
9. **Send messages in the group:**
   - Alice sends: "Hello team!"
   - Bob and Charlie see the message instantly
   - All members can reply
10. **Test group management:**
    - Click "Group Info" button in the chat header
    - View all members with online status
    - Admin can update group name
    - Admin can remove members
    - See admin badge on group creator

### Test Offline Behavior
11. **Test offline messages:**
    - Close Window 2 (Bob goes offline)
    - Send messages from Window 1 (Alice)
    - Reopen Window 2 (Bob) - messages delivered on reconnect with unread badges

## 🔐 Security Features

- **JWT Authentication** with short-lived access tokens (15min) and long-lived refresh tokens (7 days)
- **Refresh tokens** stored in httpOnly cookies to prevent XSS
- **Password hashing** with bcrypt (salt rounds: 10)
- **Rate limiting** on auth endpoints (5 requests per 15 minutes)
- **Input validation** with Joi schemas
- **Helmet** for security headers
- **CORS** configuration
- **Socket.IO authentication** at handshake

## 📈 Scaling Considerations

### Current Implementation
- **Redis Adapter**: Enables Socket.IO to work across multiple backend instances
- **Database Indexes**: Compound index on `(conversationId, createdAt)` for fast message queries
- **Cursor-based Pagination**: Efficient for large message histories
- **Lean Queries**: MongoDB `.lean()` for better performance

### Production Recommendations
1. **Load Balancer**: Use sticky sessions OR rely on Redis adapter
2. **Database**: 
   - MongoDB replica set for high availability
   - Read replicas for scaling reads
3. **Redis**:
   - Redis Cluster for high availability
   - Separate Redis instances for cache vs pub/sub
4. **File Uploads**:
   - Use BullMQ for background media processing
   - CDN in front of S3 for faster delivery
5. **Monitoring**:
   - Add APM (e.g., New Relic, DataDog)
   - Socket.IO admin UI for monitoring connections
6. **Caching**:
   - Redis cache for frequently accessed conversations
   - Cache user presence data

## 🗂️ Database Schema

### User
```typescript
{
  email: string (unique, indexed)
  password: string (hashed)
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
  refreshTokens: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Conversation
```typescript
{
  participants: ObjectId[] (2+ users, 2 for direct chat, 3+ for groups)
  isGroup: boolean
  groupName?: string (required for groups)
  groupAvatar?: string
  groupAdmin?: ObjectId (user who created the group)
  lastMessage?: {
    _id?: string
    content: string
    createdAt: string
  }
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}
// Index: { participants: 1 }
// Validation: 
// - Direct chat: exactly 2 participants, isGroup=false
// - Group chat: 3+ participants, isGroup=true, groupName required
```

### Message
```typescript
{
  conversationId: ObjectId (indexed)
  sender: ObjectId (indexed)
  recipient: ObjectId (indexed)
  content: string (text index for search)
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'audio' | 'file'
  delivered: boolean
  read: boolean
  deliveredAt?: Date
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}
// Indexes:
// - Compound: { conversationId: 1, createdAt: -1 }
// - Undelivered: { recipient: 1, delivered: false }
// - Text: { content: 'text' }
```

## 🚧 Known Limitations & Future Enhancements

### Recently Added ✨
- ✅ **Group chat** - Create groups with multiple participants
- ✅ **Group management** - Add/remove members, update group info
- ✅ **Unread message badges** - Real-time unread counts for all conversations

### Intentionally Deferred (for MVP)
- ❌ Message editing/deletion
- ❌ Full-text search on messages
- ❌ Voice/video calls
- ❌ Push notifications (could add with FCM/APNS)
- ❌ Message reactions/emojis
- ❌ User blocking
- ❌ Advanced media processing (thumbnails, compression)
- ❌ Group chat permissions (mute, admin roles)

### Next Steps
1. Implement message editing and deletion
2. Add message search with Elasticsearch or MongoDB Atlas Search
3. Implement BullMQ for async media processing
4. Add E2E tests with Playwright/Cypress
5. Set up proper production secrets management (Vault, AWS Secrets Manager)
6. Add rate limiting per user (not just per IP)
7. Implement user profile pictures
8. Add message export functionality
9. Add group chat advanced features (permissions, mentions, polls)

## 📝 Environment Variables

See `.env.example` for all configuration options. Key variables:

```bash
# Required
MONGO_URI=mongodb://mongo:27017/chat
REDIS_URL=redis://redis:6379
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Optional (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket
```

## 🤝 Contributing

This is an interview project/MVP. For production use, please:
1. Change all secrets in `.env`
2. Set up proper SSL/TLS certificates
3. Configure production-grade MongoDB and Redis
4. Review and adjust rate limits
5. Add comprehensive logging and monitoring
6. Implement proper error tracking (Sentry, etc.)

## 📄 License

MIT

---

**Built with production-ready practices** - Demonstrates:
- Full-stack TypeScript development
- Real-time system architecture with Socket.IO
- Group chat implementation with proper validation
- Unread message tracking and real-time updates
- Production-ready code structure
- Testing practices
- Scalability considerations
- DevOps (Docker, CI/CD)
- Clean architecture and separation of concerns
