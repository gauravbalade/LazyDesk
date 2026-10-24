# LazyDesk API

## Run locally

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
ollama pull qwen2.5:3b
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000/docs. Tests: `pytest -q`.
