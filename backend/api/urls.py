from django.urls import path
from rest_framework.views import APIView
from rest_framework.response import Response

class PingView(APIView):
    def get(self, request):
        return Response({"message": "pong"})

urlpatterns = [
    path('ping/', PingView.as_view(), name='ping'),
]
