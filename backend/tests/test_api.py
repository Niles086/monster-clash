import os
from pathlib import Path

TEST_DB_PATH = Path("./test_monster_clash.db")

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["JWT_SECRET"] = "test-secret"

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    with client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_cards():
    with client:
        response = client.get("/cards")

    assert response.status_code == 200
    assert len(response.json()) >= 8


def test_new_player_starts_with_default_progression():
    email = "progression-test@monsterclash.local"

    with client:
        response = client.post(
            "/auth/register",
            json={
                "email": email,
                "display_name": "Progression Test",
                "password": "TestPassword123!",
            },
        )

    assert response.status_code == 201

    body = response.json()
    user = body["user"]

    assert user["email"] == email
    assert user["display_name"] == "Progression Test"
    assert user["level"] == 1
    assert user["xp"] == 0
    assert user["coins"] == 100
    assert user["wins"] == 0
    assert user["losses"] == 0
    assert user["total_matches"] == 0