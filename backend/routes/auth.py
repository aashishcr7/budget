import os

from fastapi import APIRouter, HTTPException, Depends
from db import users_collection
from utils.hash import hash_password, verify_password
from utils.jwt import create_token
from models.user import UserSignup, UserLogin
from utils.dependency import get_current_user
from fastapi.responses import JSONResponse

router = APIRouter()

IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"
SAMESITE = "none" if IS_PRODUCTION else "lax"

@router.post("/signup")
def signup(user:UserSignup):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    users_collection.insert_one({
        "email": user.email,
        "password": hashed_password,
        "fname": user.fname,
        "lname": user.lname,
    })

    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_token({"sub": user.email})

    response = JSONResponse({
        "user": {
            "email": db_user["email"],
            "fname": db_user["fname"],
            "lname": db_user["lname"]
        }
    })

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite=SAMESITE,
        max_age=3600,
        path="/",

    )

    return response

@router.post("/logout")
def logout():
    print("LOGOUT ENDPOINT CALLED")
    response = JSONResponse({"message": "Logged out successfully"})
    # Delete cookie by setting max_age to 0 (expires immediately)
    response.set_cookie(
        key="access_token",
        value="",
        path="/",
        httponly=True,
        secure=IS_PRODUCTION,
        samesite=SAMESITE,
        max_age=0,
    )
    print("COOKIE DELETION SET - Headers:", dict(response.headers))
    return response

@router.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
            "message": "You are authorized",
            "user":user
            }

@router.get("/me")
def get_current_user_info(user=Depends(get_current_user)):
    print("GET /me endpoint - User authenticated:", user)
    return {
        "authenticated": True,
        "user": user
    }
