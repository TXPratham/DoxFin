"""
Database Configuration & Session Factory (Phase 24).
Configured for PostgreSQL in production (e.g. postgresql+psycopg2://...)
with graceful local SQLite fallback for dev/testing.
"""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Environment variable DATABASE_URL overrides default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./doxfin.db")

# SQLite specific connect args
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

Base = declarative_base()


def get_db():
    """FastAPI dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in the database."""
    from app.database import models
    Base.metadata.create_all(bind=engine)
