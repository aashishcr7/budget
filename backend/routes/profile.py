# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends
from utils.dependency import get_current_user
from db import users_collection

router = APIRouter()

@router.get("/profile")
def get_profile(user=Depends(get_current_user)):
    user_data = users_collection.find_one(
        {"email": user["email"]},
        {"password": 0}
    )

    if user_data and "_id" in user_data:
        user_data["created_at"] = user_data["_id"].generation_time.isoformat()
        user_data["_id"] = str(user_data["_id"])

    return user_data

@router.put("/profile")
def update_profile(data: dict, user=Depends(get_current_user)):
    users_collection.update_one(
        {"email": user["email"]},
        {"$set": {
            "fname": data["fname"],
            "lname": data["lname"]
        }}
    )

    return {
        "message": "Profile updated successfully"
    }