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

### Prerequisites

- A VPS or server with Docker and Docker Compose installed
- A domain name pointed at the server (optional but recommended for HTTPS)

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd django-messaging
cp .env.example .env
```

Edit `.env` with your values. Generate secrets with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

**Required `.env` variables:**

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key (generate with command above) |
| `JWT_SIGNING_KEY` | JWT signing key (generate a separate one) |
| `POSTGRES_PASSWORD` | Database password |
| `ALLOWED_HOSTS` | Your domain, e.g. `yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | Frontend origin, e.g. `https://yourdomain.com` |
| `NEXT_PUBLIC_API_URL` | API URL, e.g. `https://yourdomain.com` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL, e.g. `wss://yourdomain.com/ws/notifications/` |

**Optional `.env` variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `messaging` | Database name |
| `POSTGRES_USER` | `messaging` | Database user |
| `SECURE_SSL_REDIRECT` | `False` | Set to `True` when HTTPS is configured |
| `SECURE_HSTS_SECONDS` | `0` | Set to `31536000` when HTTPS is confirmed working |

### 2. Build and start

```bash
docker compose up -d --build
```

### 3. Initialize the database

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 4. Verify

Open `http://your-server-ip` (or your domain). You should see the login page.

### Architecture

```
nginx (port 80/443)
├── /ws/*          → backend (Uvicorn, 4 workers)
├── /api/*         → backend
├── /admin/*       → backend
└── /*             → frontend (Next.js standalone)

backend → PostgreSQL, Redis
```

All containers are internal except nginx, which is the only one exposed to the outside.

### Managing the deployment

```bash
# View logs
docker compose logs -f              # all services
docker compose logs -f backend      # backend only

# Restart a service
docker compose restart backend

# Stop everything
docker compose down

# Stop and remove data (including database)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# Run a Django management command
docker compose exec backend python manage.py <command>

# Create additional users
docker compose exec backend python manage.py createsuperuser
```

### HTTPS with Let's Encrypt

Once you have a domain pointed at your server:

1. Install Certbot on the host (not in Docker):

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

2. Update `nginx/nginx.conf` to listen on 443 with the certificates:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... existing location blocks ...
}
```

3. Mount the certificates in `docker-compose.yml` under the nginx service:

```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

4. Update `.env`:

```
CORS_ALLOWED_ORIGINS=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws/notifications/
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
```

5. Rebuild:

```bash
docker compose up -d --build
```
