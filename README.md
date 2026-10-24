# LazyDesk 🦥

**A local-first AI desk assistant that turns messy notes into clear summaries and actionable tasks.**

LazyDesk is an open-source AI project for the DEV Hacktoberfest Open-Source AI Challenge. Its goal is to reduce repetitive work while keeping the user in control of their data.

> Status: MVP in progress. Features described as planned are not considered complete until implemented and tested.

## Why LazyDesk?

People accumulate meeting notes, class notes, brainstorms, and to-do lists. LazyDesk is designed to turn those notes into a concise summary, prioritized action items, follow-up questions, and an exportable Markdown result.

The AI core is intended to use an open-weight model locally through Ollama, so private notes need not be sent to a closed hosted AI service.

## Planned MVP

1. Paste or edit notes in a simple web UI.
2. Generate a summary and action items using a locally running open-weight model.
3. Show a clear error/help message if the local model is unavailable.
4. Export results as Markdown.
5. Include a sample input and output for reproducible evaluation.

## Architecture

- **Frontend:** React + Vite
- **Backend:** Python FastAPI for a small, fast MVP
- **AI runtime:** Ollama with a locally installed open-weight model (suggestion: `qwen2.5:3b`)
- **Privacy:** prompts go to the locally configured Ollama endpoint; no hosted model API is required by default.

FastAPI is chosen for the challenge MVP so model integration can be implemented and tested quickly. A Java/Spring Boot adapter can be added later if it materially improves the project.

## Local development

Requirements: Node.js 20+, Python 3.11+, and Ollama.

### 1. Start an open-weight model

Install Ollama from https://ollama.com/ and run:

```bash
ollama pull qwen2.5:3b
ollama serve
```

### 2. Run the backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API documentation: http://127.0.0.1:8000/docs

### 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL (usually http://localhost:5173).

## API

- `GET /api/health` — reports application and Ollama availability.
- `POST /api/process` — accepts notes and returns a summary, task list, and follow-up questions from the local model.

## Evaluation plan

We will test on sample notes and report summary fidelity, whether extracted tasks are supported by the input, response latency on the test machine, and whether input text is sent outside the local machine (it should not be by default).

## Challenge submission

The Week 3 theme is **Slow and Steady**: build something with open-weight models or open-source AI that automates a tedious task. The DEV write-up should explain what effort LazyDesk saves and where local/open AI is valuable (privacy, model choice, and local execution).

Do not claim unimplemented features work. Add a demo, screenshots, measured results, and the DEV submission only after the MVP has been run and verified.

## Contributing

Issues and pull requests that improve functionality, tests, accessibility, privacy, or documentation are welcome. Please explain the problem solved and include test steps.

## License

MIT — see `LICENSE`.