import os
import json
import re
from unittest import result
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from services.rag_service import get_context
from services.weather_service import get_weather
from utils.cache import set_cache, get_cache

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

    #Cache check
    cache_key = f"trip:{location.lower().strip()}:{days}:{budget}:{travel_type}"
    cached_result = get_cache(cache_key)
    if cached_result:
        print(f"Cache hit for {cache_key}")
        return cached_result
    
    print(f"Cache miss for {cache_key}. Generating itinerary...")

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
            result = _parse_json(response.content)
            set_cache(cache_key, result)  # ← Store in cache

            return result
        except json.JSONDecodeError as e:
            last_error = e
            if attempt < retries:
                prompt += "\n\nIMPORTANT: Return raw JSON only. No markdown. No extra text."
        except Exception as e:
            # Handle quota/rate limit error gracefully
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                raise RuntimeError("Our AI service is temporarily unavailable due to high demand. Please try again in a few minutes.") from e
            raise RuntimeError(f"LLM call failed: {e}") from e

    raise ValueError(f"Could not parse JSON after {retries + 1} attempts: {last_error}")

def generate_recommendations(user_past_trips: list, user_id: str) -> dict:

    #Check cache first
    cache_key = f"recommendations: {user_id}"
    cached = get_cache(cache_key)
    if cached:
        print(f"Cache hit: {cache_key}")
        return cached
    
    print(f"Cache MISS: {cache_key}")
    """
    Generate personalized trip recommendations based on user's past trips.
    
    Args:
        user_past_trips: List of user's previous trips
    
    Returns:
        dict with recommended destinations and trip types
    """
    if not user_past_trips:
        return {
            "recommendations": []
        }

    # Summarize past trips
    trips_summary = []
    trip_types_done = set()
    
    for trip in user_past_trips[-10:]:  # Last 10 trips
        trips_summary.append({
            "location": trip.get("destination", {}).get("city", "Unknown"),
            "type": trip.get("trip_type", "general"),
        })
        trip_types_done.add(trip.get("trip_type", "general"))

    trips_json = json.dumps(trips_summary)
    
    prompt = f"""You are a smart travel recommendation engine. Based on the user's travel history, recommend 5 unique destinations they should visit next.

User's Past Trips:
{trips_json}

Trip types already explored: {', '.join(trip_types_done)}

Requirements:
1. Suggest NEW destinations they haven't visited (not in the list above)
2. Recommend trip types they haven't tried yet, or variations of ones they have
3. Consider similar climates or vibes to trips they enjoyed
4. Give specific reasons why each destination matches their profile

Return ONLY valid JSON, no markdown, no extra text:
{{
  "recommendations": [
    {{
      "destination": "destination name",
      "reason": "why this matches their travel style",
      "suggested_trip_type": "adventure|relaxation|culture|family|luxury",
    }}
  ]
}}"""

    try:
        response = _llm.invoke(prompt)
        result = _parse_json(response.content)
        set_cache(cache_key, result, ttl=86400)
        return result
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        # Return default recommendations if LLM fails
        return {
            "recommendations": [
                {
                    "destination": "Tokyo",
                    "reason": "A vibrant cultural experience",
                    "suggested_trip_type": "culture",
                },
                {
                    "destination": "Maldives",
                    "reason": "Perfect for a relaxing getaway",
                    "suggested_trip_type": "relaxation",
                }
            ]
        }