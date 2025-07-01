from django.urls import path
from api.views.workspace_view import create_workspace,get_workspace,invite_team_members,get_all_workspaces,update_workspace_name

urlpatterns=[
    path("create_workspace/", create_workspace, name="create_workspace"),
    path("get_workspace/", get_workspace, name="get_workspace"),
    path("invite_team_member/", invite_team_members, name="invite_team_members"),
    path("get_all_workspaces/", get_all_workspaces, name="get_all_workspaces"),
    path("update_workspace_name/", update_workspace_name, name="update_workspace_name")
]