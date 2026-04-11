import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import json
from services.rag_service import get_context
from services.weather_service import get_weather


load_dotenv()



def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.7,
        request_timeout=30
    )


def generate_itinerary(location: str, days: int, budget: int):
    llm = get_llm()

    
        # 🔥 GET CONTEXT (RAG)
    context = get_context(location)
    weather = get_weather(location)

    final_context = f"""
            Context:
            {context}

            Real time weather info:
            {weather}
        """

    prompt = f"""
You are a smart travel planner.

Use the provided context as guidance, but you can also use your general knowledge to create a complete and engaging itinerary.
DO NOT COPY or REPEAT the context in the ouput.

DO NOT invent unrealistic places or false facts.

Use WEATHER information to adjust the plan:
-Avoid heat in afternoon if it's hot
-Prefer indoor activities if it's raining


Make the itinerary:
- practical
- budget-friendly
- realistic
- enjoyable

Context:
{final_context}

Return ONLY valid JSON:
{{
  "trip": [
    {{
      "day": 1,
      "title": "...",
      "activities": ["...", "..."],
      "budget": 1000
    }}
  ]
}}

Location: {location}
Days: {days}
Budget: {budget}
"""

    response = llm.invoke(prompt)
    text = response.content

        # 🔥 REMOVE ```json ``` wrapper
    text = text.replace("```json", "").replace("```", "").strip()

        
    return json.loads(text)  # ✅ convert string → JSON
     
  