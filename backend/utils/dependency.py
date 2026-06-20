from fastapi import Depends, HTTPException, Cookie
from utils.jwt import verify_token

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

        print("COOKIE TOKEN:", access_token)
        print("USER PAYLOAD:", payload)

        return payload

    except Exception as e:
        print("AUTH ERROR:", str(e))

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )