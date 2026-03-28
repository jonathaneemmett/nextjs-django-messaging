# Django Messaging

A real-time one-way messaging system with a Django backend and Next.js frontend. Messages are sent via REST API and pushed to connected users over WebSocket.

## Architecture

```
django-messaging/
├── backend/     Django + Channels + DRF
└── frontend/    Next.js (coming soon)
```

**Backend** — Django REST API for creating, listing, filtering, archiving, and deleting messages. Django Channels pushes new messages to recipients over WebSocket in real time. Unread messages are delivered on reconnect.

**Frontend** — Next.js app with a mail-like inbox UI. Connects to the backend via REST API and WebSocket.

## Backend

### Tech Stack

- Django 6.x + Django Channels 4.x (ASGI, WebSocket)
- Django REST Framework + SimpleJWT
- PostgreSQL
- Redis (channel layer)
- Uvicorn (ASGI server)
- structlog (logging)

### Prerequisites

- Python 3.12+
- Docker (for PostgreSQL and Redis)

### Setup

```bash
cd backend

# Start PostgreSQL and Redis
docker compose -f ../docker-compose.yml up -d

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Start the server
uvicorn config.asgi:application --reload
```

The API is available at `http://localhost:8000`.

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

Connect to `ws://localhost:8000/ws/notifications/` with a valid session cookie. New messages are pushed in real time. Unread messages are delivered on connect.

### Running Tests

```bash
cd backend
source venv/bin/activate
pytest
```
