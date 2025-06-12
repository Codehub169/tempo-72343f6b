from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# Base schema for score, common fields
class ScoreBase(BaseModel):
    player_name: str = Field(..., max_length=15, description="Player's name (max 15 characters)")
    score: int = Field(..., ge=0, description="Player's score (must be non-negative)")

# Schema for creating a new score (inherits from ScoreBase)
class ScoreCreate(ScoreBase):
    pass

# Schema for reading a score (includes fields from DB like id and created_at)
class Score(ScoreBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True # Enables Pydantic to work with ORM models
