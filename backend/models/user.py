from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    fname: str
    lname: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    profile_picture: str = None
    