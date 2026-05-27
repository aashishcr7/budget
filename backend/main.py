from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.trip import router as trip_router
from routes.profile import router as profile_router
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.crypto_chat import router as crypto_chat_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trip-planner-alpha-six.vercel.app/"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(trip_router)
app.include_router(profile_router)
app.include_router(chat_router)
