# Product Requirements Document (PRD)
## AWS Route53 Clone

| | |
|---|---|
| **Document Type** | Product Requirements Document |
| **Project Name** | Route53 Clone |
| **Version** | 1.0 |
| **Status** | Draft — for assessment submission |
| **Author** | Akanksha |
| **Date** | September 7, 2026 |

---

## 1. Executive Summary

The Route53 Clone is a functional replica of the AWS Route53 web console, built to demonstrate full-stack engineering capability across frontend UI/UX fidelity, backend API design, and persistent data storage. The application recreates the **look, feel, navigation, and core workflows** of the real AWS Route53 console — specifically Hosted Zone management and DNS Record management — without implementing actual DNS resolution or propagation. Authentication, IAM, billing, and other AWS platform dependencies are mocked to keep scope focused on the Route53 experience itself.

The product is built on:
- **Frontend:** Next.js (TypeScript)
- **Backend:** FastAPI (Python)
- **Database:** SQLite

The guiding principle for this build is **fidelity over invention** — every screen, table, form, modal, and interaction pattern should be modeled directly on the real AWS Route53 console rather than a generic admin-panel interpretation of "DNS management."

---

## 2. Problem Statement & Objective

**Problem:** Building a DNS management interface is a common systems-design and full-stack exercise, but most implementations default to generic CRUD screens (a plain table + a plain form) that don't test a candidate's ability to match a real, opinionated, information-dense enterprise UI, nor their ability to model a real-world domain (DNS records, record types, validation rules, zone hierarchies) accurately.

**Objective:** Build a functional clone of the Route53 console that:
1. Is visually and behaviorally indistinguishable from the real AWS Route53 console for the in-scope features.
2. Implements complete, persistent CRUD for Hosted Zones and DNS Records.
3. Demonstrates production-quality API design, database schema design, and frontend engineering.
4. Ships with documentation sufficient for another engineer to set up, understand, and extend the system.

**Non-objective:** This is explicitly **not** a real DNS server. No zone file is served over port 53, no actual name resolution occurs, and no integration with real domain registrars or DNS infrastructure is required.

---

## 3. Target User / Persona

| Persona | Description | Needs |
|---|---|---|
| **Evaluator / Reviewer** | The assessor reviewing this submission | Wants to quickly assess UI fidelity, code quality, and completeness against the spec |
| **Simulated Route53 Admin** | The in-app persona a logged-in user plays | Wants to create hosted zones, manage DNS records inside them, search/filter/paginate large record sets, and get clear feedback (toasts, validation) on every action — exactly like a real AWS user managing DNS |

---

## 4. Scope

### 4.1 In Scope
- Mocked authentication (login, logout, session persistence)
- Full CRUD for Hosted Zones (create, read/list, search, update, delete)
- Full CRUD for DNS Records within a Hosted Zone (create, read/list, search, update, delete)
- Support for record types: A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
- Route53-matching UI: navigation, tables, forms, search, filters, pagination, modals, notifications
- Placeholder ("Coming Soon") pages for: Dashboard, Traffic Policies, Health Checks, Resolver, Profiles
- Persistent storage via SQLite for all Hosted Zone and DNS Record data
- README documentation: setup, architecture, DB schema, API overview
- A hosted, working demo deployment

### 4.2 Out of Scope
- Real DNS resolution / propagation / authoritative name serving
- Real AWS IAM, Organizations, multi-account, or billing logic
- Real third-party domain registration or registrar integration
- Multi-user real-time collaboration / websockets
- Production-grade authentication (OAuth, MFA, password hashing against a real user store is optional-nice-to-have but not required by the mock-auth spec)
- Rate limiting, WAF, or Route53-specific advanced features (Traffic Flow visual editor, Geoproximity routing, Resolver DNS Firewall rules) — these appear only as placeholder pages

