from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id       = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email    = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    reports = relationship("Report", back_populates="author", cascade="all, delete")


class Report(Base):
    __tablename__ = "reports"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(255), nullable=False)
    description = Column(Text, default="")
    type        = Column(String(50), default="Aerial")    # Aerial | Land
    tag         = Column(String(50), default="Unidentified")
    lat         = Column(Float, nullable=False)
    lng         = Column(Float, nullable=False)
    behaviors   = Column(ARRAY(String), default=[])
    image       = Column(Text, default="")                # base64 data URL
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user_id  = Column(Integer, ForeignKey("users.id"), nullable=True)
    author   = relationship("User", back_populates="reports")
