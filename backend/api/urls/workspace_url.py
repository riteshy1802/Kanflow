from django.urls import path
from api.views.workspace_view import create_workspace,get_workspace

urlpatterns=[
    path("create_workspace/", create_workspace, name="create_workspace"),
    path("get_workspace", get_workspace, name="get_workspace")
]