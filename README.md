# Sealit

**Build things that need to exist.**

A hackathon-winning app that scrapes real problems from Reddit and Hacker News, structures them with Gemini AI, and delivers a personalized feed matched to your stack.

## Demo Flow (3 minutes)

1. **Landing** — live builder counter ticking
2. **Sign up** → **Onboarding** (60 seconds, 3 questions, localStorage only)
3. **Feed** — "Live problems, scraped in the last 24 hours" with via Reddit/HN tags
4. **Problem detail** — scroll to "What You Could Build" → watch Gemini generate 3 ideas live
5. **Save** → **Saved tab**
6. **Killer moment** — click "⚡ Run scraper" → toast appears → open problem → show raw Reddit post side-by-side with Gemini card

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** — problems database
- **Gemini API** — post structuring + personalized build suggestions
- **Cheerio + Axios** — Reddit/HN scraping
- **Vercel Cron** — every 30 minutes

## Quick Start

```bash
cd sealit-app
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY (works without Supabase using seed data)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Recommended | Powers AI structuring + build suggestions |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | For server-side inserts |
| `CRON_SECRET` | Production | Protects cron endpoint |

Without Supabase, the app runs on **seed data** with an in-memory store for scraped problems.

## Supabase Setup

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Add env vars to `.env.local`

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/problems` | GET | List problems (last 24h) |
| `/api/problems/[id]` | GET | Single problem |
| `/api/suggest` | POST | Gemini build ideas for user's stack |
| `/api/scrape` | POST | Manual scrape trigger (demo button) |
| `/api/cron/scrape` | GET | Vercel cron (every 30 min) |
| `/api/stats` | GET | Live builder counter stats |

## Scraping Pipeline

Every 30 minutes (or manual trigger):

1. Scrape r/SomebodyMakeThis, r/startups, Ask HN
2. Send raw post to Gemini → structured problem card
3. Store in Supabase (or in-memory fallback)
4. Feed polls every 15s → toast on new problem

## Screens

- **Landing** — hero with scattered problem cards + live counter
- **Login / Signup** — email + Google + GitHub (demo auth)
- **Onboarding** — stack (multi-select), domains, builder goal → localStorage
- **Feed** — personalized problem cards with source tags
- **Problem Detail** — full context, "What's been tried", Gemini ideas, raw post comparison
- **Saved** — grid of bookmarked problems
