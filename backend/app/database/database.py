"""Database session and connection configuration"""
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./doxfin.db")


def get_db():
    """Dependency for yielding database sessions."""
    pass
