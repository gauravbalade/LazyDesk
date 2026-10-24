import os

os.environ["LAZYDESK_DEMO_MODE"] = "true"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_demo_health_is_explicit():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["demo_mode"] is True


def test_demo_process_returns_summary_tasks_and_questions():
    notes = "Team sync\n- Need to send the report by Friday.\nQuestion: who owns testing?"
    response = client.post("/api/process", json={"notes": notes})
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]
    assert any("send the report" in task for task in data["tasks"])
    assert any("who owns testing" in question for question in data["follow_up_questions"])
    assert "demo organizer" in data["model"]


def test_demo_deduplicates_lines_and_removes_svg_artifacts():
    notes = """Project Title: PropertySetu
svg
PropertySetu is a property registration and document verification system.
PropertySetu is a property registration and document verification system.
- Need to verify the uploaded documents.
The system should provide a single platform for applicants.
The system should provide a single platform for applicants.
Question: who approves an application?
"""
    response = client.post("/api/process", json={"notes": notes})
    assert response.status_code == 200
    data = response.json()
    assert "PropertySetu" in data["summary"]
    assert data["summary"].count("property registration") == 1
    assert not any(task.startswith("The system should") for task in data["tasks"])
    assert any("verify the uploaded documents" in task for task in data["tasks"])
    assert len(data["follow_up_questions"]) == 1
    assert "svg" not in data["summary"].lower()



def test_demo_removes_concatenated_svg_labels_and_ui_controls():
    notes = """Project Tittle : PropertySetu
Project Description
PropertySetu is a web-based property registration and document verification system.
svgVerify Account – Complete the required email/mobile verification.
svgUpload Documents – Upload required property documents.
svgCopy MarkdownsvgExport .md
"""
    response = client.post("/api/process", json={"notes": notes})
    assert response.status_code == 200
    data = response.json()
    combined = data["summary"] + " " + " ".join(data["tasks"]) + " " + " ".join(data["follow_up_questions"])
    assert "svg" not in combined.lower()
    assert "Copy Markdown" not in combined
    assert "Export .md" not in combined
    assert not any(task.lower().startswith(("verify account", "upload documents")) for task in data["tasks"])

    
def test_demo_cleans_copied_result_chrome_and_recovers_misspelled_project_title():
    notes = """Clear head, clear plan
svg
THE SHORT VERSION
Project Tittle : PropertySetu – Project Description
PropertySetu is a web-based property registration and document verification system.
The main aim of the project is to provide applicants with a single platform.
Next steps
0
No explicit tasks found in these notes.
svgCopy MarkdownsvgExport .md
svgDemo mode uses a deterministic organizer: notes are processed by this API without being sent to an AI model.
"""
    response = client.post("/api/process", json={"notes": notes})
    assert response.status_code == 200
    data = response.json()
    combined = data["summary"] + " " + " ".join(data["tasks"]) + " " + " ".join(data["follow_up_questions"])
    assert "svg" not in combined.lower()
    assert "clear head, clear plan" not in combined.lower()
    assert "the short version" not in combined.lower()
    assert "no explicit tasks found" not in combined.lower()
    assert "PropertySetu" in data["summary"]
    assert "web-based property registration" in data["summary"]
    assert not any("single platform" in task for task in data["tasks"])
