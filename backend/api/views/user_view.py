import bcrypt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status as drf_status
from api.models.user import User
from api.utils.jwt_utils import generate_token,verify_token
from api.middlewares.auth_middleware import jwt_authentication
from django.conf import settings
import traceback
from api.serializers.user_serializer import UserSerializer
from api.models.team_members import TeamMembers
from api.models.notifications import Notifications
from api.utils.user_utils import is_user_admin

@api_view(["POST"])
def register(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    try:

        if User.objects.filter(email=email).exists():
            return Response({"success":False, "message":"Email already registered!"}, status=drf_status.HTTP_400_BAD_REQUEST)
        
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        user = User.objects.create(name=name, email=email, password=hashed_password)

        print('User created : ',user)
        print("Generating tokens...")

        tokens = generate_token(user.userId)
        payload = {"access_token":tokens['access_token']}

        res = Response({"success":True, "message":"Registration successful!","payload":payload}, status=drf_status.HTTP_200_OK)

        res.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=settings.COOKIE_SETTINGS['httponly'],
            secure=settings.COOKIE_SETTINGS['secure'],
            samesite=settings.COOKIE_SETTINGS['samesite'],
            max_age=settings.COOKIE_SETTINGS['max_age']
        )

        team_members = TeamMembers.objects.filter(email=email, userId__isnull=True)
        for tm in team_members:
            tm.userId = user
        TeamMembers.objects.bulk_update(team_members, ['userId'])

        notifications = Notifications.objects.filter(to_email=email, toUser__isnull=True)
        for notif in notifications:
            notif.toUser = user
        Notifications.objects.bulk_update(notifications, ['toUser'])

        return res
    except Exception as e:
        print("Error :", e)
        traceback.print_exc()
        print("Failed to create user")
        return Response({"success":False, "message":"Failed to create user","payload":None}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login(request):
    data=request.data
    email=data.get('email')
    password=data.get('password')

    try:
        user = User.objects.get(email=email)
    except:
        return Response({"success":False, "message":"Invalid credentials"}, status=drf_status.HTTP_401_UNAUTHORIZED)
    
    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return Response({"success":False, "message":"Invalid credentials"}, status=drf_status.HTTP_401_UNAUTHORIZED)
    
    tokens = generate_token(user.userId)
    payload = {"access_token":tokens['access_token']}
    res = Response({"success":True, "message":"Login successful", "payload":payload}, status=drf_status.HTTP_200_OK)
    
    res.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=settings.COOKIE_SETTINGS['httponly'],
        secure=settings.COOKIE_SETTINGS['secure'],
        samesite=settings.COOKIE_SETTINGS['samesite'],
        max_age=settings.COOKIE_SETTINGS['max_age'],
        path=settings.COOKIE_SETTINGS['path']
    )

    return res

@api_view(['POST'])
def logout(request):
    res = Response({"success":True, "message":"Logout successful"}, status=drf_status.HTTP_200_OK)
    res.delete_cookie("refresh_token")
    return res

@api_view(['POST'])
def refresh(request):
    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return Response({"success":False, "message":"Refresh token expired"}, status=drf_status.HTTP_400_BAD_REQUEST)
    
    user_id = verify_token(refresh_token, token_type="refresh")
    if user_id in [None, "expired"]:
        return Response({"success":False, "message":"Refresh token expired"}, status=drf_status.HTTP_401_UNAUTHORIZED)
    
    tokens = generate_token(user_id)
    payload = {"access_token":tokens['access_token']}

    res = Response({"success":True, "message":"Refreshing token", "payload":payload}, status=drf_status.HTTP_200_OK)

    res.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=settings.COOKIE_SETTINGS['httponly'],
        secure=settings.COOKIE_SETTINGS['secure'],
        samesite=settings.COOKIE_SETTINGS['samesite'],
        max_age=settings.COOKIE_SETTINGS['max_age']
    )
    return res

@api_view(['GET'])
@jwt_authentication
def get_user(request):
    try:
        user = User.objects.get(userId=request.user_id)
        user_data = UserSerializer(user).data
        return Response({
            "success": True, 
            "message": "User data found", 
            "payload": user_data
        }, status=drf_status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            "success": False, 
            "message": "User not found",
            "payload": {}
        }, status=drf_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_user: {e}")
        return Response({
            "success": False, 
            "message": "Something went wrong",
            "payload": {}
        }, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@jwt_authentication
def check_if_admin(request):
    try:
        workspace_id = request.data.get('workspaceId')
        is_admin = is_user_admin(request.user_id, workspace_id)

        return Response({"success": True,"message": "Success response admin/user","payload": {"admin": is_admin}}, status=drf_status.HTTP_200_OK)

    except Exception as e:
        print("Error checking admin:", e)
        return Response({"success": False,"message": "Can't find whether admin or user","payload": {"admin": False}}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
