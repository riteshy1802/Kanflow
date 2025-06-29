import jwt
import datetime
from datetime import timezone
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET=os.getenv("JWT_SECRET")
JWT_ALGORITHM=os.getenv("JWT_ALGORITHM")
ACCESS_EXPIRES=int(os.getenv("JWT_ACCESS_EXPIRES_IN"))
REFRESH_EXPIRES = int(os.getenv("JWT_REFRESH_EXPIRES_IN"))

def generate_token(user_id):
    now = datetime.datetime.now(datetime.timezone.utc)

    access_payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": now + datetime.timedelta(seconds=ACCESS_EXPIRES),
        "iat": now
    }

    refresh_payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": now + datetime.timedelta(seconds=REFRESH_EXPIRES),
        "iat": now
    }

    access_token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

def verify_token(token, token_type="access"):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            leeway=datetime.timedelta(seconds=15)
        )
        if payload["type"] != token_type:
            return None
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        return "expired"
    except jwt.InvalidTokenError:
        return None
