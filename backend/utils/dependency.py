from fastapi import Depends, HTTPException, Cookie
from utils.jwt import verify_token
from db import users_collection  # ← import this

def get_current_user(access_token: str = Cookie(default=None)):
    try:
        print(f"GET_CURRENT_USER called - access_token: {access_token}")
        if not access_token:
            print("No token found in cookie")
            raise HTTPException(
                status_code=401,
                detail="Not authenticated"
            )

        payload = verify_token(access_token)
        email = payload.get("sub")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = users_collection.find_one(
            {"email": email},
            {"_id": 0, "password": 0}  # exclude sensitive fields
        )

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        print("USER FROM DB:", user)
        return user

    except HTTPException:
        raise
    except Exception as e:
        print("AUTH ERROR:", str(e))
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )