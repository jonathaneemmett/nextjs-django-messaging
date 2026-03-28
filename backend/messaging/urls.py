from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/sent/', views.SentMessageListView.as_view(), name='message-sent'),
    path('messages/mark-read/', views.MessageBulkReadView.as_view(), name='message-bulk-mark-read'),
    path('messages/unread-count/', views.UnreadMessageCountView.as_view(), name='message-unread-count'),
    # needs to be last to avoid conflicts with other message endpoints
    path('messages/<int:pk>/', views.MessageArchiveView.as_view(), name='message-archive-delete'),
    path('messages/<int:pk>/mark-read/', views.MessageMarkReadView.as_view(), name='message-mark-read'),
]

