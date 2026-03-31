# ✦ Math Collective

**A production-ready competitive mathematics platform for university students.**

Built with Node.js, Express, Supabase, and Three.js. Features AI-powered math challenges, live leaderboards, and a stunning 3D globe landing page.

---

## 🚀 Quick Start

### 1. Clone / Extract

```bash
cd math-club-website
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
OPENROUTER_API_KEY=your-openrouter-key
SESSION_SECRET=your-random-secret-string
PORT=3000
```

### 3. Run

**Development (auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
math-club-website/
├── server.js                 # Express app entry point
├── package.json
├── .env.local                # Environment variables (not committed)
│
├── config/
│   ├── supabase.js           # Supabase client setup
│   ├── openrouter.js         # OpenRouter AI API client
│   └── database.js           # Optional MongoDB config
│
├── controllers/
│   ├── authController.js     # Register, login, logout
│   ├── arenaController.js    # Challenge submission logic
│   ├── challengeController.js # Challenge CRUD
│   ├── leaderboardController.js
│   ├── userController.js
│   ├── adminController.js
│   └── eventcontrollers.js
│
├── middleware/
│   └── authMiddleware.js     # requireAuth() session guard
│
├── routes/
│   ├── pageRoutes.js         # All HTML page routes
│   ├── authRoutes.js         # /api/auth/*
│   ├── arenaRoutes.js        # /api/arena/*
│   ├── challengeRoutes.js    # /api/challenge/*
│   ├── leaderboardRoutes.js  # /api/leaderboard
│   ├── userRoutes.js         # /api/user/*
│   ├── eventRoutes.js        # /api/events/*
│   └── adminRoutes.js        # /api/admin/*
│
├── views/
│   ├── home.html             # Landing page (globe + hero)
│   ├── arena.html            # Challenge solver (auth-gated)
│   ├── dashboard.html        # Member profile & history
│   ├── login.html            # Login form
│   ├── register.html         # Registration form
│   ├── about.html            # About page
│   ├── contact.html          # Contact form
│   ├── events.html           # Events calendar
│   ├── privacy.html          # Privacy Policy
│   ├── terms.html            # Terms of Service
│   ├── gallery.html          # Photo gallery
│   ├── history.html          # Solve history
│   └── 404.html              # Error page
│
└── public/
    ├── css/
    │   └── style.css         # Global design system
    └── js/
        ├── app.js            # Shared auth + nav utilities
        └── globe.js          # Three.js globe animation
```

---

## 🔑 Required Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `SUPABASE_URL` | Your Supabase project URL | [supabase.com](https://supabase.com) → Project Settings |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Project Settings → API |
| `OPENROUTER_API_KEY` | For AI question generation | [openrouter.ai](https://openrouter.ai) |
| `SESSION_SECRET` | Random string for session signing | Any 32+ char random string |
| `PORT` | Server port (default: 3000) | Optional |

---

## 🌐 Routes Reference

### Page Routes
| Route | Description | Auth Required |
|---|---|---|
| `GET /` | Landing page with globe | No |
| `GET /about` | About page | No |
| `GET /events` | Events calendar | No |
| `GET /contact` | Contact form | No |
| `GET /privacy` | Privacy policy | No |
| `GET /terms` | Terms of service | No |
| `GET /login` | Login page | No |
| `GET /register` | Registration page | No |
| `GET /arena` | Challenge arena | Yes (frontend-gated) |
| `GET /dashboard` | Member dashboard | Yes (frontend-gated) |

### API Routes
| Route | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Log in |
| `POST /api/auth/logout` | Log out |
| `GET /api/auth/me` | Get current session |
| `GET /api/challenge/current` | Current active challenge |
| `GET /api/challenge/all` | All challenges |
| `POST /api/arena/submit` | Submit an answer |
| `GET /api/arena/history` | User's submission history |
| `GET /api/leaderboard` | Top users by XP |
| `GET /api/user/stats` | Current user stats |
| `GET /api/events` | All events |

---

## 🗄️ Supabase Setup

### Required Tables

**users** (handled by Supabase Auth — metadata stored in `user_metadata`):
- `name` — string
- `xp` — integer (default 0)
- `title` — string (default "Axiom Scout")

**challenges**:
```sql
create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  question text not null,
  options text[] not null,
  correct_index integer not null,
  difficulty text default 'MEDIUM',
  points integer default 50,
  solution text,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

**arena_attempts**:
```sql
create table arena_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  challenge_id uuid references challenges(id),
  selected_index integer,
  correct boolean,
  xp_earned integer default 0,
  created_at timestamptz default now()
);
```

---

## 📦 Dependencies

```json
{
  "express": "^5.2.1",
  "express-session": "^1.19.0",
  "@supabase/supabase-js": "^2.99.1",
  "dotenv": "^17.3.1",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "axios": "^1.13.6",
  "mathjs": "^15.1.1",
  "nodemon": "^3.1.14"
}
```

---

## 🎨 Tech Stack

- **Backend**: Node.js + Express 5
- **Auth & DB**: Supabase (PostgreSQL + Auth)
- **AI**: OpenRouter API (for question generation)
- **3D Globe**: Three.js r134
- **Frontend**: Vanilla JS + CSS Custom Properties
- **Fonts**: Inter, Space Mono, Syne (Google Fonts)

---

## 🚢 Deployment

### Render / Railway / Fly.io

1. Set all environment variables in your hosting dashboard
2. Set build command: `npm install`
3. Set start command: `node server.js`

### Environment on production

Make sure `NODE_ENV=production` is set and `SESSION_SECRET` is a strong random string.

---

## 📄 License

MIT © 2026 Math Collective, BMSIT
