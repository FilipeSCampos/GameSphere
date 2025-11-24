import httpx
from app.core.config import settings
from typing import Dict, Any, Optional

class RawgService:
    BASE_URL = "https://api.rawg.io/api"

    def __init__(self):
        self.api_key = settings.RAWG_API_KEY
        if not self.api_key:
            print("WARNING: RAWG_API_KEY is not set!")

    async def search_games(self, query: str, page_size: int = 5) -> Dict[str, Any]:
        """
        Search for games using the RAWG API.
        """
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.BASE_URL}/games",
                    params={
                        "key": self.api_key,
                        "search": query,
                        "page_size": page_size,
                        "search_precise": True,
                        "ordering": "-rating"
                    }
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                print(f"Error calling RAWG API: {e}")
                return {"results": []}
            except Exception as e:
                print(f"Unexpected error: {e}")
                return {"results": []}

rawg_service = RawgService()
