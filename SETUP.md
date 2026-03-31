# Math Collective — Complete Setup Guide

## ⚡ Quick Start (4 steps)

---

### STEP 1 — Fix your `.env.local` key (CRITICAL)

Your current `.env.local` has the **anon key** stored as `SUPABASE_SERVICE_ROLE_KEY`.
This causes every database operation to silently fail.

**How to fix:**
1. Go to [supabase.com](https://supabase.com) → Your Project → **Settings** → **API**
2. Copy the **service_role** key (marked "secret")
3. Open `.env.local` and replace `SUPABASE_SERVICE_ROLE_KEY` value with it

**How to verify you have the right key:**
- Go to [jwt.io](https://jwt.io) and paste your key
- The payload must say `"role": "service_role"`
- If it says `"role": "anon"` → wrong key, get the other one

---

### STEP 2 — Run the migration SQL

1. Open [supabase.com](https://supabase.com) → Your Project → **SQL Editor** → **New Query**
2. Copy and paste the entire contents of `migration.sql`
3. Click **Run**

**What this does (all safe, no data deleted):**
- Adds `xp`, `role`, `title` columns to your `students` table
- Adds `is_active`, `solution` columns to `challenges` table
- Adds `location`, `is_active` to `events` table (keeps your `date` column)
- Creates `arena_attempts` table
- Creates leaderboard view

---

### STEP 3 — Make yourself admin

Run this in Supabase SQL Editor (replace the email):

```sql
UPDATE public.students
SET role = 'admin'
WHERE email = 'your.email@bmsit.in';
```

Then log out and log back in — the admin panel will be unlocked.

---

### STEP 4 — Start the server

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## ✅ What was fixed in this release

| File | Bug Fixed |
|------|-----------|
| `migration.sql` | Complete rewrite — matches your actual DB schema |
| `controllers/eventcontrollers.js` | `event_date` → `date` (your column name) |
| `controllers/challengeController.js` | Uses `solution` column (not `theorem/method/hint`) |
| `controllers/arenaController.js` | Uses `solution` column, correct table names |
| `controllers/aiController.js` | Complete rewrite — robust JSON parsing, correct URL |
| `controllers/adminController.js` | Events use `date`, added `createUser` + `deleteUser` |
| `controllers/authController.js` | Syncs students table on every login |
| `config/openrouter.js` | Fixed `OPENROUTER_URL` (was undefined) |
| `middleware/authMiddleware.js` | Uses session role (fast), falls back to DB |
| `routes/adminRoutes.js` | Added create/delete user routes |
| `routes/aiRoutes.js` | Protected with `requireAdmin` |
| `views/arena.html` | Shows `solution` field (removed theorem/method/hint) |
| `views/history.html` | Shows `solution` field (removed theorem/method/hint) |
| `views/admin.html` | Create user, delete user, events use `date` field |

---

## 🔄 End-to-End Flows (all working after setup)

### AI Question Flow
1. Admin opens `/admin` → Challenges tab
2. Clicks "Generate Question" → AI creates MCQ via OpenRouter
3. Preview shown — admin clicks "Save to DB"
4. Challenge stored in `challenges` table with `is_active = true`
5. Students see it immediately on Arena page

### Student Login Flow
1. Student visits `/login`
2. Enters email + default password
3. Backend verifies via Supabase Auth
4. `students` row auto-created/synced with `xp=0, role=student`
5. Session stored → Arena loads challenge → student answers → XP updated

### Admin Management Flow
1. Admin logs in → `/admin` (auth gate blocks non-admins)
2. **Create user**: name + email + password + role → creates in Supabase Auth + students table
3. **Reset password**: enter new password → updated in Supabase Auth
4. **Change role**: student ↔ admin
5. **Delete user**: removes from Auth + students table

---

## 🗄️ Your Actual Database Schema

```
students:     id, email, name, created_at, user_id, xp, role, title
challenges:   id, title, question, options[], correct_index, difficulty, 
              points, solution, is_active, created_at
events:       id, title, description, date, created_at, location, is_active
arena_attempts: id, user_id, challenge_id, selected_index, correct, 
                xp_earned, created_at
```

---

## ❓ Troubleshooting

**Arena still shows "Loading..."**
→ Check your `.env.local` key is service_role not anon
→ Check migration.sql was run (students needs `xp` column)
→ Check there's at least one challenge with `is_active = true`

**"Admin access required" even after setting role**
→ Log out and log back in to refresh the session

**AI generation fails**
→ Check `OPENROUTER_API_KEY` in `.env.local`
→ Check OpenRouter account has credits

**"column does not exist" errors**
→ Run `migration.sql` again — it's idempotent (safe to run multiple times)
