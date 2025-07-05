from rest_framework.response import Response
from api.utils.jwt_utils import verify_token
from api.models.user import User
from rest_framework import status as drf_status
from api.serializers.user_serializer import UserSerializer
from django.conf import settings

def jwt_authentication(view_func):
    def wrapper(request, *args, **kwargs):
        secret = request.GET.get("secret") or request.POST.get("secret") or request.headers.get("Secret")
        print_mode = request.GET.get("print") == "true" or request.POST.get("print") == "true"
        if print_mode and secret and secret == getattr(settings, "PRINT_SECRET", None):
            request.user = None
            request.user_id = None
            return view_func(request, *args, **kwargs)
        
        auth_headers = request.headers.get('Authorization')
        if not auth_headers or not auth_headers.startswith("Bearer "):
            print("Missing or malformed auth header")
            return Response({"success": False, "message": "Auth header missing"}, status=drf_status.HTTP_400_BAD_REQUEST)
        
        token = auth_headers.split(" ")[1]
        user_id = verify_token(token, token_type="access")

        if user_id in [None, "expired"]:
            print(f"Invalid or expired token: {token}")
            return Response({"success": False, "message": "Invalid token"}, status=drf_status.HTTP_401_UNAUTHORIZED)
        
        try:
            user = User.objects.get(userId=user_id)
            user_serialized = UserSerializer(user).data
            print("User_serialized : ", user_serialized)
            
            request.user = user
            request.user_id = user_id
            
            print("User (middleware): ", user)
            print("User ID from token:", user_id)
            
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found"}, status=drf_status.HTTP_404_NOT_FOUND)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper