from rest_framework import generics, status
from rest_framework.response import Response                                      
from rest_framework.views import APIView                  
from .models import Message             
from .serializers import MessageSerializer

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(recipient=self.request.user)
    
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

