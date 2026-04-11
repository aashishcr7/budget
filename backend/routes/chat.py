from fastapi import APIRouter, Depends
from utils.dependency import get_current_user
from models.chat import ChatRequest
from services.chat_service import chat_with_ai

router = APIRouter()

@router.post("/chat")
def chat(request: ChatRequest, user=Depends(get_current_user)):
    response = chat_with_ai(request.message, request.location)
    return {"response": response}
  