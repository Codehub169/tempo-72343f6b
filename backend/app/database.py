import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# Use DATABASE_URL from environment or default to a local SQLite file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./snake_game.db")

# Create SQLAlchemy engine
# For SQLite, connect_args is needed to enable check_same_thread for FastAPI
engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)

# Create a SessionLocal class to generate database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for declarative models
Base = declarative_base()

def get_db():
    """Dependency to get a database session. Ensures the session is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_db_and_tables():
    """Creates all database tables defined by models inheriting from Base."""
    # This should be called once on application startup
    Base.metadata.create_all(bind=engine)
