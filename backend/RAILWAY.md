# Deploy this folder as a Railway service (Root Directory = backend)

## 1. Wait 30 seconds
Railway showed: "You are creating projects too quickly… 1 project per 30 seconds."

## 2. Create project from GitHub
1. Open [Railway New Project](https://railway.app/new)
2. Choose **GitHub Repository**
3. Select `Akanksha027/scalar-aws-assessment`
4. If prompted for root directory, set **`backend`**

## 3. Service settings
- **Root Directory:** `backend`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  (already in `railway.toml` / `Procfile`)
- **Healthcheck path:** `/health`

## 4. Variables (Settings → Variables)
```
SECRET_KEY=<long-random-string>
COOKIE_SECURE=true
CORS_ORIGINS=https://router53.itsakanksha.in,http://localhost:3000
DATABASE_PATH=/data/route53.db
```

## 5. Persistent volume (important for SQLite)
1. Service → **Volumes** → Add volume  
2. Mount path: `/data`  
3. Keep `DATABASE_PATH=/data/route53.db`

Without a volume, data resets on every redeploy.

## 6. Public URL
1. Settings → **Networking** → **Generate Domain**  
2. Copy URL, e.g. `https://scalar-aws-assessment-production.up.railway.app`  
3. Test: `https://YOUR-RAILWAY-URL/health` → `{"status":"ok"}`  
4. Docs: `https://YOUR-RAILWAY-URL/docs`

## 7. Point frontend at this backend
On Vercel (or wherever frontend is hosted), set:
```
BACKEND_URL=https://YOUR-RAILWAY-URL
```
(Next.js rewrites proxy `/api/v1` to that URL.)

## Demo login
- Email: `admin@example.com`
- Password: `password123`
