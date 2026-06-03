import os
from dotenv import load_dotenv
from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.trip import router as trip_router
from routes.profile import router as profile_router
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS").split(","),  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trip_router)
app.include_router(profile_router)
