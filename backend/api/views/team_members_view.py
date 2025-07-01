from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.models.workspace import Workspace
from api.middlewares.auth_middleware import jwt_authentication
from api.models.team_members import TeamMembers
from api.serializers.team_serializer import TeamSerializer

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
            "success":True,
            "message":"Team Members fetched successfully",
            "payload":{
                "in_team":TeamSerializer(in_team, many=True).data,
                "invited":TeamSerializer(invited, many=True).data
            }
        },status=drf_status.HTTP_200_OK)
    except Exception as e:
        print("Some error occured while fetching the team members : ", e)
        return Response({"success":False, "message":"Team member fetch failed", "payload":{}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)