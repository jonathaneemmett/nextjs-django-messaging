from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import Message


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if not self.scope["user"].is_authenticated:
            await self.close()
            return
        self.group_name = f"user_{self.scope['user'].id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send_unread_messages()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def new_message(self, event):
        await self.send_json(event["message"])

    @database_sync_to_async
    def get_unread_messages(self):
        return list(
            Message.objects.filter(recipient=self.scope["user"], is_read=False).values(
                "id", "sender__username", "subject", "body", "created_at"
            )
        )

    async def send_unread_messages(self):
        messages = await self.get_unread_messages()
        for msg in messages:
            await self.send_json({
                "id": msg["id"],
                "sender": msg["sender__username"],
                "subject": msg["subject"],
                "body": msg["body"],
                "created_at": msg["created_at"].isoformat(),
            })