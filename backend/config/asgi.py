import os 
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator
from django.core.asgi import get_asgi_application
from messaging.middleware import JWTAuthMiddleware
from messaging.routing import websocket_urlpatterns

websocket_application = JWTAuthMiddleware(
    URLRouter(websocket_urlpatterns)
)

# In production, validate WebSocket origins against ALLOWED_HOSTS
# In development, allow all origins (frontend runs on a different port)
if not settings.DEBUG:
    websocket_application = AllowedHostsOriginValidator(websocket_application)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": websocket_application,
})
