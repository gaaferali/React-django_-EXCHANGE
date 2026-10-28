from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import Conversation, Message


class ConversationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = int(self.scope["url_route"]["kwargs"]["conversation_id"])
        self.group_name = f"conversation_{self.conversation_id}"
        user = self.scope.get("user")
        if not user or not user.is_authenticated or not await self.is_participant(user.id):
            await self.close(code=4403)
            return
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, _close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **_kwargs):
        body = str(content.get("body", "")).strip()
        if not body or len(body) > 2000:
            await self.send_json({"type": "error", "detail": "Messages must contain 1 to 2000 characters."})
            return
        message = await self.create_message(self.scope["user"].id, body)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.message", "message": message},
        )

    async def chat_message(self, event):
        await self.send_json({"type": "message", "message": event["message"]})

    @database_sync_to_async
    def is_participant(self, user_id):
        return Conversation.objects.filter(id=self.conversation_id).filter(
            models.Q(participant_one_id=user_id) | models.Q(participant_two_id=user_id)
        ).exists()

    @database_sync_to_async
    def create_message(self, user_id, body):
        conversation = Conversation.objects.get(id=self.conversation_id)
        if user_id not in {conversation.participant_one_id, conversation.participant_two_id}:
            raise PermissionError("Not a participant")
        message = Message.objects.create(conversation=conversation, sender_id=user_id, body=body)
        conversation.save(update_fields=("updated_at",))
        return {
            "id": message.id,
            "body": message.body,
            "sender": {"id": message.sender_id, "name": message.sender.name},
            "created_at": message.created_at.isoformat(),
            "read_at": None,
        }


from django.db import models  # noqa: E402  (keeps consumer imports grouped by responsibility)
