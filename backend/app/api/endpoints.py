from fastapi import APIRouter, HTTPException, Query
import requests
from app.core.config import settings
from app.models.schemas import Game, ParsedRequirements
from app.core.parser import parse_requirements
from app.services.rawg_service import rawg_service
import json
import redis

router = APIRouter()

# Initialize Redis
try:
    r = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Warning: Redis connection failed: {e}")
    r = None

RAWG_BASE_URL = "https://api.rawg.io/api"

@router.get("/search")
async def search_games(query: str = Query(..., min_length=1)):
    """
    Search for games with autocomplete suggestions.
    """
    if not query:
        return {"results": []}
    
    data = await rawg_service.search_games(query, page_size=5)
    
    # Simplify the response for autocomplete
    suggestions = []
    for game in data.get("results", []):
        suggestions.append({
            "id": game.get("id"),
            "name": game.get("name"),
            "slug": game.get("slug"),
            "background_image": game.get("background_image"),
            "rating": game.get("rating"),
            "released": game.get("released")
        })
    
    return {"results": suggestions}

@router.get("/game/{game_name}", response_model=Game)
async def get_game_details(game_name: str):
    """
    Fetch game details from RAWG, parse system requirements, and return aggregated data.
    """
    if not settings.RAWG_API_KEY:
        raise HTTPException(status_code=500, detail="RAWG API Key not configured")

    # Check cache
    cache_key = f"game:{game_name}"
    if r:
        try:
            cached_data = r.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            print(f"Redis cache read failed: {e}")

    # Fetch from RAWG
    # First search for the game to get the ID/slug
    search_url = f"{RAWG_BASE_URL}/games"
    params = {
        "key": settings.RAWG_API_KEY,
        "search": game_name,
        "page_size": 1
    }
    
    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        if not data["results"]:
            raise HTTPException(status_code=404, detail="Game not found")
            
        game_slug = data["results"][0]["slug"]
        
        # Get detailed info
        detail_url = f"{RAWG_BASE_URL}/games/{game_slug}"
        detail_response = requests.get(detail_url, params={"key": settings.RAWG_API_KEY})
        detail_response.raise_for_status()
        game_data = detail_response.json()
        
        # Parse requirements
        platforms = game_data.get("platforms", [])
        pc_requirements = {}
        
        for p in platforms:
            if p["platform"]["slug"] == "pc":
                pc_requirements = p.get("requirements", {})
                break
        
        parsed_min = parse_requirements(pc_requirements.get("minimum", ""))
        parsed_rec = parse_requirements(pc_requirements.get("recommended", ""))
        
        # Construct response
        game_obj = Game(
            id=game_data["id"],
            name=game_data["name"],
            description_raw=game_data.get("description_raw"),
            released=game_data.get("released"),
            background_image=game_data.get("background_image"),
            website=game_data.get("website"),
            rating=game_data.get("rating"),
            metacritic=game_data.get("metacritic"),
            playtime=game_data.get("playtime"),
            platforms=game_data.get("platforms"),
            genres=game_data.get("genres"),
            developers=game_data.get("developers"),
            publishers=game_data.get("publishers"),
            parsed_requirements_min=parsed_min,
            parsed_requirements_rec=parsed_rec
        )
        
        # Cache result (expire in 1 hour)
        if r:
            try:
                r.setex(cache_key, 3600, game_obj.json())
            except Exception as e:
                print(f"Redis cache write failed: {e}")
            
        return game_obj

    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error communicating with RAWG API: {str(e)}")
