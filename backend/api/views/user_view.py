import bcrypt
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from api.models.user import User
from api.utils.jwt_utils import generate_token,verify_token
from api.middlewares.auth_middleware import jwt_authentication
from django.conf import settings
import traceback
from rest_framework.permissions import IsAuthenticated
from api.serializers.user_serializer import UserSerializer

@api_view(["POST"])
def register(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    try:

        if User.objects.filter(email=email).exists():
            return Response({"success":False, "message":"Email already registered!"}, status=status.HTTP_400_BAD_REQUEST)
        
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

        user = User.objects.create(name=name, email=email, password=hashed_password)

        print('User created : ',user)
        print("Generating tokens...")

        tokens = generate_token(user.userId)
        payload = {"access_token":tokens['access_token']}

        res = Response({"success":True, "message":"Registration successful!","payload":payload}, status=status.HTTP_200_OK)

        res.set_cookie(
            key="refresh_token",
            value=tokens["refresh_token"],
            httponly=settings.COOKIE_SETTINGS['httponly'],
            secure=settings.COOKIE_SETTINGS['secure'],
            samesite=settings.COOKIE_SETTINGS['samesite'],
            max_age=settings.COOKIE_SETTINGS['max_age']
        )

        return res
    except Exception as e:
        print("Error :", e)
        traceback.print_exc()
        print("Failed to create user")
        return Response({"success":False, "message":"Failed to create user","payload":None}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login(request):
    data=request.data
    email=data.get('email')
    password=data.get('password')

    try:
        user = User.objects.get(email=email)
    except:
        return Response({"success":False, "message":"Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return Response({"success":False, "message":"Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
    tokens = generate_token(user.userId)
    payload = {"access_token":tokens['access_token']}
    res = Response({"success":True, "message":"Login successful", "payload":payload}, status=status.HTTP_200_OK)
    
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
    res = Response({"success":True, "message":"Logout successful"}, status=status.HTTP_200_OK)
    res.delete_cookie("refresh_token")
    return res

@api_view(['POST'])
def refresh(request):
    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return Response({"success":False, "message":"No refresh token found"}, status=status.HTTP_400_BAD_REQUEST)
    
    user_id = verify_token(refresh_token, token_type="refresh")
    if user_id in [None, "expired"]:
        return Response({"success":False, "message":"Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
    
    tokens = generate_token(user_id)
    payload = {"access_token":tokens['access_token']}

    res = Response({"success":True, "message":"Refreshing token", "payload":payload}, status=status.HTTP_200_OK)

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
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            "success": False, 
            "message": "User not found",
            "payload": {}
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_user: {e}")
        return Response({
            "success": False, 
            "message": "Something went wrong",
            "payload": {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)