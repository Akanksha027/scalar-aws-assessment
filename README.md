# scalar-aws-assessment

Functional AWS [Route 53](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones) console clone for assessment submission.

**Stack:** Next.js (TypeScript) · FastAPI · SQLite · Cloudscape Design System

## Live demo

| | URL |
|---|---|
| Frontend | https://router53.vercel.app |
| Backend API | https://scalar-aws-assessment-production.up.railway.app |
| API docs | https://scalar-aws-assessment-production.up.railway.app/docs |
| Health | https://scalar-aws-assessment-production.up.railway.app/health |

Login: `admin@example.com` / `password123`

## Features

- Mocked authentication (login / logout / httpOnly session cookie)
- Hosted zones CRUD with search, pagination, edit, delete
- DNS records CRUD (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA) with filters
- Auto NS + SOA system records (protected from deletion)
- Route 53-style shell (top nav, sidebar, breadcrumbs, tables, modals, flashbars)
- Coming Soon placeholders for Dashboard, Health checks, Resolver, Profiles, etc.

## Demo login

| Field | Value |
|---|---|
| Email | `admin@example.com` |
| Password | `password123` |

## Project structure

```
frontend/     Next.js + Cloudscape UI
backend/      FastAPI + SQLite API
PRD-Route53-Clone.md
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API: http://127.0.0.1:8000  
- Swagger: http://127.0.0.1:8000/docs  
- SQLite file: `backend/data/route53.db` (created on first start)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the Next.js app proxies `/api/v1/*` to the backend (see `frontend/next.config.ts`).

## Architecture overview

```
Browser (Cloudscape UI)
    │  credentials: include (session cookie)
    ▼
Next.js (rewrites /api/v1 → FastAPI)
    ▼
FastAPI routers (auth, hosted-zones, records)
    ▼
SQLite (users, sessions, hosted_zones, dns_records, dns_record_values)
```

- **Frontend:** App Router pages, Cloudscape components, `lib/api` client, `AuthProvider` guard.
- **Backend:** Session cookies (SQLite-backed), bcrypt password hashes, Pydantic validation, type-specific DNS value checks.

## Database schema

| Table | Purpose |
|---|---|
| `users` | Demo account (`email`, `password_hash`, `display_name`, `account_id`) |
| `sessions` | Opaque session IDs with expiry |
| `hosted_zones` | Zone metadata (`id` like `Z…`, `domain_name`, `type`, `comment`, `description`, `record_count`) |
| `dns_records` | Record sets (`name`, `type`, `ttl`, `routing_policy`, `is_system_record`); unique `(hosted_zone_id, name, type)` |
| `dns_record_values` | Multi-value rows (IPs, MX priority, SRV fields, CAA flag/tag) |

Relationships: `User 1—* HostedZone 1—* DnsRecord 1—* DnsRecordValue`. Deleting a zone cascades to records.

## API overview

Base path: `/api/v1`

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | `{email, password}` → sets session cookie |
| POST | `/auth/logout` | Clears session |
| GET | `/auth/me` | Current user (401 if logged out) |

### Hosted zones

| Method | Path | Description |
|---|---|---|
| GET | `/hosted-zones` | List (`search`, `type`, `page`, `page_size`) |
| POST | `/hosted-zones` | Create (+ auto NS/SOA) |
| GET | `/hosted-zones/{id}` | Detail |
| PATCH | `/hosted-zones/{id}` | Update comment/description |
| DELETE | `/hosted-zones/{id}` | Delete (blocked if non-system records remain) |

### DNS records

| Method | Path | Description |
|---|---|---|
| GET | `/hosted-zones/{id}/records` | List (`search`, `type`, `page`, `page_size`) |
| POST | `/hosted-zones/{id}/records` | Create |
| GET | `/hosted-zones/{id}/records/{rid}` | Detail |
| PATCH | `/hosted-zones/{id}/records/{rid}` | Update |
| DELETE | `/hosted-zones/{id}/records/{rid}` | Delete (blocked for system records) |
| POST | `/hosted-zones/{id}/records/bulk-delete` | `{record_ids: [...]}` |

List responses: `{ items, total, page, page_size }`.

## Evaluation checklist mapping

| Requirement | Status |
|---|---|
| UI similarity to Route 53 | Cloudscape + console chrome |
| Auth login/logout/session | Cookie sessions |
| Hosted zones CRUD + search | Implemented + SQLite |
| DNS records CRUD + types | Implemented + validation |
| Tables / forms / filters / pagination / modals / notifications | Implemented |
| Coming Soon sections | Sidebar placeholders |
| Docs | This README |

## Notes

- IAM, billing, Organizations, and real DNS resolution are mocked / out of scope.
- Routing policies other than Simple are selectable for UI fidelity only.
