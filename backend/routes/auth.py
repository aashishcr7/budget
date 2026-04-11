import token

from fastapi import APIRouter, HTTPException, Depends
from db import users_collection
from utils.hash import hash_password, verify_password
from utils.jwt import create_token
from models.user import UserSignup, UserLogin
from utils.dependency import get_current_user

router = APIRouter()



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
def login(user:UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_token({"sub": user.email})
    return {
        "access_token": token,
        "user": {
            "email": db_user["email"],
            "fname": db_user["fname"],
            "lname": db_user["lname"]
        }
    }
@router.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
            "message": "You are authorized",
            "user":user
            }
