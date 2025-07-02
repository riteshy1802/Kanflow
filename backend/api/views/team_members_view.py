from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.models.workspace import Workspace
from api.middlewares.auth_middleware import jwt_authentication
from api.models.team_members import TeamMembers
from api.serializers.team_serializer import TeamSerializer
from api.utils.user_utils import is_user_admin
from api.models.notifications import Notifications
from api.models.message import Message
from api.models.user import User

@api_view(['POST'])
@jwt_authentication
def all_team_members(request):
    try:
        data = request.data
        workspaceId = data.get('workspaceId')
        if not workspaceId:
            return Response({"success":False, "message":"WorkspaceId not found"}, status=drf_status.HTTP_400_BAD_REQUEST)

        workspace = Workspace.objects.filter(workspaceId=workspaceId).first()
        if not workspace:
            return Response({"success": False, "message": "Workspace not found"}, status=drf_status.HTTP_404_NOT_FOUND)

        team_members = TeamMembers.objects.filter(workspaceId=workspace)
        in_team = team_members.filter(status="accepted")
        invited = team_members.exclude(status="accepted")

        return Response({
            "success": True,
            "message": "Team Members fetched successfully",
            "payload": {
                "creatorId": str(workspace.creator.userId),
                "in_team": TeamSerializer(in_team, many=True).data,
                "invited": TeamSerializer(invited, many=True).data
            }
        }, status=drf_status.HTTP_200_OK)

    except Exception as e:
        print("Some error occurred while fetching the team members:", e)
        return Response({
            "success": False,
            "message": "Team member fetch failed",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@jwt_authentication
def remove_member(request):
    try:
        data = request.data
        email = data.get('email') # member(user/admin) -  whom to remove
        workspace_id = data.get('workspaceId')
        user_id = request.user_id # admin - who removes

        is_admin = is_user_admin(user_id, workspace_id)
        if not is_admin:
            return Response({
                "success": False,
                "message": "Only Admins have the privilege to remove a user",
                "payload": {"admin": is_admin}
            }, status=drf_status.HTTP_401_UNAUTHORIZED)

        workspace = Workspace.objects.get(workspaceId=workspace_id)
        team_member = TeamMembers.objects.get(email=email, workspaceId=workspace)

        team_member.delete()

        content = f"Your access to the Workspace '{workspace.name}' has been revoked. You no longer will be able to access it."
        message = Message.objects.create(content=content)

        to_user = User.objects.filter(email=email).first()

        Notifications.objects.filter(
            to_email=email,
            workspaceId=workspace
        ).update(reaction="revoked")

        Notifications.objects.create(
            fromUser=request.user,
            toUser=to_user if to_user else None,
            to_email=email,
            workspaceId=workspace,
            messageId=message,
            type="info",
            reaction="revoked"
        )

        return Response({
            "success": True,
            "message": "Member removed and notified successfully",
            "payload": {}
        }, status=drf_status.HTTP_200_OK)

    except TeamMembers.DoesNotExist:
        return Response({
            "success": False,
            "message": "Team member not found",
            "payload": {}
        }, status=drf_status.HTTP_404_NOT_FOUND)

    except Workspace.DoesNotExist:
        return Response({
            "success": False,
            "message": "Workspace not found",
            "payload": {}
        }, status=drf_status.HTTP_404_NOT_FOUND)

    except Exception as e:
        print("Error while removing team member:", str(e))
        return Response({
            "success": False,
            "message": "Failed to remove member",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_authentication
def change_privilege(request):
    try:
        data = request.data
        user_id = request.user_id
        newPrivilege = data.get('privilege')
        workspace_id = data.get('workspaceId')
        email = data.get('roleChangeEmail')
        is_admin = is_user_admin(user_id, workspace_id)
        if not is_admin:
            return Response({
                "success": False,
                "message": "Only Admins have the privilege to Update a user",
                "payload": {"admin": is_admin}
            }, status=drf_status.HTTP_403_FORBIDDEN)
        team_member = TeamMembers.objects.get(email=email, workspaceId=workspace_id)
        team_member.privilege = newPrivilege
        team_member.save()
        return Response({"success":True, "message":"Role updated!"},status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Some error occured in the privilege change : ", e)
        return Response({"success":False, "message" : "Privilege change failed"}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)