from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Reports ───────────────────────────────────────────────────────────────────

class ReportCreate(BaseModel):
    title: str
    description: str = ""
    type: str = "Aerial"
    tag: str = "Unidentified"
    lat: float
    lng: float
    behaviors: list[str] = []
    image: str = ""
    uap_confidence: Optional[float] = None
    verdict: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    title: str
    description: str
    type: str
    tag: str
    lat: float
    lng: float
    behaviors: list[str]
    image: str
    uap_confidence: Optional[float] = None
    verdict: Optional[str] = None
    created_at: datetime
    user_id: Optional[int]
    username: Optional[str] = None

    model_config = {"from_attributes": True}


TokenResponse.model_rebuild()
