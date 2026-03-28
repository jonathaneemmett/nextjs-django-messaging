# Root Findings — medscout-api Analysis

Analysis of the existing medscout-api project to inform technology choices for django-messaging.

## medscout-api Stack Summary

| Concern | Technology |
|---|---|
| App server | Gunicorn (WSGI, not ASGI) |
| Secrets/env | `os.environ.get()` + AWS Secrets Manager (no third-party library) |
| Database | PostgreSQL + PostGIS on AWS Aurora (read/write replica splitting) |
| Auth | SimpleJWT + Auth0 (dual authenticator) + session fallback |
| Channels/WebSocket | Not used |
| Logging | structlog + django-structlog with Datadog integration |
| Cache | Redis |
| Monitoring | Sentry + Datadog (ddtrace) |
| Feature flags | LaunchDarkly |
| Analytics | Segment + Mixpanel |
| Email | AWS SES |
| Testing | pytest + pytest-django + pytest-factoryboy |

## Key Architecture Details

### Server & Deployment
- Gunicorn serves all traffic via WSGI (`medscout_api.wsgi:application`)
- Multiple start scripts: `start.sh` (production, 16 workers), `start-dev.sh` (8 workers), `start-ecs.sh` (configurable)
- Dockerized with ECS deployment
- Datadog APM via `ddtrace-run` wrapper in ECS

### Settings Structure
- Single `settings.py` file (468 lines) with environment-based conditionals
- `ENVIRONMENT` env var controls behavior (`local`, `dev`, `production`)
- `local_settings.py` imports and overrides `settings.py` for development
- `DJANGO_SETTINGS_MODULE` env var selects which settings file to load

### Secrets Management
- Simple `os.environ.get()` with defaults for most config
- Custom `Secret` class (`medscout_api/secret.py`) wraps AWS Secrets Manager via boto3
- Secrets prefixed with environment name (e.g., `production/secret-name`)
- Lazy-loaded with optional JSON parsing
- No `.env` file library — all env vars set externally (Docker, ECS task definition, shell)

### Database
- Engine: `django.contrib.gis.db.backends.postgis`
- Aurora read/write splitting via custom `AuroraRouter` (`medscout_api/db.py`)
  - `default` → read replica
  - `write_only` → primary write endpoint
  - `read_only` → explicit read replica
- Local dev uses standard PostgreSQL via docker-compose

### Authentication
- DRF SimpleJWT (`djangorestframework-simplejwt==5.2.2`)
  - Access tokens: 1 hour, refresh tokens: 7 days with rotation
  - Algorithm: HS256, blacklisting enabled
- Custom `DualJWTAuthenticator`: tries SimpleJWT first, falls back to Auth0
- Custom `ClientTokenAuthenticator` for machine-to-machine auth
- Auth0 via `authlib` + `auth0-python`, credentials in AWS Secrets Manager
- Session authentication also enabled as fallback

### Logging
- structlog 25.5.0 + django-structlog 10.0.0
- JSON output in production, colored console in development
- Datadog attribute mapping for structured log forwarding

## Implications for django-messaging

### ASGI Server Decision: Daphne
- medscout-api uses Gunicorn (WSGI) and has no WebSocket support
- django-messaging requires WebSockets for real-time push
- **Daphne is the recommended choice** because it can run alongside Gunicorn:
  - Gunicorn continues serving all existing HTTP/REST traffic (unchanged)
  - Daphne serves only WebSocket connections (new)
  - Nginx routes `/ws/` to Daphne, everything else to Gunicorn
- This avoids replacing Gunicorn with Uvicorn across the entire medscout-api, which would be a high-risk change to a production system

### Technology Alignment
To match medscout-api patterns, django-messaging should use:

| Concern | Choice | Reason |
|---|---|---|
| Secrets/env | `os.environ.get()` | Matches existing pattern, no extra dependency |
| Database | PostgreSQL (docker-compose for local) | Matches Aurora/Postgres stack |
| Auth | SimpleJWT | Matches existing auth, enables shared token validation |
| Logging | structlog + django-structlog | Matches existing logging pipeline |
| Cache/channel layer | Redis (`channels_redis`) | Redis already in use for caching |
| Testing | pytest + pytest-django | Matches existing test setup |

### Integration Path
When merging into medscout-api:
1. Add `channels` + `channels_redis` + `daphne` to requirements
2. Add the `messaging` app to INSTALLED_APPS
3. Create `asgi.py` with WebSocket routing
4. Add Daphne as a second process in ECS/docker-compose
5. Configure nginx to route `/ws/` to Daphne
6. Channel layer uses the existing Redis instance
7. Auth middleware on WebSocket uses existing JWT tokens
