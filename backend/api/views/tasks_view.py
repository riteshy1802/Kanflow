from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.middlewares.auth_middleware import jwt_authentication
from datetime import datetime
from api.models.tasks import Tasks
import uuid
from api.models.workspace import Workspace
from api.models.user import User

@api_view(['POST'])
@jwt_authentication
def create_task(request):
    try:
        data = request.data
        workspaceId = data.get('workspaceId')
        title = str(data.get("title") or "").strip()
        print("Title : ", title)
        description = str(data.get("description") or "").strip()
        due_date_str = data.get('dueDate')
        priority = data.get('priority')
        status = data.get('status')
        assignees = data.get('assignees',[])
        tags = data.get('tags',[])
        if not all([title, description, due_date_str, priority, status]):
            return Response({"success": False, "message": "All fields are required", "payload": {}},status=drf_status.HTTP_400_BAD_REQUEST)
        try:
            print("Date : ",due_date_str)
            dueDate = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"success": False, "message": "Invalid due date format", "payload": {}},
                            status=drf_status.HTTP_400_BAD_REQUEST)
        try:
            assignees_uuid = [uuid.UUID(a) for a in assignees]
        except ValueError:
            return Response({"success": False, "message": "Invalid assignee UUID format", "payload": {}},
                            status=drf_status.HTTP_400_BAD_REQUEST)
        workspace = Workspace.objects.get(workspaceId=workspaceId)
        user = User.objects.get(userId=request.user_id)
        task = Tasks.objects.create(
            created_by=user,
            workspaceId=workspace,
            assignees=assignees_uuid,
            tags=tags,
            description=description,
            dueDate=dueDate,
            priority=priority,
            status=status,
            title=title
        )
        return Response({
            "success": True,
            "message": "Task created successfully",
            "payload": {
                "task_id": str(task.task_id),
                "title": task.title,
                "description": task.description,
                "due_date": str(task.dueDate),
                "priority": task.priority,
                "status": task.status,
                "assignees": [str(a) for a in task.assignees],
                "tags": task.tags
            }
        }, status=drf_status.HTTP_201_CREATED) 
    except Exception as e:
        print("Failed to create a task",e)
        return Response({"success":False, "message":"Task creation failed", "payload":{}},status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from datetime import datetime
import uuid
from api.models import Tasks, Workspace, User

@api_view(['POST'])
@jwt_authentication
def update_task(request):
    try:
        data = request.data
        task_id = data.get("task_id")

        if not task_id:
            return Response({
                "success": False,
                "message": "Task ID is required",
                "payload": {}
            }, status=drf_status.HTTP_400_BAD_REQUEST)

        task = Tasks.objects.filter(task_id=task_id).first()
        if not task:
            return Response({
                "success": False,
                "message": "Task not found",
                "payload": {}
            }, status=drf_status.HTTP_404_NOT_FOUND)

        updatable_fields = [
            "title", "description", "dueDate", "priority", "status", "assignees", "tags"
        ]

        for field in updatable_fields:
            if field in data:
                if field == "dueDate":
                    try:
                        due_date = datetime.strptime(data[field], "%Y-%m-%d").date()
                        task.dueDate = due_date
                    except ValueError:
                        return Response({
                            "success": False,
                            "message": "Invalid date format. Use YYYY-MM-DD",
                            "payload": {}
                        }, status=drf_status.HTTP_400_BAD_REQUEST)

                elif field == "assignees":
                    try:
                        assignees_uuid = [uuid.UUID(a) for a in data[field]]
                        task.assignees = assignees_uuid
                    except ValueError:
                        return Response({
                            "success": False,
                            "message": "Invalid UUID in assignees list",
                            "payload": {}
                        }, status=drf_status.HTTP_400_BAD_REQUEST)

                elif field == "tags":
                    task.tags = data[field]

                else:
                    setattr(task, field, data[field])

        task.save()

        return Response({
            "success": True,
            "message": "Task updated successfully",
            "payload": {
                "task_id": str(task.task_id),
                "title": task.title,
                "description": task.description,
                "dueDate": str(task.dueDate),
                "priority": task.priority,
                "status": task.status,
                "tags": task.tags,
                "assignees": [str(a) for a in task.assignees]
            }
        }, status=drf_status.HTTP_200_OK)

    except Exception as e:
        print("Failed to update task", e)
        return Response({
            "success": False,
            "message": "Task update failed",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@jwt_authentication
def delete_task(request):
    try:
        task_id = request.data.get('taskId')
        if not task_id:
            return Response({"success": False, "message": "Task ID not provided"}, status=drf_status.HTTP_400_BAD_REQUEST)

        try:
            task_uuid = uuid.UUID(task_id)
        except ValueError:
            return Response({"success": False, "message": "Invalid UUID format"}, status=drf_status.HTTP_400_BAD_REQUEST)

        task = Tasks.objects.filter(task_id=task_uuid).first()
        if not task:
            return Response({"success": False, "message": "Task not found"}, status=drf_status.HTTP_404_NOT_FOUND)

        task.delete()
        return Response({"success": True, "message": "Task deletion successful"}, status=drf_status.HTTP_200_OK)

    except Exception as e:
        print("Failed to delete task:", e)
        return Response({
            "success": False,
            "message": "Task deletion failed",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view
@jwt_authentication
def get_all_tasks(request):
    try:
        data = request.data
        workspaceId = data.get('workspaceId')
        workspace = Workspace.objects.filter(workspaceId=workspaceId)
        if not workspace:
            return Response({"success":False, "message":"Workspace doesnt exists", "payload":{}}, status=drf_status.HTTP_404_NOT_FOUND)
        tasks = Tasks.objects.filter(workspaceId=workspace)
        return Response({"success":True, "message":"Tasks fetched successfully", "payload":{tasks:tasks}},status=drf_status.HTTP_201_CREATED)
    except Exception as e:
        print("Some error occured while fetching all the tasks.!", e)
        return Response({"success":False,"message":"Tasks fetched failed", "payload":{}},status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)