"""Pydantic Schemas for DoxFin API & Internal Data Flow"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DocumentUploadResponse(BaseModel):
    filename: str
    status: str
    message: str


class FinancialMetricResponse(BaseModel):
    metric_name: str
    value: float
    unit: str = "%"
    status: str = "normal"