### 4.3 Bonus / Stretch Scope (Optional, time-permitting)
- Import DNS records from BIND zone files (`.zone` / `.txt` upload → parsed into records)
- Export a Hosted Zone as JSON or BIND-format zone file
- Dark Mode toggle
- Keyboard shortcuts (e.g., `c` to create, `/` to focus search, `Esc` to close modal)
- Bulk operations (multi-select rows → bulk delete / bulk edit TTL)

---

## 5. Competitive / Reference Analysis — AWS Route53 Console

To achieve UI/UX fidelity, the following real Route53 console conventions must be replicated:

### 5.1 Global Shell
- **Top navigation bar:** AWS-style dark navbar with service name ("Route 53"), search bar (Alt+S), region indicator (can be mocked/static, e.g., "Global"), account menu (mocked user), notifications bell icon.
- **Left sidebar navigation**, collapsible, with sections:
  - Dashboard
  - Hosted zones
  - Traffic flow → Traffic policies, Policy records
  - Health checks
  - Resolver → Rules, Query logging, DNS Firewall
  - Domains (can be folded into "Registered domains" placeholder if desired, or omitted since not explicitly required — but recommend adding as part of nav fidelity even if it 404s to Coming Soon)
  - Profiles
- **Breadcrumb bar** beneath the top nav on inner pages (e.g., `Route 53 > Hosted zones > example.com`)
- **AWS color system:** light theme background `#FFFFFF`/`#F2F3F3`, AWS Smile-orange accent `#FF9900` used sparingly (primary buttons, active nav), AWS Squid-ink navbar `#232F3E`, table header grey `#EAEDED`, link blue `#0972D3`/AWS Cloudscape blue.
- **Typography:** Amazon Ember / system sans-serif fallback (e.g., "Amazon Ember", Helvetica, Arial, sans-serif), consistent with AWS Cloudscape Design System sizing scale.
- Recommend building the UI on **AWS Cloudscape Design System** components (`@cloudscape-design/components`) where feasible, since this is the actual open-source design system AWS uses for the real Route53 console — this is the single highest-leverage decision for achieving pixel-level fidelity.

### 5.2 Hosted Zones List Page
- Page header: "Hosted zones" with a count badge, "Create hosted zone" primary button (orange), "Delete" (disabled until row selected), "Actions" dropdown.
- Table columns: checkbox select, Domain name (link), Type (Public/Private tag), Record count, Comment, Description.
- Search/filter bar above table ("Find hosted zones").
- Pagination controls bottom-right (rows-per-page selector + page navigation).
- Empty state: "No hosted zones" illustration + "Create hosted zone" CTA.

