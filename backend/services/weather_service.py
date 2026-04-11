import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather(location: str):
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={API_KEY}&units=metric"
        response = requests.get(url)

        if response.status_code != 200:
            return "Sorry, I couldn't fetch the weather information right now."
        
        data = response.json()

        description = data["weather"][0]["description"]
        temp_c = data["main"]["temp"]

        return f"The current weather in {location} is {description} with a temperature of {temp_c}°C."
    
    
    except Exception as e:
        print(f"Weather API Error: {e}")
        return "Weather data not available at the moment."