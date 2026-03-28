from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.MessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/mark-read/', views.MessageMarkReadView.as_view(), name='message-mark-read'),
]

