from api.views.team_members_view import all_team_members
from django.urls import path
urlpatterns=[
    path("all_team_members/", all_team_members, name="all_team_members"),
]