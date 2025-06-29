from django.urls import path
from api.views.user_view import register, login, refresh, get_user, logout

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("refresh/", refresh, name="refresh"),
    path("me/", get_user, name="get_user"),
    path("logout/", logout, name="logout"),
]
