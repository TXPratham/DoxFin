"""
Database Configuration & Session Factory (Phases 24, 38, 39, 40, 41).
Configured for PostgreSQL in production (e.g. postgresql+psycopg2://...)
with graceful local SQLite fallback and dynamic column migration.
"""
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "doxfin.db"

# Environment variable DATABASE_URL overrides default
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")

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


def _migrate_sqlite_columns():
    """Dynamically applies non-destructive schema migrations for SQLite."""
    if not DATABASE_URL.startswith("sqlite"):
        return

    with engine.connect() as conn:
        # Check users table columns
        try:
            res = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            cols = {row[1] for row in res}
            if cols and "hashed_password" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"))
            if cols and "is_active" not in cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
            
            # Check financial_metrics columns
            res_m = conn.execute(text("PRAGMA table_info(financial_metrics)")).fetchall()
            cols_m = {row[1] for row in res_m}
            if cols_m and "verified_by_user_id" not in cols_m:
                conn.execute(text("ALTER TABLE financial_metrics ADD COLUMN verified_by_user_id VARCHAR(64)"))
            if cols_m and "verified_at" not in cols_m:
                conn.execute(text("ALTER TABLE financial_metrics ADD COLUMN verified_at DATETIME"))
            
            # Check documents columns
            res_d = conn.execute(text("PRAGMA table_info(documents)")).fetchall()
            cols_d = {row[1] for row in res_d}
            if cols_d and "is_confidential" not in cols_d:
                conn.execute(text("ALTER TABLE documents ADD COLUMN is_confidential BOOLEAN DEFAULT 0"))

            # Check document_access columns
            res_a = conn.execute(text("PRAGMA table_info(document_access)")).fetchall()
            cols_a = {row[1] for row in res_a}
            if cols_a and "access_level" not in cols_a:
                conn.execute(text("ALTER TABLE document_access ADD COLUMN access_level VARCHAR(32) DEFAULT 'READ'"))
            if cols_a and "granted_by_user_id" not in cols_a:
                conn.execute(text("ALTER TABLE document_access ADD COLUMN granted_by_user_id VARCHAR(64)"))

            # Check audit_logs columns
            res_aud = conn.execute(text("PRAGMA table_info(audit_logs)")).fetchall()
            cols_aud = {row[1] for row in res_aud}
            if cols_aud and "document_id" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN document_id VARCHAR(64)"))
            if cols_aud and "user_email" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN user_email VARCHAR(255)"))
            if cols_aud and "user_name" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN user_name VARCHAR(255)"))
            if cols_aud and "resource_type" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN resource_type VARCHAR(64)"))
            if cols_aud and "resource_id" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN resource_id VARCHAR(64)"))
            if cols_aud and "details" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN details TEXT"))
            if cols_aud and "status" not in cols_aud:
                conn.execute(text("ALTER TABLE audit_logs ADD COLUMN status VARCHAR(32) DEFAULT 'SUCCESS'"))

            conn.commit()
        except Exception:
            pass


def init_db():
    """Create all tables in the database and run non-destructive migrations."""
    from app.database import models
    Base.metadata.create_all(bind=engine)
    _migrate_sqlite_columns()


# Auto-initialize database on import
init_db()
