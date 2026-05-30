import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db, Base
from auth import (
    hash_password, verify_password,
    create_access_token,
    get_current_user, get_optional_user,
)


# ── Create tables after the event loop starts (safe with Render cold-start) ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="AURA API", version="1.0.0", lifespan=lifespan)

# ── CORS — allow the Render static site + local dev ───────────────────────────
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
origins = [o for o in [FRONTEND_URL, "http://localhost:5173"] if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "AURA API online"}


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.TokenResponse, status_code=201)
def register(body: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = models.User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


# ── Reports ───────────────────────────────────────────────────────────────────

def _report_out(r: models.Report) -> schemas.ReportOut:
    return schemas.ReportOut(
        id=r.id,
        title=r.title,
        description=r.description or "",
        type=r.type or "Aerial",
        tag=r.tag or "Unidentified",
        lat=r.lat,
        lng=r.lng,
        behaviors=r.behaviors or [],
        image=r.image or "",
        created_at=r.created_at,
        user_id=r.user_id,
        username=r.author.username if r.author else None,
    )


@app.get("/api/reports", response_model=list[schemas.ReportOut])
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(models.Report).order_by(models.Report.created_at.desc()).all()
    return [_report_out(r) for r in reports]


@app.post("/api/reports", response_model=schemas.ReportOut, status_code=201)
def create_report(
    body: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    report = models.Report(
        title=body.title or f"Sighting by {current_user.username}",
        description=body.description,
        type=body.type,
        tag=body.tag,
        lat=body.lat,
        lng=body.lng,
        behaviors=body.behaviors,
        image=body.image,
        user_id=current_user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return _report_out(report)


@app.delete("/api/reports/{report_id}", status_code=204)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your report")
    db.delete(report)
    db.commit()
