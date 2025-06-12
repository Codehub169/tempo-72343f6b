from sqlalchemy.orm import Session
from . import models, schemas
from typing import List

def get_score(db: Session, score_id: int) -> models.Score | None:
    """Fetches a single score by its ID."""
    return db.query(models.Score).filter(models.Score.id == score_id).first()

def get_scores(db: Session, skip: int = 0, limit: int = 10) -> List[models.Score]:
    """Fetches a list of scores, sorted by score descending, then created_at ascending for tie-breaking, with pagination."""
    return db.query(models.Score).order_by(models.Score.score.desc(), models.Score.created_at.asc()).offset(skip).limit(limit).all()

def create_score(db: Session, score: schemas.ScoreCreate) -> models.Score:
    """Creates a new score entry in the database."""
    db_score = models.Score(
        player_name=score.player_name,
        score=score.score
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score
