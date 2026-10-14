> **Unofficial concept project — not affiliated with Dublin Men's Basketball Board.**

# DMBB – Dublin Men's Basketball Board Website

Concept website for the Dublin Men's Basketball Board, organising basketball leagues and cup competitions across Greater Dublin, Ireland.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS**
- **Vercel** (deployment)

## Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier is sufficient)

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd dmbb-website
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public key** from Project Settings → API.
3. Note your **service_role key** from the same page (keep this secret).

### 3. Run the database migration

In your Supabase project, go to **SQL Editor** and paste the entire contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, RLS policies, the `recalculate_standings` function, and inserts seed data (teams, divisions, sample news).

### 4. Add environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Homepage – hero, standings, results, fixtures, news |
| `/fixtures` | All fixtures with division + month filters |
| `/results` | All results, filterable by division |
| `/standings` | Full league tables for all divisions |
| `/clubs` | All registered clubs |
| `/news` | News articles |
| `/news/[slug]` | Individual article |
| `/admin` | Admin dashboard (protected) |
| `/admin/results` | Enter match scores |
| `/admin/fixtures` | Add/delete fixtures |
| `/admin/teams` | Add/edit teams |
| `/admin/news` | Create/edit news articles |

## Admin Access

1. In your Supabase project, go to **Authentication → Users → Add user**.
2. Create a user with an email and password.
3. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and sign in.

Only authenticated users can write data. The site enforces this via Supabase RLS policies and a Next.js middleware guard on all `/admin/*` routes.

## Deployment to Vercel

1. Push the project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. In the Vercel project settings, add the three environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy. Vercel will build and serve the site automatically.

Future pushes to `main` will trigger automatic re-deployments.
