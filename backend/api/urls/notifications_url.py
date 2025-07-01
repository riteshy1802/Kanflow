from django.urls import path
from api.views.notifications_view import get_all_notfications

urlpatterns=[
    path('get_all_notfications/',get_all_notfications,name="get_all_notfications")
]