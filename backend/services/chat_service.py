from langchain_google_genai import ChatGoogleGenerativeAI
from services.rag_service import get_context
from services.weather_service import get_weather
import os
from dotenv import load_dotenv

load_dotenv()

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.7
    )

def chat_with_ai(user_message: str, location: str):
    llm = get_llm()

    context = get_context(location)
    weather_info = get_weather(location)
    
    prompt = f"""
      You are a helpful travel assistant.

      Use the context below to answer the user's question. 
      Do not repeat the context in your answer.

      Context: {context}

      Weather: {weather_info}

        User's question: {user_message}
        Anser in helpful, short, and conventional way.

    """

    response = llm.invoke(prompt)

    return response.content
    
