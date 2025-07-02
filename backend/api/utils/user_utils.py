
from api.models.team_members import TeamMembers

def is_user_admin(user_id, workspace_id):
    try:
        team_member = TeamMembers.objects.get(workspaceId=workspace_id, userId=user_id)
        return team_member.privilege == "admin"
    except TeamMembers.DoesNotExist:
        return False
