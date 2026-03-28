from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message

@receiver(post_save, sender=Message)
def push_message_to_recipient(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        group_name = f"user_{instance.recipient.id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "new_message",
                "message": {
                    "id": instance.id,
                    "sender": instance.sender.username,
                    "subject": instance.subject,
                    "body": instance.body,
                    "created_at": instance.created_at.isoformat(),
                },
            },
        )