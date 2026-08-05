LeftOverLink — Local Development README

### Backend (industry‑grade Express/Mongo)

1. **Env setup**
   - `cp server/.env.example server/.env`
   - Edit `server/.env` and set at minimum:
     - `MONGO_URI` (MongoDB connection string)
     - `JWT_SECRET` (used for access tokens)
     - Optionally override:
       - `PORT` (default `5001`)
       - `JWT_ACCESS_TTL` (default `15m`)
       - `JWT_REFRESH_TTL` (default `7d`)
       - `CORS_ORIGINS` (comma‑separated list, defaults to local Vite URLs)

2. **Install & run**
   - `cd server`
   - `npm install`
   - `npm run dev` (nodemon) or `npm start` (plain node)

3. **What’s running**
   - Layered app in `server/src`:
     - Config: `config/env.js`, `config/db.js`, `config/cors.js`, `config/logger.js`
     - Middleware: `middleware/auth.js`, `middleware/rateLimiter.js`, `middleware/errorHandler.js`
     - Modules:
       - `modules/auth` — register/login/refresh/me using JWT + Zod validation
       - `modules/food` — create/list/claim/delete food posts
   - Legacy controllers and routes still exist but traffic now flows through the new module router in `server/src/routes/index.js`.

4. **API quick checks (curl)**
   - Public GET foods (no auth required):
     - `curl -s http://localhost:5001/api/food | jq`
   - Register a new user:
     - `curl -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"secret","role":"provider"}'`
   - Login and capture token:
     - `curl -s -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"secret"}' | jq`
   - Create food (protected):
     - `curl -X POST http://localhost:5001/api/food -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" -d '{"title":"Sandwich","description":"Two sandwiches","quantity":5,"expiry":"2026-02-21T12:00:00Z","location":{"lat":0,"lng":0,"address":"Demo"}}'`
   - Claim food (protected, receiver token):
     - `curl -X PUT http://localhost:5001/api/food/claim/<FOOD_ID> -H "Authorization: Bearer <TOKEN>"`

### Frontend (React/Vite, map‑first)

1. **Install & run**
   - `cd client`
   - `npm install`
   - `npm run dev`

2. **API base URL**
   - If backend is **not** on `http://localhost:5001`, create `client/.env`:
     - `VITE_API_URL=http://<your-backend-host>:5001`

3. **Notable frontend structure**
   - App shell and routes in `client/src/app/app.tsx`
   - Existing pages in `client/src/app/components`
   - New feature & shared layers:
     - `features/map/FoodMap.tsx` — Leaflet/OpenStreetMap‑based nearby food map
     - `features/insights/InsightBanner.tsx` — “AI‑Driven Insight Engine” banner
     - `shared/ai/insightEngine.ts` — heuristic AI insight helpers for providers/receivers

4. **Investor‑grade touches wired in**
   - Receiver dashboard:
     - Map‑first experience with live pins (`FoodMap`) using current location and posts
     - AI insight banner summarizing nearby urgency and supply
   - Provider dashboard:
     - AI insight banner based on listing activity

### Deployment & next steps

- **Frontend**: Deploy `client` to Vercel (or similar). Configure `VITE_API_URL` to point to your hosted backend.
- **Backend**: Containerize `server` and deploy to Railway/Render/Fly.io with MongoDB Atlas.
- **Future roadmap hooks**:
  - Real‑time: add a WebSocket/SSE server and mount under `/realtime` for live food, pickup, and rider updates.
  - AI: replace the heuristic functions in `shared/ai/insightEngine.ts` with calls to a real AI service (OpenAI/Gemini, etc.) while keeping the same interface.

Notes

- Do not commit `server/.env` or any real secrets. Use `.env.example` for sharing.
- Ensure collaborators run `npm install` in both `server` and `client` and create their own `.env` files before starting.
