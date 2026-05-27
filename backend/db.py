from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsAllowInvalidCertificates=False
)
db = client["budget_planner"]
users_collection = db["users"]
trips_collection = db["trips"]
