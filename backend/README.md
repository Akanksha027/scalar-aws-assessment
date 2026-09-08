# Route53 Clone — Backend

FastAPI + SQLite API for the Route 53 assessment clone.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Demo user is seeded on startup: `admin@example.com` / `password123`.

## Docs

Interactive OpenAPI: http://127.0.0.1:8000/docs
