from pydantic import BaseModel

class OtpVerify(BaseModel):
   email: str
   otp: str

class ForgetPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str