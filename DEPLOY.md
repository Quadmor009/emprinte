# Landing site deployment (emprintereaders.com)

## Vercel

| Item | Value |
|------|--------|
| Team | **Quadmor's projects** |
| Project | **emprinte** (footprint icon) |
| Domains | `emprintereaders.com`, `www.emprintereaders.com` |
| Production branch | `main` |

Do **not** use **emprinte-readers-hub-rmx8** for the public marketing site — that project is the mobile app admin (`admin-web`).

## Git

Push landing changes to the repo connected under **emprinte** → **Settings** → **Git**.  
After moving off the old host, confirm production shows the latest `main` commit (not an older SHA).

## Required production env vars

Set in Vercel → **emprinte** → **Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for blog posts and admin writes)
- `NEXT_PUBLIC_SITE_URL` = `https://www.emprintereaders.com`
- Paystack keys as needed

## Do not set on Vercel (unless you use a separate auth API)

- `NEXT_PUBLIC_API_URL` — causes Server Components to call the wrong host for public data. Admin client routes use same-origin `/api/*` instead.

## After pushing to `main`

1. Open **Deployments** → confirm a new build for your commit.
2. When status is **Ready**, open `/blog` on `www.emprintereaders.com`.
3. If the domain still shows old content, use **Redeploy** on the latest `main` deployment.

## Local dev

```bash
# from mono root
npm run dev -w emprinte
```

Copy `.env.example` to `.env.local` and add Supabase + Paystack keys. Do not copy `NEXT_PUBLIC_API_URL` from legacy `.env` unless you run `emprinte-backend` on port 3001.
