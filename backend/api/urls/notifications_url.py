from django.urls import path
from api.views.notifications_view import get_all_notfications,mark_notification_read,accept_reject_workspace_invite

urlpatterns=[
    path('get_all_notfications/',get_all_notfications,name="get_all_notfications"),
    path('mark_notification_read/',mark_notification_read,name="mark_notification_read"),
    path('accept_reject_workspace_invite/',accept_reject_workspace_invite,name="accept_reject_workspace_invite"),
]