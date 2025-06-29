from rest_framework.response import Response
from api.utils.jwt_utils import verify_token

def jwt_authentication(view_func):
    def wrapper(request, *args, **kwargs):
        auth_headers = request.headers.get('Authorization')

        if not auth_headers or not auth_headers.startswith("Bearer "):
            print("Missing or malformed auth header")
            return Response({"success": False, "message": "Auth header missing"}, status=401)
        
        token = auth_headers.split(" ")[1]
        user_id = verify_token(token, token_type="access")

        if user_id in [None, "expired"]:
            print(f"Invalid or expired token: {token}")
            return Response({"success": False, "message": "Invalid token"}, status=401)
        print("User ID from token:", user_id)
        request.user_id = user_id
        return view_func(request, *args, **kwargs)
    
    return wrapper
