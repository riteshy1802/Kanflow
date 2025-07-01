from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.middlewares.auth_middleware import jwt_authentication
from api.models.notifications import Notifications
from api.models.user import User
from api.serializers.notification_serializer import NotificationSerializer
from api.models.team_members import TeamMembers

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
    
@api_view(['POST'])
@jwt_authentication
def accept_reject_workspace_invite(request):
    try:
        data=request.data
        reaction=data.get('reaction')
        workspaceId=data.get('workspaceId')
        notification_id=data.get('notification_id')
        user_id=request.user_id
        notification = Notifications.objects.filter(notification_id=notification_id).first()
        if not notification:
            return Response({"success": False,"message": "Notification not found"}, status=drf_status.HTTP_404_NOT_FOUND)
        notification.reaction=reaction
        notification.save()# Saving the notificiation update reaction whether is accepted or rejected

        team_member = TeamMembers.objects.filter(workspaceId__workspaceId=workspaceId,userId__userId=user_id).first()
        team_member.status=reaction
        if not team_member:
            return Response({
                "success": False,
                "message": "Team member not found for this workspace."
            }, status=drf_status.HTTP_404_NOT_FOUND)
        team_member.save()
        return Response({"success": True,"message": f"Workspace invite {reaction} successfully."}, status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Error in updating : ", e)
        return Response({"success":False, "message":"Something went wrong while accepting-rejecting"}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@jwt_authentication
def mark_notification_read(request):
    try:
        data=request.data
        notification_id = data.get('notification_id')
        if not notification_id:
            return Response({"success": False,"message": "Notification ID is required"}, status=drf_status.HTTP_400_BAD_REQUEST)
        notification = Notifications.objects.filter(notification_id=notification_id).first()
        if not notification:
            return Response({"success": False,"message": "Notification not found"}, status=drf_status.HTTP_404_NOT_FOUND)
        
        notification.is_read = True
        notification.save()
        return Response({"success": True,"message": "Notification marked as read"}, status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Error in updating the read reciept : ", e)
        return Response({"success":False, "message":"Unable to mark read true"}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)