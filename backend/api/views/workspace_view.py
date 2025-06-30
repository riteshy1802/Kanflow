from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.models.workspace import Workspace
from api.serializers.workspace_serializer import WorkspaceSerializer
from api.middlewares.auth_middleware import jwt_authentication
from api.models.user import User

@api_view(['POST'])
@jwt_authentication
def create_workspace(request):
    try:
        data = request.data.copy()
        print("Authenticated User ID:", request.user_id)
        data['creator'] = request.user_id
        print("Data : ", data)
        serializer = WorkspaceSerializer(data=data)
        if serializer.is_valid():
            workspace = serializer.save(creator=User.objects.get(userId=request.user_id))
            print("Workspace created:", workspace)
            return Response({"success": True, "message": "Workspace created successfully", "payload": serializer.data }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "success": False, "message": "Invalid data", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print("Error: while creating Workspace : ", str(e))
        return Response({"success": False, "message": "Workspace creation failed", "payload": {}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_authentication
def get_workspace(request):
    try:
        data = request.data
        workspaceId=data.get('workspaceId')
        workspace = Workspace.objects.get(workspaceId=workspaceId)
        workspace_data = WorkspaceSerializer(workspace).data
        return Response({
            "success": True, "message": "Workspace data found", "payload": workspace_data}, status=status.HTTP_200_OK)
    except Workspace.DoesNotExist:
        return Response({"success": False, "message": "Workspace not found","payload": {}}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print("Error: while getting Workspace : ", str(e))
        return Response({"success": False, "message": "Failed to get Workspace data", "payload": {}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)