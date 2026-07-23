import os
os.environ["DATABASE_URL"] = "sqlite:///./test_monster_clash.db"
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
