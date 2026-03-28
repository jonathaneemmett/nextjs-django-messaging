from rest_framework import generics, status
from rest_framework.response import Response                                      
from rest_framework.views import APIView                  
from .models import Message             
from .serializers import MessageSerializer

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    filterset_fields = ['is_read', 'sender']
    search_fields = ['subject', 'body']
    ordering_fields = ['created_at', 'subject']

    def get_queryset(self):
        return Message.objects.filter(recipient=self.request.user, is_archived=False)
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
class MessageMarkReadView(APIView):
    def patch(self, request, pk):  
        try:                                                                      
            message = Message.objects.get(pk=pk, recipient=request.user)
        except Message.DoesNotExist:                                    
            return Response(status=status.HTTP_404_NOT_FOUND)
        message.is_read = True                               
        message.save()                                                            
        return Response(MessageSerializer(message).data)

class SentMessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(sender=self.request.user, is_archived=False)

class MessageBulkReadView(APIView):
    def patch(self, request):
        message_ids = request.data.get('ids', [])
        updated = Message.objects.filter(
            pk__in=message_ids,
            recipient=request.user,
        ).update(is_read=True)
        return Response({'updated': updated})

class MessageDeleteView(APIView):
    def delete(self, request, pk):
        try:
            message = Message.objects.get(pk=pk, recipient=request.user)
        except Message.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MessageArchiveView(APIView):
    def patch(self, request, pk):
        try:
            message = Message.objects.get(pk=pk, recipient=request.user)
        except Message.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        message.is_archived = True
        message.save()
        return Response(MessageSerializer(message).data)

    def delete(self, request, pk):
        try:
            message = Message.objects.get(pk=pk, recipient=request.user)
        except Message.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UnreadCountView(APIView):
    def get(self, request):
        count = Message.objects.filter(
            recipient=request.user,
            is_read=False,
            is_archived=False,
        ).count()
        return Response({'unread_count': count})