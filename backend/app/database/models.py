"""Database Entities & ORM Models"""
from datetime import datetime
from typing import Optional


class DocumentRecord:
    def __init__(self, id: str, filename: str, status: str = "pending"):
        self.id = id
        self.filename = filename
        self.status = status
        self.created_at = datetime.utcnow()
