from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=320)
    display_name: str = Field(max_length=40)
    password_hash: str
    created_at: datetime = Field(default_factory=utc_now)


class UserCreate(SQLModel):
    email: str
    display_name: str
    password: str


class UserLogin(SQLModel):
    email: str
    password: str


class UserPublic(SQLModel):
    id: int
    email: str
    display_name: str


class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class CardDefinition(SQLModel):
    id: str
    name: str
    description: str
    cost: int
    health: int
    damage: int
    speed: float
    attack_interval: float
    role: str
    emoji: str


class MatchResultCreate(SQLModel):
    won: bool
    player_tower_health: int
    enemy_tower_health: int
    duration_seconds: int


class MatchResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    won: bool
    player_tower_health: int
    enemy_tower_health: int
    duration_seconds: int
    created_at: datetime = Field(default_factory=utc_now)