### 5.3 Hosted Zone Detail Page
- Breadcrumb + zone name as page title, with zone metadata panel (Hosted zone ID, Type, Record count, Comment, NS/SOA info displayed as system records).
- "Records" tab (default) showing the DNS Records table.
- Table columns: checkbox, Record name, Type, Alias (Yes/No — can be simplified/mocked as "No" always if alias targets aren't modeled), Value/Route traffic to, TTL, Routing policy (Simple, default), Health check.
- "Create record" primary button opens a **side-panel drawer** (Route53 uses a slide-in panel on the right, not a full page) with quick-create and "Switch to wizard" toggle. For this clone, a **modal or drawer form** is acceptable and expected.
- Search bar to filter records by name.
- Bulk delete via row selection + "Delete records" button, which opens a **confirmation modal** listing records to be deleted.
- Filter dropdown/tabs for record type.

### 5.4 Forms & Modals
- Create/Edit Hosted Zone: modal or drawer with fields — Domain name, Type (Public/Private radio), Comment (optional textarea), Tags (optional key-value, can be stubbed).
- Create/Edit DNS Record: modal or drawer with fields that **change dynamically based on selected record Type** (see §7.3 for field mapping per type), plus common fields: Record name, Record type (select), TTL (seconds, numeric input, default 300), Value(s) (supports multi-value entry — Route53 allows multiple values per record, entered one per line).
- Delete confirmation modals for both zones and records, following AWS's pattern: type-to-confirm not required for this scale, but a clear "This action cannot be undone" warning and item summary is required.
- Form validation errors shown inline beneath fields (red text + red border), matching Cloudscape's `FormField` error pattern.

### 5.5 Notifications
- Toast/flash-bar notifications (AWS calls these "Flashbar") appear top-of-content-area (not toast-corner) for: zone created, zone deleted, record created, record updated, record deleted, and error states (validation failure, duplicate record, network error).
- Notifications include a severity color (green success, red error, blue info, yellow warning) and are dismissible.

---

## 6. Functional Requirements

### 6.1 Authentication (Mocked)

| ID | Requirement |
|---|---|
| AUTH-1 | User can log in via a login page with a username/email + password form. Credentials are validated against a mocked/seeded user (no real identity provider). |
| AUTH-2 | On successful login, a session token (JWT or opaque session ID) is issued and stored client-side (httpOnly cookie preferred over localStorage for security best-practice demonstration). |
| AUTH-3 | Session persists across page refresh and browser restart until expiry or explicit logout (e.g., 24h token expiry). |
| AUTH-4 | User can log out, which invalidates the session client-side (and server-side session/token blacklist if using stateful sessions). |
| AUTH-5 | All Hosted Zone and DNS Record API endpoints are protected — unauthenticated requests return `401 Unauthorized`. |
| AUTH-6 | Unauthenticated users hitting any protected frontend route are redirected to `/login`. |
| AUTH-7 | A single mocked account is sufficient (no self-serve signup required), but a seed script should create at least one demo user (e.g., `admin@example.com` / `password123`) documented in the README. |

### 6.2 Hosted Zones — Full CRUD

| ID | Requirement |
|---|---|
| HZ-1 | View a paginated list of all Hosted Zones belonging to the mocked account. |
| HZ-2 | Search/filter Hosted Zones by domain name (partial match, case-insensitive). |
| HZ-3 | Create a Hosted Zone by providing: Domain Name (required, validated as a syntactically plausible domain), Type (Public/Private, default Public), Comment (optional). |
| HZ-4 | On creation, the system auto-generates a Hosted Zone ID (e.g., `Z` + random alphanumeric, mimicking AWS's `/hostedzone/XXXXXXXXXXXXX` format) and auto-creates default **NS** and **SOA** records for the zone (matching real Route53 behavior — every hosted zone ships with these two system records). |
| HZ-5 | Edit a Hosted Zone's mutable fields (Comment; domain name should NOT be editable post-creation, matching real AWS behavior — to change domain name, delete and recreate). |
| HZ-6 | Delete a Hosted Zone. Deletion cascades to delete all DNS Records belonging to that zone. A confirmation modal is required before deletion. Optionally, disallow deletion if non-system records exist (real Route53 blocks deletion until all non-NS/SOA records are removed) — recommended for fidelity but can be relaxed to "delete with cascade + warning" for simplicity. |
| HZ-7 | Hosted Zone list displays a live record count per zone. |
| HZ-8 | All Hosted Zone data persists in SQLite and survives server restart. |

### 6.3 DNS Records — Full CRUD

| ID | Requirement |
|---|---|
| REC-1 | View a paginated, filterable list of DNS Records scoped to a single Hosted Zone. |
| REC-2 | Search/filter records by name and/or type within a zone. |
| REC-3 | Create a DNS Record within a zone: Name, Type (dropdown: A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA), TTL (seconds, default 300, min 0), Value(s) (one or more, type-dependent format — see §7.3), and Routing Policy (default "Simple" — Weighted/Latency/Failover/Geolocation/Multivalue can be present as **selectable but non-functional** options for UI fidelity, since true multi-answer routing logic is out of scope). |
| REC-4 | Edit an existing record's TTL, Value(s), and (for non-system records) Name/Type. |
| REC-5 | Delete one or more records via row selection + bulk delete confirmation modal. |
| REC-6 | System records (NS and SOA for the zone apex) are displayed but should be **protected from deletion** (matching real Route53, which blocks deleting the last NS/SOA record set) — the UI should visually indicate these as non-deletable (disabled checkbox or a lock icon), while still allowing them to be viewed. |
| REC-7 | Record values are validated server-side according to type-specific format rules (see §7.3) before persistence. |
| REC-8 | All record data persists in SQLite and survives server restart. |
| REC-9 | Uniqueness constraint: no two records with the same (hosted_zone_id, name, type) should be allowed to coexist as separate rows — instead, multiple values for the same name+type are stored as multiple value entries under one logical record set (matches real Route53's "record set" model where one A record can have multiple IP values).

### 6.4 Route53 Experience Requirements

| ID | Requirement |
|---|---|
| UX-1 | Navigation structure mirrors real Route53 (left sidebar sections listed in §5.1). |
| UX-2 | Hosted Zone list and detail pages match the real console's layout, columns, and actions (§5.2, §5.3). |
| UX-3 | DNS Record list and forms match real console's layout, columns, dynamic field behavior (§5.3, §5.4). |
| UX-4 | Tables support: sorting by column, pagination (page size selector: 10/25/50/100), row selection with select-all, empty states, loading skeletons. |
| UX-5 | Forms support inline validation, disabled submit until valid, loading/spinner state on submit. |
| UX-6 | Search is debounced (client-side, ~300ms) and works across the relevant list. |
| UX-7 | Filters (e.g., record type filter, zone type filter) are combinable with search. |
| UX-8 | Modals/drawers trap focus, close on Esc/backdrop click, and confirm before destructive actions. |
| UX-9 | Notifications (Flashbar-style) surface success/error feedback for every mutating action. |

### 6.5 Mocked / Placeholder Sections

| ID | Requirement |
|---|---|
| MOCK-1 | Dashboard, Traffic Policies, Health Checks, Resolver, and Profiles are reachable via the sidebar and render a "Coming Soon" page consistent with the app's visual language (not a broken/blank page). |
| MOCK-2 | Coming Soon pages should still include the breadcrumb and page header pattern for consistency, with a short descriptive blurb and (optionally) a greyed-out illustrative mockup, matching how AWS sometimes previews upcoming features. |

### 6.6 Bonus Features (Optional)

| ID | Requirement |
|---|---|
| BONUS-1 | **BIND Import:** Upload a `.zone`/`.txt` BIND-format file; backend parses standard BIND syntax (`$ORIGIN`, `$TTL`, and resource record lines) into DNS Record rows under a target Hosted Zone, with a preview/confirmation step before commit. |
| BONUS-2 | **Export:** Export a Hosted Zone's full record set as downloadable JSON (structured) or BIND zone file (text) format. |
| BONUS-3 | **Dark Mode:** App-wide theme toggle persisted in local storage/user preference, using Cloudscape's built-in dark mode tokens if using Cloudscape. |
| BONUS-4 | **Keyboard Shortcuts:** e.g. `/` focus search, `c` create new (zone or record depending on context), `Esc` close modal, `?` show shortcuts help modal. |
| BONUS-5 | **Bulk Operations:** Multi-select records for bulk delete (already required in REC-5) and bulk TTL edit. |

---

## 7. Data Model / Database Schema (SQLite)

### 7.1 Entity-Relationship Overview

```
User (1) ──< Session (many)
User (1) ──< HostedZone (many)
HostedZone (1) ──< DnsRecord (many)
```

### 7.2 Table Definitions

**`users`**
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, autoincrement |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| display_name | TEXT | NOT NULL |
| created_at | DATETIME | NOT NULL, default now |

**`sessions`** *(if using server-tracked sessions instead of pure stateless JWT)*
| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK (session/token id) |
| user_id | INTEGER | FK → users.id, NOT NULL |
| created_at | DATETIME | NOT NULL |
| expires_at | DATETIME | NOT NULL |

**`hosted_zones`**
| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK — mimics AWS format, e.g. `Z1PA6795UKMFR9` |
| user_id | INTEGER | FK → users.id, NOT NULL |
| domain_name | TEXT | NOT NULL, indexed |
| type | TEXT | CHECK IN ('Public','Private'), default 'Public' |
| comment | TEXT | nullable |
| record_count | INTEGER | derived/denormalized, default 2 (NS+SOA) |
| created_at | DATETIME | NOT NULL, default now |
| updated_at | DATETIME | NOT NULL, default now |

**`dns_records`**
| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, UUID |
| hosted_zone_id | TEXT | FK → hosted_zones.id, NOT NULL, ON DELETE CASCADE |
| name | TEXT | NOT NULL (fully qualified, e.g. `www.example.com`) |
| type | TEXT | CHECK IN ('A','AAAA','CNAME','TXT','MX','NS','PTR','SRV','CAA'), NOT NULL |
| ttl | INTEGER | NOT NULL, default 300 |
| routing_policy | TEXT | default 'Simple' (Weighted/Latency/Failover/Geolocation/Multivalue stored but non-functional) |
| is_system_record | BOOLEAN | default FALSE (true for the zone's default NS/SOA) |
| created_at | DATETIME | NOT NULL, default now |
| updated_at | DATETIME | NOT NULL, default now |

**`dns_record_values`** *(one-to-many — supports multi-value record sets, e.g. an A record with 3 IPs)*
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PK, autoincrement |
| record_id | TEXT | FK → dns_records.id, NOT NULL, ON DELETE CASCADE |
| value | TEXT | NOT NULL — raw value string, format depends on parent record's type |
| priority | INTEGER | nullable — used for MX (preference) and SRV (priority) |
| weight | INTEGER | nullable — used for SRV |
| port | INTEGER | nullable — used for SRV |
| sort_order | INTEGER | default 0 |

Unique composite index recommended: `(hosted_zone_id, name, type)` on `dns_records` to enforce the "record set" model described in REC-9.

### 7.3 Record Type → Value Format Reference

| Type | Value Format | Extra Fields | Example |
|---|---|---|---|
| A | IPv4 address | — | `192.0.2.1` |
| AAAA | IPv6 address | — | `2001:db8::1` |
| CNAME | Fully-qualified domain name | — | `www.example.com` (single value only — CNAME cannot coexist with other records at same name) |
| TXT | Free text (quoted string, max 255 chars per chunk) | — | `"v=spf1 include:_spf.example.com ~all"` |
| MX | Mail server hostname | `priority` (int) | `10 mail.example.com` |
| NS | Nameserver hostname | — | `ns-1.awsdns-00.com` |
| PTR | Domain name (reverse lookup) | — | `example.com` |
| SRV | Target hostname | `priority`, `weight`, `port` | `10 60 5060 sipserver.example.com` |
| CAA | CA authorization | `flag` (0/128), `tag` (issue/issuewild/iodef) | `0 issue "letsencrypt.org"` |

Backend validation must enforce these formats using regex/format checks per type and reject malformed input with a `422` response and a descriptive error message shown inline in the form.

---

## 8. API Design (FastAPI)

Base URL: `/api/v1`

### 8.1 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/login` | Body: `{email, password}` → returns session cookie/token + user profile | Public |
| POST | `/auth/logout` | Invalidates current session | Required |
| GET | `/auth/me` | Returns current logged-in user profile (used for session persistence check on app load) | Required |

### 8.2 Hosted Zones

| Method | Endpoint | Description |
|---|---|---|
| GET | `/hosted-zones` | List zones. Query params: `search`, `page`, `page_size`, `type` |
| POST | `/hosted-zones` | Create a zone. Body: `{domain_name, type, comment}` |
| GET | `/hosted-zones/{id}` | Get single zone detail (includes record_count) |
| PATCH | `/hosted-zones/{id}` | Update mutable fields (comment) |
| DELETE | `/hosted-zones/{id}` | Delete zone (cascades to records) |

### 8.3 DNS Records (nested under a zone)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/hosted-zones/{zone_id}/records` | List records. Query params: `search`, `type`, `page`, `page_size` |
| POST | `/hosted-zones/{zone_id}/records` | Create a record. Body: `{name, type, ttl, routing_policy, values: [...]}` |
| GET | `/hosted-zones/{zone_id}/records/{record_id}` | Get single record detail |
| PATCH | `/hosted-zones/{zone_id}/records/{record_id}` | Update ttl/values/routing_policy |
| DELETE | `/hosted-zones/{zone_id}/records/{record_id}` | Delete a single record (blocked if `is_system_record`) |
| POST | `/hosted-zones/{zone_id}/records/bulk-delete` | Body: `{record_ids: [...]}` — bulk delete |

### 8.4 Bonus Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/hosted-zones/{zone_id}/import` | Multipart file upload of a BIND zone file → parses and returns a preview payload |
| POST | `/hosted-zones/{zone_id}/import/confirm` | Commits a previously-previewed import |
| GET | `/hosted-zones/{zone_id}/export?format=json\|bind` | Downloads zone export |

### 8.5 Response Conventions
- All list endpoints return: `{items: [...], total: number, page: number, page_size: number}`
- All errors return: `{detail: string, errors?: {field: string}[]}` with appropriate HTTP status codes (`400`, `401`, `404`, `409` for conflicts like duplicate record sets, `422` for validation).
- All timestamps in ISO 8601 UTC.
- OpenAPI/Swagger docs auto-generated by FastAPI at `/docs` and `/redoc` — documented in README as the live API reference.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | List endpoints must paginate server-side (never return unbounded result sets); target < 300ms p95 response time for CRUD operations on SQLite at expected assessment-scale data volumes (hundreds of zones/records). |
| **Security** | Passwords hashed with bcrypt/argon2 (never plaintext), session tokens in httpOnly cookies, CORS configured to only allow the deployed frontend origin, input validation via Pydantic models on every write endpoint. |
| **Reliability** | SQLite file persisted to disk (not `:memory:`); database migrations tracked (Alembic recommended) so schema changes are reproducible. |
| **Maintainability** | Clear separation of concerns: FastAPI routers / services / repository (DB access) layers; Next.js pages/components/hooks/api-client layers. Typed end-to-end (Pydantic on backend, TypeScript interfaces mirrored on frontend, ideally generated from the OpenAPI schema). |
| **Accessibility** | Forms and tables should support keyboard navigation and have appropriate ARIA labels, consistent with Cloudscape's accessibility defaults if that library is used. |
| **Responsiveness** | Layout should be usable on common laptop/desktop widths (Route53 itself is not heavily mobile-optimized, so desktop-first is acceptable, matching the original). |
| **Deployability** | Must be deployable such that a hosted demo link works without local setup (e.g., frontend on Vercel, backend on Render/Railway/Fly.io with a persisted SQLite volume, or both containerized together). |

---

## 10. Information Architecture / Sitemap

```
/login                          → Login page
/                                → Redirect to /dashboard
/dashboard                       → Coming Soon
/hosted-zones                    → Hosted Zones list
/hosted-zones/[id]                → Hosted Zone detail (Records tab default)
/hosted-zones/[id]/records/new    → (or modal/drawer) Create record
/hosted-zones/[id]/records/[recordId]/edit → (or modal/drawer) Edit record
/traffic-policies                → Coming Soon
/health-checks                   → Coming Soon
/resolver                        → Coming Soon
/profiles                        → Coming Soon
```

Note: Consistent with real Route53 and with UX-2/UX-3, Create/Edit for both zones and records should be implemented as **modal or slide-in drawer overlays on the list/detail page** rather than full page navigations, to match the authentic interaction pattern — dedicated routes above are a fallback if drawers are not implemented.

---

## 11. Milestones / Suggested Build Plan

| Phase | Deliverable | Focus |
|---|---|---|
| 1 | Backend skeleton: FastAPI project structure, SQLite + models + Alembic migrations, seed script | Data layer correctness |
| 2 | Auth endpoints + mocked login/logout/session middleware | AUTH-1 → AUTH-7 |
| 3 | Hosted Zones API (full CRUD) + auto NS/SOA generation | HZ-1 → HZ-8 |
| 4 | DNS Records API (full CRUD) + type-specific validation | REC-1 → REC-9 |
| 5 | Frontend shell: navbar, sidebar, routing, auth guard, Cloudscape (or equivalent) theming | UX-1 |
| 6 | Hosted Zones list + create/edit/delete UI | UX-2 |
| 7 | Hosted Zone detail + Records table + create/edit/delete UI, dynamic per-type forms | UX-3 |
| 8 | Search, filters, pagination, sorting, Flashbar notifications across both tables | UX-4 → UX-9 |
| 9 | Coming Soon placeholder pages | MOCK-1, MOCK-2 |
| 10 | Bonus features (time-permitting): import/export, dark mode, shortcuts, bulk ops | BONUS-1 → BONUS-5 |
| 11 | README, architecture diagram, DB schema doc, API overview doc | Documentation deliverable |
| 12 | Deployment (frontend + backend hosted), smoke test demo link | Demo deliverable |

---

## 12. Deliverables Checklist

- [ ] GitHub repository with `frontend/` and `backend/` directories
- [ ] `README.md` containing:
  - [ ] Setup instructions (local dev, env vars, seed data/demo login)
  - [ ] Architecture overview (diagram + component/service breakdown)
  - [ ] Database schema (tables, relationships — can reuse §7 of this PRD)
  - [ ] API overview (endpoint table — can reuse §8 of this PRD, plus link to `/docs` Swagger UI)
- [ ] Hosted, working demo link
- [ ] (Optional) Bonus features implemented and documented

---

## 13. Evaluation Criteria Mapping

| Evaluation Criterion | Where addressed in this PRD |
|---|---|
| UI similarity to Route53 | §5 (Reference Analysis), §6.4 (UX requirements) |
| Frontend engineering quality | §9 (Maintainability), §11 (Phase 5–8) |
| Backend/API design | §8 (API Design), §9 (Reliability/Security) |
| Database design | §7 (Data Model) |
| Code quality and maintainability | §9 (Maintainability) |
| Documentation | §12 (Deliverables Checklist) |
| Overall completeness | §6 (Functional Requirements, all sub-sections) |

---

## 14. Assumptions & Open Questions

**Assumptions:**
- A single mocked user/account is sufficient; multi-tenant account switching is not required.
- "Private" hosted zones do not need real VPC-association modeling — the Public/Private field can be a label only.
- Routing policies other than "Simple" can be selectable in the UI (for fidelity) without implementing actual multi-answer/weighted response logic.
- SQLite is acceptable for the hosted demo (with the caveat that most PaaS free tiers reset ephemeral filesystems — a persistent volume or a hosted SQLite-compatible service like Turso/LiteFS should be used for the demo link to retain data between restarts).

**Open Questions (to confirm with evaluator if possible):**
- Should the "Domains" (registered domains) nav item be included as an additional Coming Soon page for closer nav fidelity, even though not explicitly listed in the spec?
- Is a single hard-coded demo user acceptable, or should there be a minimal signup flow?
- What is the expected max data volume the demo should gracefully handle (tens vs. thousands of records) — this affects whether basic pagination is sufficient or whether indexing/query optimization should be emphasized?
