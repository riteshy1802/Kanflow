from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.middlewares.auth_middleware import jwt_authentication
from api.models.notifications import Notifications
from api.models.user import User
from api.serializers.notification_serializer import NotificationSerializer

@api_view(['GET'])
@jwt_authentication
def get_all_notfications(request):
    userId = request.user_id
    user = User.objects.get(userId=userId)
    try:
        notfications = Notifications.objects.filter(toUser=user)
        notfications_serialized=NotificationSerializer(notfications, many=True)
        payload={
            "notifications":notfications_serialized.data
        }
        return Response({"success":True, "message":"Notifications fetch successful", "payload":payload},status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Fetching all the notfications : ", e)
        return Response({"success":False, "message":"Notifications could'nt be fetched", "payload":{}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)