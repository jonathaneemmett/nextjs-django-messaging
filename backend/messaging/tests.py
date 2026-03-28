import pytest
from django.contrib.auth.models import User
from messaging.models import Message


@pytest.fixture
def sender(db):
    return User.objects.create_user(username='sender', password='testpass123')


@pytest.fixture
def recipient(db):
    return User.objects.create_user(username='recipient', password='testpass123')


@pytest.fixture
def message(db, sender, recipient):
    return Message.objects.create(
        sender=sender,
        recipient=recipient,
        subject='Test',
        body='Hello',
    )


class TestMessageModel:
    def test_create_message(self, message, sender, recipient):
        assert message.sender == sender
        assert message.recipient == recipient
        assert message.is_read is False

    def test_str(self, message):
        assert 'sender' in str(message)
        assert 'Test' in str(message)

    def test_ordering(self, db, sender, recipient):
        msg1 = Message.objects.create(sender=sender, recipient=recipient, subject='First', body='1')
        msg2 = Message.objects.create(sender=sender, recipient=recipient, subject='Second', body='2')
        messages = list(Message.objects.all())
        assert messages[0] == msg2
        assert messages[1] == msg1


class TestMessageAPI:
    @pytest.fixture
    def client(self, sender):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=sender)
        return client

    @pytest.fixture
    def recipient_client(self, recipient):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=recipient)
        return client

    def test_create_message(self, client, recipient):
        response = client.post('/api/messages/', {
            'recipient': recipient.id,
            'subject': 'Test',
            'body': 'Hello',
        })
        assert response.status_code == 201

    def test_list_inbox(self, recipient_client, message):
        response = recipient_client.get('/api/messages/')
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['subject'] == 'Test'

    def test_sender_does_not_see_sent_in_inbox(self, client, message):
        response = client.get('/api/messages/')
        assert response.status_code == 200
        assert len(response.data) == 0

    def test_cannot_send_to_self(self, client, sender):
        response = client.post('/api/messages/', {
            'recipient': sender.id,
            'subject': 'Test',
            'body': 'Hello',
        })
        assert response.status_code == 400

    def test_cannot_send_to_nonexistent_user(self, client):
        response = client.post('/api/messages/', {
            'recipient': 9999,
            'subject': 'Test',
            'body': 'Hello',
        })
        assert response.status_code == 400

    def test_mark_read(self, recipient_client, message):
        response = recipient_client.patch(f'/api/messages/{message.id}/mark-read/')
        assert response.status_code == 200
        assert response.data['is_read'] is True

    def test_cannot_mark_others_message_read(self, client, message):
        response = client.patch(f'/api/messages/{message.id}/mark-read/')
        assert response.status_code == 404

    def test_unauthenticated_cannot_list(self):
        from rest_framework.test import APIClient
        client = APIClient()
        response = client.get('/api/messages/')
        assert response.status_code in (401, 403)

    def test_unauthenticated_cannot_create(self):
        from rest_framework.test import APIClient
        client = APIClient()
        response = client.post('/api/messages/', {
            'recipient': 1,
            'subject': 'Test',
            'body': 'Hello',
        })
        assert response.status_code in (401, 403)
