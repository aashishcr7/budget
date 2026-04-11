from pydantic import BaseModel

class TripCreate(BaseModel):
    location: str
    days: int
    budget: int