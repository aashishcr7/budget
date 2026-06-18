import os
import json
from dotenv import load_dotenv

load_dotenv()

UPSTASH_URL = os.getenv("UPSTASH_REDIS_REST_URL")
UPSTASH_TOKEN = os.getenv("UPSTASH_REDIS_REST_TOKEN")

if UPSTASH_URL and UPSTASH_TOKEN:
    #Production (Vercel + Upstash)
    from upstash_redis import Redis
    r= Redis(url=UPSTASH_URL, token=UPSTASH_TOKEN)

else:
    #Local Development (Docker + Redis)
    import redis
    r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def get_cache(key:str) -> dict:
    cached = r.get(key)
    if cached:
        return json.loads(cached)
    return None

def set_cache(key:str, value:dict, ttl:int=3600):
    """
    Set a value in the cache with an optional TTL (default: 1 hour).
    """
    r.setex(key,ttl, json.dumps(value),)