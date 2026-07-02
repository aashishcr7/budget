import os
import requests
from dotenv import load_dotenv


load_dotenv()

def send_otp_email(to_email: str, otp: str):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": os.getenv("BREVO_API_KEY"),
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": "Trip Planner", "email": "ashishsinghcr07@gmail.com"},
        "to": [{"email": to_email}],
        "subject": "Your verification code",
        "htmlContent": f"<p>Your OTP is <strong>{otp}</strong>. It expires in 10 minutes.</p>"
    }
    print("DEBUG - API key loaded:", repr(os.getenv("BREVO_API_KEY")))
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 201:
        raise Exception(f"Failed to send email: {response.text}")
    return response.json()