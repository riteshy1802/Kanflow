from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/', include('api.urls.user_url')),
    path('api/workspace/', include('api.urls.workspace_url'))
]
