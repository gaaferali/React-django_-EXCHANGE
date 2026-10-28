from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from ExchangeAPI.asgi import application
from users.models import User
from .models import Conversation, Message


class MessagingPermissionTests(APITestCase):
    def setUp(self):
        self.first = User.objects.create_user("first@example.com", "Strong-demo-pass-948!", name="First")
        self.second = User.objects.create_user("second@example.com", "Strong-demo-pass-948!", name="Second")
        self.outsider = User.objects.create_user("outside@example.com", "Strong-demo-pass-948!", name="Outsider")
        self.conversation = Conversation.objects.for_users(self.first, self.second)
        Message.objects.create(conversation=self.conversation, sender=self.first, body="Hello")

    def test_only_participants_can_access_history(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.get(reverse("conversations-messages", args=(self.conversation.id,)))
        self.assertEqual(response.status_code, 404)
        self.client.force_authenticate(self.second)
        allowed = self.client.get(reverse("conversations-messages", args=(self.conversation.id,)))
        self.assertEqual(allowed.status_code, 200)
        self.assertEqual(allowed.data["count"], 1)

    def test_websocket_rejects_missing_token(self):
        async def scenario():
            communicator = WebsocketCommunicator(application, f"/ws/conversations/{self.conversation.id}/")
            connected, close_code = await communicator.connect()
            self.assertFalse(connected)
            self.assertEqual(close_code, 4403)

        async_to_sync(scenario)()

    def test_websocket_allows_participant_and_persists_message(self):
        token = str(AccessToken.for_user(self.second))

        async def scenario():
            communicator = WebsocketCommunicator(
                application, f"/ws/conversations/{self.conversation.id}/?token={token}"
            )
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
            await communicator.send_json_to({"body": "Is this still available?"})
            response = await communicator.receive_json_from()
            self.assertEqual(response["type"], "message")
            await communicator.disconnect()

        async_to_sync(scenario)()
        self.assertTrue(
            Message.objects.filter(conversation=self.conversation, body="Is this still available?").exists()
        )
