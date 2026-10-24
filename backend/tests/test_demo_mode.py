import os

os.environ["LAZYDESK_DEMO_MODE"] = "true"

from fastapi.testclient import TestClient
from app.main import app


def test_demo_health_is_explicit():
    response = TestClient(app).get("/api/health")
    assert response.status_code == 200
    assert response.json()["demo_mode"] is True


def test_demo_process_returns_summary_tasks_and_questions():
    notes = "Team sync\n- Need to send the report by Friday.\nQuestion: who owns testing?"
    response = TestClient(app).post("/api/process", json={"notes": notes})
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]
    assert any("send the report" in task for task in data["tasks"])
    assert any("Question:" in question for question in data["follow_up_questions"])
    assert "demo parser" in data["model"]
