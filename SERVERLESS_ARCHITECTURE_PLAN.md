## Goal

Move the Trawally Management System from a monolithic Express + EJS + session-based app to a **serverless-ready, stateless architecture** with:
- Separate **frontend** (SPA/SSR) and **backend API**
- **JWT-based authentication** (no in-memory sessions)
- Deployment-ready for platforms like **Vercel**, **Netlify**, or **AWS Lambda + API Gateway**

---

## Target Architecture Overview

- **Frontend**
  - Technology: React or Next.js (recommended: Next.js for built-in routing + SSR/SSG)
  - Deployed as static/edge site on Vercel/Netlify/Cloudflare Pages
  - Talks to backend via HTTPS JSON APIs

- **Backend API**
  - Stateless HTTP APIs, no Express-session
  - JWT auth (access + refresh tokens)
  - Deployed as:
    - Vercel/Netlify Functions, or
    - AWS Lambda (via API Gateway), or
    - Node server on a small VPS (still “stateless-ready”)

- **Database**
  - MongoDB Atlas (same as now)
  - Shared by all serverless functions, using a re-usable connection helper

---

## 1. Authentication Redesign (Sessions → JWT)

### Current
- `express-session` + `connect-mongo`
- Session ID stored in cookie; server keeps session state in MongoDB

### New
- **Access token (short life, e.g. 15–30 min)**:
  - Signed JWT containing: `userId`, `role`, `iat`, `exp`
  - Stored in HTTP-only cookie or in-memory on frontend
- **Refresh token (longer life, e.g. 7–30 days)**:
  - Signed JWT or random token stored in DB
  - Stored in HTTP-only cookie

### Auth Flow
- **Login**
  - `POST /api/auth/login` with credentials
  - Verify user in MongoDB (bcrypt as now)
  - Issue `accessToken` and `refreshToken`
  - Set as secure HTTP-only cookies
- **Authenticated Requests**
  - Frontend sends `Authorization: Bearer <accessToken>` header or relies on cookie
  - API checks JWT signature and `role` claim, no session store
- **Token Refresh**
  - `POST /api/auth/refresh` uses refresh token to issue new access token
- **Logout**
  - Invalidate refresh token (delete from DB) and clear cookies

---

## 2. API Layer Design

Convert current Express routes/controllers into clean REST-style endpoints:

- `/api/auth/*`
  - `POST /login`
  - `POST /logout`
  - `POST /refresh`

- `/api/users/*` (superadmin/admin/CEO operations)
  - `GET /me`
  - `GET /` (list users – restricted)
  - `POST /` (create user – restricted)
  - `PATCH /:id`, `DELETE /:id`

- `/api/staff/*`
- `/api/contracts/*`
- `/api/services/*`
- `/api/attendance/*`
- `/api/reports/*`

Each endpoint:
- Validates input (reuse `express-validator` logic, or switch to a lighter validation lib)
- Uses a **shared DB helper** to get a MongoDB client/connection
- Returns JSON: `{ data, error }` format

---

## 3. Frontend Redesign (EJS → SPA/SSR)

### Current
- EJS views in `views/*` rendered by Express
- Server handles both HTML and JSON

### New
- A dedicated frontend app (recommended: `frontend/` folder with Next.js):
  - Pages for:
    - `/login`
    - `/dashboard/superadmin`
    - `/dashboard/ceo`
    - `/dashboard/admin`
    - Supporting pages: staff, contracts, attendance, reports, settings
  - UI talks to backend via `fetch('/api/...')` or Axios
  - Role-based routing on frontend (e.g. redirect non-admins)

### Migration Strategy
- Step 1: Re-create **auth + one dashboard** page in frontend
- Step 2: Gradually move each EJS page/feature into React pages
- Step 3: When a section is migrated, switch routes to hit the API only

---

## 4. Serverless-Friendly DB Helper

Create a small module for DB connection reuse, something like:

- `lib/db.js`:
  - Holds a cached Mongo client between function invocations
  - Exposes `getDb()` to be used in each API handler

This pattern is needed on Vercel/Netlify/AWS to avoid opening a fresh connection per request.

---

## 5. Deployment Targets

### Option A: Vercel (Recommended full serverless)
- **Frontend**: Next.js app at repo root or `frontend/`
- **Backend**: Next.js API routes or `api/` functions
- Benefits:
  - Very smooth Next.js integration
  - Built-in serverless functions

### Option B: Netlify
- **Frontend**: React/Next.js build output
- **Backend**: Netlify Functions (`netlify/functions/*`)

### Option C: Hybrid
- **Backend** on a small VPS (Node + Express, but stateless JWT APIs)
- **Frontend** on Vercel/Netlify as static/SSR app

---

## 6. Step-by-Step Migration Plan (from current code)

1. **Freeze current production** on the monolith.
2. **Introduce JWT auth** in a separate API module (alongside current session logic).
3. **Create a separate `api/` folder** with stateless endpoints for:
   - `/auth/login`, `/auth/logout`, `/auth/refresh`
   - `/users/me`
4. **Build a new frontend app** (`frontend/` with Next.js or React):
   - Implement login page using new JWT endpoints
   - Implement one dashboard page (e.g. superadmin)
5. **Refactor roles & permissions** to be driven by JWT `role` claim + backend checks.
6. **Gradually port each feature** (staff, contracts, services, attendance, reports) into:
   - API endpoints under `/api/...`
   - Frontend pages/components in the new app
7. **Retire EJS views** once all features are available in the new frontend.
8. **Deploy**:
   - Deploy frontend to Vercel/Netlify
   - Deploy API as serverless functions (or stateless Node app)
9. **Cut over DNS** to point `app.trawally.com` to the new frontend.

---

## 7. Next Actions (Implementation Order)

1. Decide **frontend stack**:
   - Prefer: **Next.js** (best for Vercel, supports SSR/SSG + API routes)
2. Decide **backend deployment target**:
   - Vercel Functions vs Netlify Functions vs stateless Node on VPS
3. Add initial skeleton:
   - `frontend/` app
   - `api/` folder with basic JWT auth endpoints
4. Wire in **JWT auth** and test with Postman/Insomnia.
5. Build **login + basic dashboard** in new frontend.

Once you confirm Next.js + Vercel (or another combo), we can start adding real code for:
- JWT helpers
- First `/api/auth/login` endpoint
- Frontend login page and protected route wrapper.


