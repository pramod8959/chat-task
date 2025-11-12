# Project Structure

## 📁 Directory Layout (Optimized)

```
task/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       └── ci.yml             # GitHub Actions pipeline
│
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Configuration & logger
│   │   │   ├── index.ts       # Environment config
│   │   │   └── logger.ts      # Winston logger
│   │   │
│   │   ├── controllers/       # Route handlers (thin layer)
│   │   │   ├── auth.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── user.controller.ts
│   │   │
│   │   ├── middlewares/       # Express middlewares
│   │   │   ├── auth.middleware.ts     # JWT authentication
│   │   │   ├── error.middleware.ts    # Global error handler
│   │   │   └── validate.middleware.ts # Joi validation
│   │   │
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.ts        # User model with auth
│   │   │   ├── Message.ts     # Message with receipts
│   │   │   └── Conversation.ts # Conversation metadata
│   │   │
│   │   ├── queues/            # BullMQ background jobs
│   │   │   ├── email.queue.ts       # Email sending
│   │   │   ├── notification.queue.ts # Push notifications
│   │   │   └── index.ts
│   │   │
│   │   ├── routes/            # API route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   ├── upload.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── index.ts       # Route aggregator
│   │   │
│   │   ├── services/          # Business logic (core)
│   │   │   ├── auth.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── socket.service.ts  # Redis presence
│   │   │   └── upload.service.ts
│   │   │
│   │   ├── sockets/           # Socket.IO handlers
│   │   │   ├── handlers/
│   │   │   │   ├── message.handler.ts  # Message events
│   │   │   │   └── presence.handler.ts # Presence events
│   │   │   └── index.ts       # Socket.IO initialization
│   │   │
│   │   ├── tests/             # Jest tests
│   │   │   ├── auth.test.ts
│   │   │   └── message.test.ts
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   ├── db.ts          # MongoDB connection
│   │   │   ├── jwt.ts         # JWT utilities
│   │   │   ├── redis.ts       # Redis client
│   │   │   └── s3.ts          # AWS S3 client
│   │   │
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   │
│   ├── logs/                  # Application logs (git-ignored)
│   ├── .dockerignore
│   ├── .eslintrc.js
│   ├── Dockerfile             # Multi-stage build
│   ├── ecosystem.config.js    # PM2 configuration
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/               # API client layer
│   │   │   ├── auth.ts
│   │   │   ├── messages.ts
│   │   │   └── client.ts      # Axios instance
│   │   │
│   │   ├── components/        # React components
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── UploadPreview.tsx
│   │   │
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Chat.tsx
│   │   │
│   │   ├── sockets/           # Socket.IO client
│   │   │   └── socket.ts
│   │   │
│   │   ├── stores/            # Zustand state management
│   │   │   ├── useAuth.ts     # Auth state
│   │   │   └── useChat.ts     # Chat state
│   │   │
│   │   ├── utils/             # Utility functions
│   │   │   └── string.ts      # String helpers
│   │   │
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   │
│   ├── .dockerignore
│   ├── .env.production        # Production env vars
│   ├── .eslintrc.cjs
│   ├── Dockerfile             # Multi-stage build
│   ├── nginx.conf             # Nginx configuration
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Example env file
├── .gitignore
├── docker-compose.yml         # Multi-service orchestration
├── FINAL_ASSESSMENT.md        # Project assessment
├── PROJECT_CHECKLIST.md       # Feature checklist
└── README.md                  # Main documentation
```

## 🏗️ Architecture Patterns

### Backend (MVC + Services)

```
Request Flow:
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌─────────┐
│ Client  │────▶│ Controller │────▶│  Service    │────▶│  Model  │
└─────────┘     └────────────┘     └─────────────┘     └─────────┘
                      │                   │
                      ▼                   ▼
                ┌──────────┐        ┌──────────┐
                │Middleware│        │ Queues   │
                └──────────┘        └──────────┘
```

**Responsibilities**:
- **Controllers**: HTTP request/response handling (thin)
- **Services**: Business logic (core functionality)
- **Models**: Data schema and validation
- **Middlewares**: Cross-cutting concerns (auth, validation, errors)
- **Queues**: Async background jobs

### Frontend (Component-based)

```
Component Hierarchy:
┌─────────────────────────────────────┐
│           App (Router)              │
├─────────────────────────────────────┤
│  Login │ Register │    Chat        │
│                    ├────────────────┤
│                    │ ChatList       │
│                    │ ChatWindow     │
│                    │  └─MessageItem │
│                    │  └─MessageInput│
└─────────────────────────────────────┘
         │              │
         ▼              ▼
    ┌─────────┐    ┌─────────┐
    │Auth Store│    │Chat Store│
    └─────────┘    └─────────┘
```

