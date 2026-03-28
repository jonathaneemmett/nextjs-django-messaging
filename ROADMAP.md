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

- [x] Environment-based settings (os.environ.get, aligned with medscout-api)
- [x] Switch to PostgreSQL (docker-compose)
- [x] Switch channel layer to Redis (channels_redis)
- [x] Replace CSRF-exempt session auth with SimpleJWT (aligned with medscout-api)
- [x] Configure logging (structlog + django-structlog)
- [x] Add pagination to message list endpoint
- [x] Add rate limiting (DRF throttling)
- [x] Write tests (models, API)

## Phase 2: API Enhancements

- [x] Sent messages endpoint (GET /api/messages/sent/)
- [x] Bulk mark as read
- [x] Delete / archive messages
- [x] Message search and filtering (django-filter, search, ordering)
- [x] Unread count endpoint
- [ ] Attachments support (file uploads) — deferred

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
