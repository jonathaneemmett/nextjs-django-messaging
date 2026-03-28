# Django Messaging System — Roadmap

## Completed

- [x] Django project scaffolding with Channels + DRF
- [x] Message model (sender, recipient, subject, body, is_read, created_at)
- [x] REST API: create message (POST), list inbox (GET), mark read (PATCH)
- [x] WebSocket consumer with per-user groups
- [x] Real-time push via Django signal on message creation
- [x] Unread message delivery on WebSocket connect
- [x] ASGI routing with auth middleware and origin validation
- [x] Django admin registration

## Phase 1: Production Hardening

- [ ] Environment-based settings (django-environ or python-decouple)
  - SECRET_KEY, DEBUG, ALLOWED_HOSTS from env vars
- [ ] Switch to PostgreSQL
- [ ] Switch channel layer to Redis (`channels_redis`)
- [ ] Replace CSRF-exempt session auth with token auth (DRF TokenAuth or JWT)
- [ ] Configure logging
- [ ] Add pagination to message list endpoint
- [ ] Add rate limiting (django-ratelimit or DRF throttling)
- [ ] Write tests (models, API, WebSocket consumer)

## Phase 2: API Enhancements

- [ ] Sent messages endpoint (GET /api/messages/sent/)
- [ ] Bulk mark as read
- [ ] Delete / archive messages
- [ ] Message search and filtering (by sender, date range, read status)
- [ ] Attachments support (file uploads)
- [ ] Unread count endpoint

## Phase 3: Deployment

- [ ] Dockerize backend (Django + Uvicorn + Redis)
- [ ] Nginx reverse proxy with HTTPS/WSS
- [ ] Multi-worker Uvicorn configuration
- [ ] CI/CD pipeline
- [ ] Database migrations strategy for production

## Phase 4: Frontend (Next.js)

- [ ] Next.js project scaffolding in `frontend/`
- [ ] Auth flow (login/logout)
- [ ] Mail-like inbox UI
- [ ] Real-time message updates via WebSocket
- [ ] Message compose / reply
- [ ] Read/unread state management
- [ ] Responsive design

## Phase 5: Future Considerations

- [ ] Message threads / conversations
- [ ] Multiple recipients / group messaging
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Push notifications (browser / mobile)
- [ ] Message encryption
- [ ] Integration into existing API project
