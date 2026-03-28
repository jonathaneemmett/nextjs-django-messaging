# Django Messaging

A real-time one-way messaging system with a Django backend and Next.js frontend. Messages are sent via REST API and pushed to connected users over WebSocket.

## Architecture

```
django-messaging/
├── backend/     Django + Channels + DRF
├── frontend/    Next.js + RTK Query + Tailwind
└── docker-compose.yml
```

**Backend** — Django REST API for creating, listing, filtering, archiving, and deleting messages. Django Channels pushes new messages to recipients over WebSocket in real time. Unread messages are delivered on reconnect.

**Frontend** — Next.js App Router with a mail-like inbox UI. RTK Query for data fetching, JWT auth, and a real-time WebSocket connection for instant message delivery.

## Prerequisites

- Python 3.12+
- Node.js 18+
- Docker (for PostgreSQL and Redis)

## Quick Start

You need three terminals running.

### Terminal 1 — Services (PostgreSQL + Redis)

```bash
docker compose up -d
```

### Terminal 2 — Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
uvicorn config.asgi:application --reload
```

The API is available at `http://localhost:8000`.

### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI is available at `http://localhost:3000`.

### Create a Second User

You need at least two users to send messages between them:

```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

## Backend

### Tech Stack

- Django 6.x + Django Channels 4.x (ASGI, WebSocket)
- Django REST Framework + SimpleJWT
- PostgreSQL
- Redis (channel layer via channels_redis)
- Uvicorn (ASGI server)
- structlog + django-structlog (logging)
- django-filter (search and filtering)
- django-cors-headers

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Obtain JWT access + refresh tokens |
| POST | `/api/token/refresh/` | Refresh an access token |
| GET | `/api/messages/` | List inbox (supports `?search=`, `?is_read=`, `?ordering=`) |
| POST | `/api/messages/` | Send a message |
| GET | `/api/messages/sent/` | List sent messages |
| GET | `/api/messages/unread-count/` | Get unread message count |
| PATCH | `/api/messages/mark-read/` | Bulk mark messages as read (`{"ids": [1,2,3]}`) |
| PATCH | `/api/messages/<id>/mark-read/` | Mark a single message as read |
| PATCH | `/api/messages/<id>/` | Archive a message |
| DELETE | `/api/messages/<id>/` | Permanently delete a message |

All endpoints require authentication. Include `Authorization: Bearer <token>` header.

### WebSocket

Connect to `ws://localhost:8000/ws/notifications/?token=<access_token>`. New messages are pushed in real time. Unread messages are delivered on connect. The frontend handles this automatically.

### Running Tests

```bash
cd backend
source venv/bin/activate
pytest
```

## Frontend

### Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Redux Toolkit + RTK Query
- react-hook-form + zod (form validation)
- Custom JWT auth (localStorage)
- Native WebSocket with auto-reconnect

### Pages

| Route | Description |
|-------|-------------|
| `/auth/login` | Login page |
| `/inbox` | Message inbox with search, bulk actions, unread indicators |
| `/inbox/[id]` | Message detail with archive and delete |
| `/sent` | Sent messages |
| `/compose` | Compose a new message |

### Environment Variables

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/notifications/
```

These default to `localhost:8000` if not set.

## Production Deployment

### With Docker Compose

1. Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
# Generate secrets:
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

2. Build and start:

```bash
docker compose up -d --build
```

3. Run migrations and create a superuser:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

The app is available at `http://localhost` (port 80).

### Architecture

```
nginx (port 80)
├── /ws/*          → backend (Uvicorn, 4 workers)
├── /api/*         → backend
├── /admin/*       → backend
└── /*             → frontend (Next.js standalone)

backend → PostgreSQL, Redis
```

### HTTPS

The nginx config serves HTTP on port 80. For production with HTTPS, add Certbot/Let's Encrypt and update nginx to listen on 443 with your SSL certificates. Update `.env` URLs to use `https://` and `wss://`.
