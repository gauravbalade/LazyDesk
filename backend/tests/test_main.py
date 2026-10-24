from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_contains_api_links():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "LazyDesk API"


def test_process_rejects_too_short_notes():
    response = client.post("/api/process", json={"notes": "short"})
    assert response.status_code == 422


def test_process_rejects_missing_notes():
    response = client.post("/api/process", json={})
    assert response.status_code == 422


def test_process_rejects_overlong_notes():
    response = client.post("/api/process", json={"notes": "x" * 20001})
    assert response.status_code == 422
