# Project Structure (Step 1 cleanup)

Runtime entry: `server.js`

Key folders
- `routes/` – API routers and `registerRoutes.js` (single registrar used by `server.js`), `pageRoutes.js` for static views.
- `controllers/` – request handlers per domain (auth, admin, org admin, super admin, quiz, payments, etc.).
- `middleware/` – auth/tenant scoping, security utilities, rate limiting.
- `middleware/sessionConfig.js` – central session middleware (same settings across app).
- `config/` – Supabase and OpenRouter clients.
- `views/` – static HTML pages served by `pageRoutes`.
- `public/` – static assets (css/js/images/uploads).

Routing flow
1) `server.js` sets global middleware (static, body parsers, sessions, rate limiting, tenant injection).
2) `registerRoutes(app)` mounts all `/api/*` endpoints with the same paths as before (auth limiter and contact limiter preserved).
3) `/api/debug` remains defined in `server.js`.
4) `pageRoutes` serves HTML pages.
5) `/logout` (GET) and `/api/auth/logout` (GET/POST) destroy session and redirect/respond.

Notes
- Duplicate page routes were removed; each path is defined once for clarity.
- No endpoints were renamed; behavior is unchanged.
