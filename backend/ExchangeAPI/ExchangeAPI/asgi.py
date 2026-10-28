#import os

#os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ExchangeAPI.settings")

#from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
#from django.core.asgi import get_asgi_application  # noqa: E402

#from messaging.middleware import JwtAuthMiddleware  # noqa: E402
#from messaging.routing import websocket_urlpatterns  # noqa: E402


#application = ProtocolTypeRouter(
   # {
  #      "http": get_asgi_application(),
 #       "websocket": JwtAuthMiddleware(URLRouter(websocket_urlpatterns)),
 
#   }
#)
import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

# Step 1: Configure Django settings
os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "ExchangeAPI.settings"
)

# Step 2: Initialize Django first
django_asgi_app = get_asgi_application()

# Step 3: Import messaging modules AFTER initialization
from messaging.middleware import JwtAuthMiddleware
from messaging.routing import websocket_urlpatterns

# Step 4: Configure HTTP and WebSocket routing
application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": JwtAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})