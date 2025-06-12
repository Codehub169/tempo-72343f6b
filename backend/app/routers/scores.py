from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from .. import crud, models, schemas # models import useful if crud functions return model instances directly sometimes
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Score, status_code=201)
def create_score_endpoint(score: schemas.ScoreCreate, db: Session = Depends(get_db)):
    """
    Creates a new score entry in the database.
    The frontend will send player_name and score.
    """
    # Pydantic in schemas.ScoreCreate already handles basic validation (e.g., type, max_length for player_name)
    # Additional business logic validation can be added here if needed.
    # Example: if score.score < 0: raise HTTPException(status_code=400, detail="Score cannot be negative.")
    # This is handled by ge=0 in ScoreBase schema.
    
    # For player_name, Pydantic's default for non-optional fields means it's required.
    # schemas.ScoreCreate has player_name: str = Field(..., max_length=15)
    # An empty string might pass if not for min_length constraint in schema. Pydantic handles this if min_length is set.

    created_score = crud.create_score(db=db, score=score)
    if not created_score:
        # This case might not be reachable if create_score always succeeds or raises its own HTTPExceptions
        # (e.g. due to database integrity errors that SQLAlchemy might raise).
        # However, it's a safeguard for unexpected behavior in crud.create_score.
        raise HTTPException(status_code=500, detail="Failed to create score due to an internal error.")
    return created_score

@router.get("/", response_model=List[schemas.Score])
def read_scores_endpoint(skip: int = Query(0, ge=0), limit: int = Query(10, gt=0, le=100), db: Session = Depends(get_db)):
    """
    Retrieves a list of scores, typically top scores.
    Sorted by score (descending) and then by creation date (ascending for tie-breaking).
    Default limit is 10, max is 100. Skip must be non-negative.
    """
    # FastAPI's Query with ge, gt, le handles validation for skip and limit.
    # The original manual checks are now handled by Query parameters.
    # if limit <= 0:
    #     limit = 10 # Default to 10 if invalid limit provided - Handled by Query(default=10, gt=0)
    # if limit > 100: # Cap the limit to prevent excessive data retrieval
    #     limit = 100 - Handled by Query(le=100)
        
    scores = crud.get_scores(db, skip=skip, limit=limit)
    return scores
