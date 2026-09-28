# Church Talent Show — Voting App

Next.js + TypeScript e-voting app. Anyone with the link can vote for a
contestant (open voting — no restriction on repeat votes, per your setup).
Admins can add/remove contestants and watch live results.

## 1. Setup

```bash
npm install
cp .env.example .env
# edit .env: set ADMIN_PASSWORD to something only your team knows
npx prisma db push   # creates the local SQLite database
npm run dev
```

- Voting page: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin (log in with `ADMIN_PASSWORD`)

## 2. Add your contestants

Log in at `/admin` and use the "Add Contestant" form — name, act (optional),
and a photo URL (optional, e.g. a link to an image you've uploaded
somewhere like Imgur or Google Drive).

## 3. On the night of the show

Display `/admin` on a laptop/projector for live results, and share the
voting page link (or a QR code to it) with the audience so people can vote
from their phones.

## 4. Deploying so it's reachable outside your church wifi

This is a normal Next.js app, so it deploys easily to **Vercel** (free tier
is plenty for this):

1. Push this project to a GitHub repo.
2. Import it at vercel.com → New Project.
3. **Important:** the default database (SQLite, a local file) does **not**
   persist on Vercel. Before deploying, create a free Postgres database
   (e.g. [Supabase](https://supabase.com) or [Neon](https://neon.tech)),
   then:
   - In `prisma/schema.prisma`, change `provider = "sqlite"` to
     `provider = "postgresql"`.
   - Set `DATABASE_URL` in Vercel's Environment Variables to your Postgres
     connection string.
   - Also set `ADMIN_PASSWORD` and `ADMIN_SECRET` in Vercel's Environment
     Variables.
4. Deploy. Vercel runs `prisma generate && prisma migrate deploy && next build`
   automatically (already wired into `package.json`).

If you'd rather keep it simple and just run it on a laptop connected to the
venue's wifi/hotspot for the night, `npm run build && npm start` works fine
too — no external database needed.

## Notes on the voting rule

Per your choice, voting is **open**: the same phone/device can vote more
than once, and votes aren't tied to an identity. If you ever want to add a
one-vote-per-phone limit (e.g. via SMS OTP), the vote count logic lives in
one place — `app/api/vote/route.ts` — so it's a contained change.
