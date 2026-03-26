# Nexus Chat

A production-grade real-time chat application built with Node.js, Socket.io,
Redis pub/sub, and React. Designed to demonstrate scalable WebSocket architecture
with full TypeScript coverage end-to-end.

---

## Architecture
```
┌─────────────┐     WebSocket      ┌──────────────────────┐
│ React client│ ◄────────────────► │  Node.js + Socket.io  │
│  (Vite)     │     REST (auth)    │  Express server       │
└─────────────┘                    └──────────┬───────────┘
                                              │ pub/sub
                                   ┌──────────▼───────────┐
                                   │     Redis 7           │
                                   │  pub/sub + history    │
                                   └──────────────────────┘
```

**Why Redis pub/sub?** A single Node.js process handles one server instance.
Redis decouples message broadcasting so the architecture scales horizontally —
spin up N server instances and every client receives every message regardless
of which instance they're connected to.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, CSS Modules |
| Backend | Node.js 20, Express, Socket.io 4, TypeScript |
| Cache / broker | Redis 7 (pub/sub + message history) |
| Auth | JWT (RS256, verified on socket handshake) |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

---

## Features

- Real-time messaging across multiple rooms
- User presence (online members list per room)
- Typing indicators with debounce
- Message history (last 50 messages, persisted in Redis)
- JWT authentication on every socket connection
- Graceful server shutdown without dropping connections
- Multi-stage Docker builds (builder → production, minimal images)
- CI pipeline: TypeScript checks + Docker build validation on every push

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### Local development
```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/nexus-chat.git
cd nexus-chat

# 2. Start Redis
docker-compose up redis -d

# 3. Server
cd server
cp .env.example .env      # set JWT_SECRET to any long string
npm install
npm run dev

# 4. Client (new terminal)
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Production (full stack via Docker)
```bash
cp .env.example .env      # set a strong JWT_SECRET
docker-compose up --build
```

Open [http://localhost](http://localhost)

---

## Project structure
```
nexus-chat/
├── server/
│   └── src/
│       ├── config/       # Centralised env config
│       ├── middleware/   # JWT socket auth
│       ├── routes/       # HTTP endpoints (auth)
│       ├── services/     # Redis singleton
│       ├── socket/       # Socket event handlers
│       └── types/        # Shared TypeScript types
├── client/
│   └── src/
│       ├── components/   # UI components + CSS Modules
│       ├── context/      # AuthContext
│       ├── hooks/        # useSocket, useChat, useTypingIndicator
│       ├── pages/        # Chat page
│       ├── services/     # HTTP API calls
│       └── types/        # Shared TypeScript types
└── .github/
    └── workflows/
        ├── ci.yml        # Lint + build + Docker validate
        └── cd.yml        # Build + push to Docker Hub on main
```

---

## CI / CD

| Trigger | Pipeline |
|---|---|
| Push to any branch / PR | TypeScript check, Vite build, Docker image build validation |
| Merge to `main` | All of the above + push images to Docker Hub |

---

## Roadmap

- [ ] PostgreSQL persistence (replace in-memory user store)
- [ ] Message reactions (Redis Hashes)
- [ ] Per-user rate limiting (Redis sliding window)
- [ ] Read receipts
- [ ] End-to-end Playwright tests

---

## License

MIT