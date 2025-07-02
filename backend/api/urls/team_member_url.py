from api.views.team_members_view import all_team_members, remove_member,change_privilege
from django.urls import path
urlpatterns=[
    path("all_team_members/", all_team_members, name="all_team_members"),
    path("remove_member/",remove_member,name="remove_member"),
    path("change_privilege/",change_privilege,name="change_privilege")
]