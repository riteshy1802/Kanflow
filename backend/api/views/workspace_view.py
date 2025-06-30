from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.models.workspace import Workspace
from api.serializers.workspace_serializer import WorkspaceSerializer
from api.middlewares.auth_middleware import jwt_authentication
from api.models.user import User
from api.models.team_members import TeamMembers

@api_view(['POST'])
@jwt_authentication
def create_workspace(request):
    try:
        creator=User.objects.get(userId=request.user_id)
        team_members=request.data.get("team_members", [])
        workspace_data = {
            "name": request.data.get("name"),
            "description": request.data.get("description"),
        }
        serializer = WorkspaceSerializer(data=workspace_data)
        if serializer.is_valid():
            workspace = serializer.save(creator=creator)
            print("Workspace created:", workspace)

            team_objs=[]

            team_objs.append(
                TeamMembers(
                    userId=creator,
                    workspaceId=workspace,
                    privilege="admin",
                    status="accepted",
                )
            )

            for member in team_members:
                email = member["email"]
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
            TeamMembers.objects.bulk_create(team_objs)

            return Response({"success": True, "message": "Workspace created successfully and members added", "payload": WorkspaceSerializer(workspace).data }, status=drf_status.HTTP_201_CREATED)
        else:
            return Response({
                "success": False, "message": "Invalid data", "errors": serializer.errors}, status=drf_status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("Error: while creating Workspace : ", str(e))
        return Response({"success": False, "message": "Workspace creation failed", "payload": {}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_authentication
def get_workspace(request):
    try:
        data = request.data
        workspaceId=data.get('workspaceId')
        workspace = Workspace.objects.get(workspaceId=workspaceId)
        workspace_data = WorkspaceSerializer(workspace).data
        return Response({
            "success": True, "message": "Workspace data found", "payload": workspace_data}, status=drf_status.HTTP_200_OK)
    except Workspace.DoesNotExist:
        return Response({"success": False, "message": "Workspace not found","payload": {}}, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("Error: while getting Workspace : ", str(e))
        return Response({"success": False, "message": "Failed to get Workspace data", "payload": {}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)