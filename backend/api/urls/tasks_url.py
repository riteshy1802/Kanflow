from django.urls import path
from api.views.tasks_view import create_task, update_task, delete_task, get_all_tasks, detail_task

urlpatterns=[
    path('create_task/', create_task, name="delete_task"),
    path('update_task/', update_task, name="update_task"),
    path('delete_task/', delete_task, name="delete_task"),
    path('get_all_tasks/', get_all_tasks, name="get_all_tasks"),
    path('detail_task/', detail_task, name="detail_task"),
]