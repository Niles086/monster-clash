from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .cards import CARDS
from .config import get_settings
from .database import create_db_and_tables, get_session
from .dependencies import get_current_user
from .models import (
    MatchResult,
    MatchResultCreate,
    TokenResponse,
    User,
    UserCreate,
    UserLogin,
    UserPublic,
)
from .security import create_access_token, hash_password, verify_password

settings = get_settings()


def build_user_public(user: User) -> UserPublic:
    return UserPublic(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        level=user.level,
        xp=user.xp,
        coins=user.coins,
        wins=user.wins,
        losses=user.losses,
        total_matches=user.wins + user.losses,
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=settings.cors_origin_list != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "online",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post(
    "/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserCreate,
    session: Session = Depends(get_session),
):
    email = payload.email.strip().lower()

    if len(payload.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters",
        )

    existing = session.exec(
        select(User).where(User.email == email)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=email,
        display_name=payload.display_name.strip()[:40],
        password_hash=hash_password(payload.password),
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    public = build_user_public(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=public,
    )


@app.post("/auth/login", response_model=TokenResponse)
def login(
    payload: UserLogin,
    session: Session = Depends(get_session),
):
    email = payload.email.strip().lower()

    user = session.exec(
        select(User).where(User.email == email)
    ).first()

    if not user or not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    public = build_user_public(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        user=public,
    )


@app.get("/me", response_model=UserPublic)
def me(
    current_user: User = Depends(get_current_user),
):
    return build_user_public(current_user)


@app.get("/cards")
def list_cards():
    return CARDS


@app.post(
    "/matches",
    response_model=MatchResult,
    status_code=status.HTTP_201_CREATED,
)
def save_match(
    payload: MatchResultCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    result = MatchResult(
        user_id=current_user.id,
        **payload.model_dump(),
    )

    session.add(result)
    session.commit()
    session.refresh(result)

    return result


@app.get("/matches", response_model=list[MatchResult])
def match_history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(MatchResult)
        .where(MatchResult.user_id == current_user.id)
        .order_by(MatchResult.created_at.desc())
        .limit(20)
    )

    return list(session.exec(statement).all())