**State Management**:
- **Zustand Stores**: Centralized state
- **Socket.IO**: Real-time updates
- **API Layer**: HTTP requests

## 📦 Key Files Explained

### Backend

| File | Purpose | Key Features |
|------|---------|--------------|
| `server.ts` | Application entry | HTTP server, Socket.IO init, graceful shutdown |
| `app.ts` | Express setup | Middleware, routes, error handling |
| `config/index.ts` | Configuration | Environment variables, validation |
| `sockets/index.ts` | Socket.IO setup | Redis adapter, authentication |
| `queues/*.ts` | Background jobs | Email, notifications with retry logic |
| `ecosystem.config.js` | PM2 config | Cluster mode, auto-restart, logging |

### Frontend

| File | Purpose | Key Features |
|------|---------|--------------|
| `main.tsx` | React entry | Router setup, global providers |
| `sockets/socket.ts` | Socket.IO client | Connection, event handlers |
| `stores/*.ts` | State management | Auth, chat, presence, typing |
| `nginx.conf` | Production server | Proxy API & Socket.IO, SPA routing |
| `.env.production` | Build config | API & Socket URLs |

### DevOps

| File | Purpose | Key Features |
|------|---------|--------------|
| `docker-compose.yml` | Container orchestration | 4 services (mongo, redis, backend, frontend) |
| `.github/workflows/ci.yml` | CI/CD pipeline | Automated testing, build verification |
| `Dockerfile` (backend) | Container image | Multi-stage build, npm pruning |
| `Dockerfile` (frontend) | Container image | Build + nginx serve |

## 🗑️ Excluded from Version Control

### Git-ignored (`.gitignore`)
- `node_modules/` - Dependencies (managed by npm)
- `dist/`, `build/` - Build artifacts
- `.env` - Environment secrets
- `logs/` - Application logs
- `coverage/` - Test coverage reports
- `.DS_Store`, `Thumbs.db` - OS files
- IDE files (`.vscode/`, `.idea/`)

### Docker-ignored (`.dockerignore`)
- `node_modules/` - Reinstalled in container
- Test files - Not needed in production
- Documentation - Reduces image size
- IDE/OS files - Keep images clean
- Source maps, dev configs

## 🔄 Data Flow

### Authentication Flow
```
1. User registers → Backend validates → Stores in MongoDB
2. User logs in → Backend verifies → Issues JWT tokens
3. Tokens stored: Access in localStorage, Refresh in httpOnly cookie
4. Protected requests include Bearer token
5. Token expires → Refresh flow → New access token
```

### Message Flow (Real-time)
```
1. User types → Frontend captures
2. Emit 'message:send' → Socket.IO → Backend
3. Backend saves to MongoDB
4. Backend emits 'message:received' → Recipient's socket
5. Backend queues notification → BullMQ worker
6. Recipient updates UI in real-time
```

### Presence Flow
```
1. User connects → Socket.IO authentication
2. Backend updates User.isOnline = true
3. Backend stores in Redis (userId → socketId)
4. Broadcast 'presence:update' to other users
5. On disconnect → Update MongoDB & Redis
6. Broadcast offline status
```

## 🎯 Scalability Features

### Horizontal Scaling
- **Redis Adapter**: Socket.IO multi-instance support
- **PM2 Cluster**: Multi-core utilization on single server
- **Stateless Auth**: JWT (no session storage)
- **Message Queues**: Async processing with BullMQ
- **Docker Ready**: Container orchestration (K8s ready)

### Performance Optimizations
- **Database Indexes**: Compound indexes on queries
- **Cursor Pagination**: Efficient large dataset handling
- **Connection Pooling**: MongoDB & Redis
- **Lazy Loading**: Frontend code splitting
- **CDN Ready**: Static assets servable from CDN

### Reliability
- **PM2 Auto-restart**: Process crashes handled
- **Graceful Shutdown**: Proper cleanup
- **Error Handling**: Global error middleware
- **Circuit Breakers**: Service failure handling
- **Health Checks**: `/api/health` endpoint

## 📊 Project Statistics

- **Total Files**: ~50 TypeScript/React files
- **Lines of Code**: ~5,000 LOC
- **API Endpoints**: 12 REST routes
- **Socket Events**: 15+ events
- **Models**: 3 Mongoose schemas
- **Components**: 10+ React components
- **Test Suites**: 15+ tests

## 🚀 Quick Commands

```bash
# Development
docker-compose up --build

# Production with PM2
cd backend && npm run build && npm run pm2:start

# Testing
cd backend && npm test

# Monitoring
pm2 monit
docker logs -f chat-backend

# Cleanup
docker-compose down -v
pm2 delete all
```

---

**Note**: This structure is optimized for scalability, maintainability, and deployment. Each layer has a single responsibility, making the codebase easy to understand and extend.
