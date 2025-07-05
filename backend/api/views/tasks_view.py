from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.middlewares.auth_middleware import jwt_authentication
from datetime import datetime
from api.models.tasks import Tasks
import uuid
from api.models.workspace import Workspace
from api.models.user import User
from api.serializers.task_serializer import TaskSerializer, TaskSerializerDetailed
from api.models.team_members import TeamMembers
from django.utils import timezone
import asyncio
from playwright.async_api import async_playwright
from django.http import StreamingHttpResponse
import os

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

        task.updated_at = timezone.now()
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
    
@api_view(['POST'])
@jwt_authentication
def get_all_tasks(request):
    try:
        data = request.data
        workspaceId = data.get('workspaceId')
        workspace = Workspace.objects.filter(workspaceId=workspaceId).first()
        if not workspace:
            return Response({"success":False, "message":"Workspace doesnt exists", "payload":{}}, status=drf_status.HTTP_404_NOT_FOUND)
        tasks = Tasks.objects.filter(workspaceId=workspace)
        serialized_tasks = TaskSerializer(tasks, many=True)
        return Response({"success":True, "message":"Tasks fetched successfully", "payload":{"tasks":serialized_tasks.data}},status=drf_status.HTTP_201_CREATED)
    except Exception as e:
        print("Some error occured while fetching all the tasks.!", e)
        return Response({"success":False,"message":"Tasks fetched failed", "payload":{}},status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def check_user_elgible(workspaceId, userId):
    teamMember = TeamMembers.objects.get(workspaceId=workspaceId, userId=userId)
    if teamMember.status=="accepted":
        return True
    else:
        return False


@api_view(['POST'])
@jwt_authentication
def detail_task(request):
    try:
        data = request.data
        userId = request.user_id
        taskId = data.get('task_id')
        workspaceId = data.get('workspaceId')
        is_valid = check_user_elgible(workspaceId, userId)

        if not is_valid:
            return Response({"success":False, "message":"User not authorized to get the data!", "payload":{}})
        
        task = Tasks.objects.filter(task_id=taskId).first()
        serialized_task_detailed = TaskSerializerDetailed(task)
        if not task:
            return Response({"success":False, "message":"Task doesnt exist", "payload":{}})

        return Response({"success":True, "message":"Detailed task found", "payload":{"task_detail":serialized_task_detailed.data}}, status=drf_status.HTTP_200_OK)

    except Exception as e:
        print("Some error occured while fetching the detailed task data : ",e)
        return Response({"success":False, "message":"Failed fetching detailed task", "payload":{}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

import os
import asyncio
from playwright.async_api import async_playwright

async def generate_pdf_nextjs_optimized_final(url, path, cookies):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        await context.add_cookies(cookies)
        page = await context.new_page()

        await page.goto(url, wait_until='networkidle')
        await page.wait_for_function("() => window.isPageReady === true", timeout=15000)
        await page.wait_for_timeout(2000)

        # Inject custom CSS to override layout issues
        await page.add_style_tag(content="""
            #__next {
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
            }
            html, body {
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
            }
            main, .main, [role="main"] {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
                overflow: visible !important;
            }
            .flex, .d-flex, [class*="flex"] {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
            }
            .grid, .d-grid, [class*="grid"] {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
            }
            .container, .container-fluid, [class*="container"] {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
                overflow: visible !important;
            }
            .h-screen, .min-h-screen, .max-h-screen {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
            }
            .overflow-hidden, .overflow-x-hidden, .overflow-y-hidden {
                overflow: visible !important;
            }
            [class*="board"], [class*="kanban"], [class*="task"] {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
                overflow: visible !important;
            }
            [class*="card"], [class*="task"], [class*="item"] {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        """)

        # Scroll page to ensure full render
        await page.evaluate("""
            () => {
                return new Promise(async (resolve) => {
                    await new Promise(r => setTimeout(r, 1000));
                    let lastHeight = 0;
                    let stableCount = 0;
                    while (stableCount < 3) {
                        const currentHeight = Math.max(
                            document.body.scrollHeight,
                            document.documentElement.scrollHeight
                        );
                        if (currentHeight === lastHeight) {
                            stableCount++;
                        } else {
                            stableCount = 0;
                            lastHeight = currentHeight;
                        }
                        window.scrollTo(0, currentHeight);
                        await new Promise(r => setTimeout(r, 200));
                        window.scrollTo(0, 0);
                        await new Promise(r => setTimeout(r, 200));
                    }
                    window.scrollTo(0, 0);
                    resolve();
                });
            }
        """)

        # Compute full content height
        content_height = await page.evaluate("""
            () => {
                return Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );
            }
        """)

        print(f"Content height: {content_height}px")

        await page.set_viewport_size({
            "width": 1280,
            "height": max(content_height, 1024)
        })

        await page.wait_for_timeout(1000)
        await page.screenshot(path="/tmp/debug-nextjs-final.png", full_page=True)
        print("Screenshot saved: /tmp/debug-nextjs-final.png")

        await page.pdf(
            path=path,
            format="A4",
            landscape=True,
            print_background=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            prefer_css_page_size=True,
            display_header_footer=False
        )

        print(f"PDF generated successfully: {path}")
        await browser.close()
        return True
    
@api_view(['POST'])
@jwt_authentication
def export_pdf(request):
    data = request.data
    workspace_id = data.get('workspaceId')
    user_id = request.user_id

    is_member = TeamMembers.objects.filter(userId=user_id, workspaceId=workspace_id).first()
    if not is_member or is_member.status != "accepted":
        return Response({"success": False, "message": "Unauthorized"}, status=401)

    token = request.COOKIES.get("access_token")
    cookies = [{
        "name": "access_token",
        "value": token,
        "domain": "localhost",
        "path": "/",
        "httpOnly": False,
        "secure": False
    }]

    base_url = "http://localhost:3000"
    secret = os.getenv("PRINT_SECRET")
    url = f"{base_url}/workspace/{workspace_id}?print=true&secret={secret}"
    pdf_path = f"/tmp/kanban-{workspace_id}.pdf"

    try:
        success = asyncio.run(generate_pdf_nextjs_optimized_final(url, pdf_path, cookies))

        if success and os.path.exists(pdf_path):
            file_handle = open(pdf_path, 'rb')
            response = StreamingHttpResponse(file_handle, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="kanban-{workspace_id}.pdf"'
            response['Content-Length'] = os.path.getsize(pdf_path)
            return response
        else:
            return Response({"success": False, "message": "PDF generation failed"}, status=500)

    except Exception as e:
        print("PDF generation error:", e)
        return Response({"success": False, "message": str(e)}, status=500)