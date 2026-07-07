import os

from fastapi import APIRouter, HTTPException, Depends
from db import users_collection, otps_collection
from utils.hash import hash_password, verify_password
from utils.jwt import create_token, verify_token
from models.user import UserSignup, UserLogin
from utils.dependency import get_current_user
from fastapi.responses import JSONResponse
from utils.otp import create_otp_for_user
from utils.email import send_otp_email
from models.otp import ForgetPasswordRequest, OtpVerify, ResetPasswordRequest
from datetime import datetime


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
        "is_verified": False  # Add the is_verified field and set it to False
    })

    otp = create_otp_for_user(user.email)
    send_otp_email(user.email, otp)  # Send the OTP email

    print(f"OTP for {user.email}: {otp}")

    return {"message": "User created. OTP send to email"}


@router.post("/verify-otp")
def verify_otp(data: OtpVerify):
    record = otps_collection.find_one({"email": data.email})

    if not record:
        raise HTTPException(status_code=400, detail="No OTP requested or it has expired. Please request a new one.")

    if record.get("attempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new OTP.")

    if datetime.utcnow() > record["expires_at"]:
        otps_collection.delete_one({"email": data.email})
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    if record["otp"] != data.otp:
        otps_collection.update_one({"email": data.email}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid OTP")

    users_collection.update_one({"email": data.email}, {"$set": {"is_verified": True}})
    otps_collection.delete_one({"email": data.email})

    return {"message": "Email verified successfully. You can now log in."}

@router.post("/forget-password")
def forget_password(data: ForgetPasswordRequest):
    db_user = users_collection.find_one({"email": data.email})
    if not db_user:
        # Don't reveal whether the email exists - same message either way
        return {"message": "If that email is registered, a code has been sent."}
    
    otp = create_otp_for_user(data.email)
    send_otp_email(data.email,otp)
    return {"message": "If that email is registered, a code has been sent"}

@router.post("/verify-reset-otp")
def verify_reset_otp(data: OtpVerify):
    record = otps_collection.find_one({"email": data.email})

    if not record:
        raise HTTPException(status_code=400, detail="No OTP requested or it has expired.")
    if record.get("attempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many incorrect attempts.")
    if datetime.utcnow() > record["expires_at"]:
        otps_collection.delete_one({"email": data.email})
        raise HTTPException(status_code=400, detail="OTP expired.")
    if record["otp"] != data.otp:
        otps_collection.update_one({"email": data.email}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Invalid OTP")

    otps_collection.delete_one({"email": data.email})

    # ↓↓↓ THIS is the line you're asking about ↓↓↓
    reset_token = create_token(
        {"sub": data.email, "purpose": "password_reset"},
        expires_minutes=10
    )
    return {"reset_token": reset_token}

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    try:
        payload = verify_token(data.reset_token)
    except JWTError:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired.")

    if payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid token for this action.")

    email = payload.get("sub")
    hashed = hash_password(data.new_password)
    users_collection.update_one({"email": email}, {"$set": {"password": hashed}})

    return {"message": "Password reset successfully. You can now log in."}

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not db_user.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Email not verified")

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
