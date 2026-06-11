from fastapi import APIRouter, Depends, HTTPException
from models.trip import TripCreate
from db import trips_collection
from utils.dependency import get_current_user
from datetime import datetime
from services.llm_service import (
    generate_itinerary,
)
from bson import ObjectId

router = APIRouter()

@router.post("/generate-trip")
def generate_trip(trip: TripCreate, user=Depends(get_current_user)):

    ai_itinerary = generate_itinerary(
        trip.location,
        trip.days,
        trip.budget,
        trip.trip_type
    )

    trip_data = {
        "user_email": user["sub"],

        "destination": {
            "city": trip.location,
            "full_location": trip.full_location,
            "country": trip.country,
            "lat": trip.lat,
            "lon": trip.lon,
        },

        "days": trip.days,
        "budget": trip.budget,
        "trip_type": trip.trip_type,

        "itinerary": ai_itinerary,
        "is_favourite": False,
    }

    result = trips_collection.insert_one(trip_data)

    return {
        "message": "Trip created",
        "trip_id": str(result.inserted_id),
        "itinerary": ai_itinerary,
    }

@router.get("/my-trips")
def get_my_trips(user=Depends(get_current_user)):
    user_email = user["sub"]
    trips = trips_collection.find({"user_email": user_email})

    result = []

    for trip in trips:
        result.append({
            "_id": str(trip["_id"]),

            "destination": trip.get("destination", {}),

            "days": trip["days"],
            "budget": trip["budget"],
            "trip_type": trip.get("trip_type"),

            "itinerary": trip["itinerary"],
            "user_email": trip["user_email"],
            "is_favourite": trip["is_favourite"]
        })

    return {
        "trips": result
    }

@router.get("/trip/{trip_id}")
def get_single_trip(trip_id: str, user=Depends(get_current_user)):
    trip = trips_collection.find_one({"_id": ObjectId(trip_id)})

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip["user_email"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    trip["_id"] = str(trip["_id"])

    return trip    



@router.delete("/trip/{trip_id}")
def delete_trip(trip_id: str, user=Depends(get_current_user)):

    # 🔒 Validate ID
    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")

    trip = trips_collection.find_one({"_id": ObjectId(trip_id)})

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip["user_email"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    trips_collection.delete_one({"_id": ObjectId(trip_id)})

    return {"message": "Trip Deleted Successfully"}

@router.put("/trip/{trip_id}/favourites")
def favourites_trip(trip_id:str, user=Depends(get_current_user)):
    trip = trips_collection.find_one({"_id":ObjectId(trip_id)})

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip["user_email"] != user["sub"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_value = not trip.get("is_favourite", False)
    
    trips_collection.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": {"is_favourite": new_value}}
    )

    return {"is_favourite": new_value}