from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.middlewares.auth_middleware import jwt_authentication
from api.models.workspace import Workspace
from api.models.team_members import TeamMembers
from api.models.user import User
from api.models.notifications import Notifications
from api.models.message import Message
from api.serializers.workspace_serializer import WorkspaceSerializer
from api.serializers.workspace_serializer import WorkspaceIdNameSerializer
from django.utils import timezone
from api.utils.user_utils import is_user_admin

@api_view(['POST'])
@jwt_authentication
def create_workspace(request):
    try:
        creator = request.user
        team_members = request.data.get("team_members", [])
        message_content = request.data.get("message", None)

        workspace_data = {
            "name": request.data.get("name"),
            "description": request.data.get("description"),
        }

        serializer = WorkspaceSerializer(data=workspace_data)
        if serializer.is_valid():
            workspace = serializer.save(creator=creator)
            print("Workspace created:", workspace)

            team_objs = []

            team_objs.append(
                TeamMembers(
                    userId=creator,
                    workspaceId=workspace,
                    privilege="admin",
                    status="accepted",
                    email=creator.email
                )
            )

            msg_obj = None
            if message_content:
                msg_obj = Message.objects.create(content=message_content)

            for member in team_members:
                email = member["email"]
                if email == creator.email:
                    continue

                privilege = member.get("privilege", "user")
                status = member.get("status", "pending")

                user = User.objects.filter(email=email).first()

                team_objs.append(
                    TeamMembers(
                        userId=user if user else None,
                        email=email,
                        workspaceId=workspace,
                        privilege=privilege,
                        status=status
                    )
                )

                Notifications.objects.create(
                    fromUser=creator,
                    workspaceId=workspace,
                    toUser=user if user else None,
                    to_email=email,
                    type="request",
                    messageId=msg_obj
                )

            TeamMembers.objects.bulk_create(team_objs)

            return Response({
                "success": True,
                "message": "Workspace created successfully with members and notifications",
                "payload": WorkspaceSerializer(workspace).data
            }, status=drf_status.HTTP_201_CREATED)

        else:
            return Response({
                "success": False,
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=drf_status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print("Error while creating Workspace:", str(e))
        return Response({
            "success": False,
            "message": "Workspace creation failed",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@jwt_authentication
def get_workspace(request):
    try:
        data = request.data
        workspace_id = data.get('workspaceId')

        is_team_member = TeamMembers.objects.filter(
            workspaceId=workspace_id,
            userId=request.user_id,
            status=TeamMembers.Status.ACCEPTED
        ).exists()

        if not is_team_member:
            return Response({"success": False,"message": "Not a valid/accepted team member","payload": {}}, status=drf_status.HTTP_401_UNAUTHORIZED)

        workspace = Workspace.objects.get(workspaceId=workspace_id)
        workspace_data = WorkspaceSerializer(workspace).data

        return Response({"success": True,"message": "Workspace data found","payload": workspace_data}, status=drf_status.HTTP_200_OK)

    except Workspace.DoesNotExist:
        return Response({"success": False,"message": "Workspace not found","payload": {}}, status=drf_status.HTTP_404_NOT_FOUND)

    except Exception as e:
        print("Error while getting Workspace:", str(e))
        return Response({"success": False,"message": "Failed to get workspace data","payload": {}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_authentication
def invite_team_members(request):
    try:
        data = request.data
        workspace_id = data.get('workspaceId')
        workspace = Workspace.objects.get(workspaceId=workspace_id)
        team_members = data.get('team_members', [])
        message_content = data.get('message')

        if not is_user_admin(request.user_id, workspace_id):
            return Response({
                "success": False,
                "message": "Only admins can invite members.",
                "payload": {}
            }, status=drf_status.HTTP_403_FORBIDDEN)

        msg_obj = Message.objects.create(content=message_content) if message_content else None

        invite_summary = {
            "already_in_team": [],
            "re_invited": [],
            "new_invites": []
        }

        for member in team_members:
            email = member['email'].lower()
            privilege = member['privilege']
            status = member['status']

            if email == request.user.email.lower():
                continue

            user = User.objects.filter(email=email).first()

            existing_member = TeamMembers.objects.filter(email=email, workspaceId=workspace).first()

            if existing_member:
                if existing_member.status == TeamMembers.Status.ACCEPTED:
                    invite_summary["already_in_team"].append(email)
                    continue

                existing_member.status = TeamMembers.Status.PENDING
                existing_member.updated_at = timezone.now()
                existing_member.save()
                invite_summary["re_invited"].append(email)

                old_notif = Notifications.objects.filter(
                    to_email=email,
                    workspaceId=workspace,
                    type="request",
                    reaction="pending"
                ).order_by("-created_at").first()

                if old_notif:
                    old_notif.reaction = "revoked"
                    old_notif.save()

            else:
                TeamMembers.objects.create(
                    workspaceId=workspace,
                    userId=user if user else None,
                    email=email,
                    privilege=privilege,
                    status=status
                )
                invite_summary["new_invites"].append(email)

            Notifications.objects.create(
                fromUser=request.user,
                workspaceId=workspace,
                toUser=user if user else None,
                to_email=email,
                type="request",
                messageId=msg_obj,
                reaction="pending"
            )

        message = "Invites processed."
        if invite_summary["already_in_team"]:
            message += f" Already in team: {', '.join(invite_summary['already_in_team'])}."
        if invite_summary["re_invited"]:
            message += f" Re-invited: {', '.join(invite_summary['re_invited'])}."
        if invite_summary["new_invites"]:
            message += f" New invites sent to: {', '.join(invite_summary['new_invites'])}."

        return Response({
            "success": True,
            "message": message,
            "payload": invite_summary
        }, status=drf_status.HTTP_200_OK)

    except Exception as e:
        print("Error while adding team members:", str(e))
        return Response({
            "success": False,
            "message": "Failed to add team members",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
@jwt_authentication
def get_all_workspaces(request):
    try:
        user_id=request.user_id
        user = User.objects.get(userId=user_id)
        my_workspaces = Workspace.objects.filter(creator=user).values("workspaceId", "name")  #I am the owner
        shared_workspace_ids = TeamMembers.objects.filter(
            userId=user,
            status=TeamMembers.Status.ACCEPTED
        ).exclude(
            workspaceId__creator=user
        ).values_list("workspaceId", flat=True)

        shared_workspaces = Workspace.objects.filter(workspaceId__in=shared_workspace_ids).values("workspaceId", "name")

        owned_serialized = WorkspaceIdNameSerializer(my_workspaces,many=True).data
        shared_serialized = WorkspaceIdNameSerializer(shared_workspaces,many=True).data

        payload = {
            "my_workspaces":owned_serialized,
            "shared_workspaces":shared_serialized
        }
        return Response({"success":True, "message":"Workspace data found!", "payload":payload}, status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Error while getting workspaces data for app sidebar:", str(e))
        return Response({"success":False, "message":"Failed to fetch all workspaces", "payload":{}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@jwt_authentication
def update_workspace_name(request):
    try:
        data = request.data
        workspaceId = data.get('workspaceId')
        user_id = request.user_id
        newName = data.get('workspaceNewName')
        is_admin = is_user_admin(user_id, workspaceId)
        if not is_admin:
            return Response({
                "success": False,
                "message": "Only Admins have the privilege to update board name",
            }, status=drf_status.HTTP_401_UNAUTHORIZED)
        workspace = Workspace.objects.filter(workspaceId=workspaceId).first()
        if not workspace:
            # keeping the message empty to not to show on the frontend, toast will be shown for this..
            return Response({"success":False,"message":""}, status=drf_status.HTTP_404_NOT_FOUND)
        workspace.name=newName
        workspace.save()
        return Response({"success":True, "message":"Workspace name updated!"}, status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Error occured while updating the workspace name : ",e)
        return Response({"success":False, "message":"Couldn't update the name!"}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
