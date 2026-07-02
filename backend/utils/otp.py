import random
import string
from datetime import datetime, timedelta
from db import otps_collection

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

def create_otp_for_user(email:str):
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    otps_collection.update_one(
        {"email": email},{"$set":{
            "otp":otp,
            "expires_at":expires_at,
            "attempts":0
        }},
        upsert=True
    )
    return otp