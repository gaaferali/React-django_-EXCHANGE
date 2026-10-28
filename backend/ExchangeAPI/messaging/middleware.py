from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken

from users.models import User


@database_sync_to_async
def user_for_token(token_value):
    try:
        token = AccessToken(token_value)
        return User.objects.get(pk=token["user_id"], is_active=True, is_banned=False)
    except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
        return AnonymousUser()


class JwtAuthMiddleware:
    """Authenticate browser WebSockets with a short-lived JWT query parameter."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        close_old_connections()
        query = parse_qs(scope.get("query_string", b"").decode())
        token = query.get("token", [None])[0]
        scope["user"] = await user_for_token(token) if token else AnonymousUser()
        return await self.app(scope, receive, send)
