from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'subject', 'body', 'is_read', 'is_archived', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'is_archived', 'created_at']

    def validate_recipient(self, value):
        if value == self.context['request'].user:
            raise serializers.ValidationError("You cannot send a message to yourself.")
        return value
    