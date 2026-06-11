import os
import json
import re
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from services.rag_service import get_context
from services.weather_service import get_weather

load_dotenv()

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7,
    request_timeout=30,
)

TRAVEL_TYPE_PROMPTS = {
    "adventure":   "Focus on outdoor activities, trekking, water sports, and thrilling experiences. Prioritize active mornings.",
    "family":      "Include child-friendly activities, safe areas, comfortable stays, and early evenings. Avoid late nights.",
    "relaxation":  "Prioritize slow mornings, spas, lakeside cafes, scenic spots, and minimal rushing.",
    "culture":     "Focus on heritage sites, local cuisine, festivals, museums, temples, and authentic local experiences.",
    "luxury":    "Suggest sunset spots, candlelit restaurants, boat rides, and intimate experiences for couples.",
}


def _parse_json(text: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


def generate_itinerary(location: str, days: int, budget: int, travel_type: str = "general", retries: int = 2) -> dict:
    context = get_context(location, travel_type)
    weather = get_weather(location)

    travel_guidance = TRAVEL_TYPE_PROMPTS.get(
        travel_type,
        "Create a well-rounded general itinerary."
    )

    prompt = f"""You are a smart travel planner.

Travel style: {travel_type.upper()}
Style guidance: {travel_guidance}

Use the context below as guidance, supplemented by your general knowledge.
Do NOT copy or repeat context verbatim. Do NOT invent places or fabricate facts.
Adjust outdoor/indoor activities based on the weather info.

--- CONTEXT ---
{context}

--- REAL-TIME WEATHER ---
{weather}

--- REQUIREMENTS ---
Location: {location}
Days: {days}
Total budget (INR): {budget}
Travel type: {travel_type}

Return ONLY valid JSON, no markdown, no explanation:
{{
  "trip": [
    {{
      "day": 1,
      "title": "...",
      "activities": ["...", "..."],
      "budget": 1000
    }}
  ]
}}"""

    last_error = None
    for attempt in range(retries + 1):
        try:
            response = _llm.invoke(prompt)
            return _parse_json(response.content)
        except json.JSONDecodeError as e:
            last_error = e
            if attempt < retries:
                prompt += "\n\nIMPORTANT: Return raw JSON only. No markdown. No extra text."
        except Exception as e:
            raise RuntimeError(f"LLM call failed: {e}") from e

    raise ValueError(f"Could not parse JSON after {retries + 1} attempts: {last_error}")