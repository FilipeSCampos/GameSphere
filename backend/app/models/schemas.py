from typing import List, Optional
from pydantic import BaseModel

class SystemRequirements(BaseModel):
    minimum: Optional[str] = None
    recommended: Optional[str] = None

class ParsedRequirements(BaseModel):
    cpu: Optional[str] = None
    gpu: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    os: Optional[str] = None

class Game(BaseModel):
    id: int
    name: str
    description_raw: Optional[str] = None
    released: Optional[str] = None
    background_image: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None
    metacritic: Optional[int] = None
    playtime: Optional[int] = None
    platforms: Optional[List[dict]] = None
    genres: Optional[List[dict]] = None
    developers: Optional[List[dict]] = None
    publishers: Optional[List[dict]] = None
    
    # Custom fields for our dashboard
    parsed_requirements_min: Optional[ParsedRequirements] = None
    parsed_requirements_rec: Optional[ParsedRequirements] = None
