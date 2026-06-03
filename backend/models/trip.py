from pydantic import BaseModel
from typing import Optional

class TripCreate(BaseModel):
    location: str
    full_location: Optional[str] = None
    country: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

    days: int
    budget: int
    trip_type: Optional[str] = None