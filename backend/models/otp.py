from pydantic import BaseModel

class OtpVerify(BaseModel):
   email: str
   otp: str