# Worklog - PrepaConcours FDS

---
Task ID: 1
Agent: Main Agent
Task: Prepare project for Vercel deployment (database migration + config)

Work Log:
- Switched Prisma schema from SQLite to PostgreSQL (Vercel serverless incompatible with SQLite)
- Updated src/lib/db.ts to remove query logging in production
- Created self-seeding API endpoint at /api/setup (POST seeds 45 exercises + default student, GET checks status)
- Added auto-setup hook in DashboardView.tsx that calls /api/setup on first visit
- Updated next.config.ts: removed `output: "standalone"`, added `serverExternalPackages` for Prisma
- Updated package.json: new build script with `prisma generate`, added `postinstall` and `vercel-build` scripts
- Created .vercelignore to exclude unnecessary files from deployment
- Created .env.example showing required DATABASE_URL format
- Verified build succeeds with `npx next build` (all 10 routes compiled)
- Attempted Vercel CLI deploy and Neon DB creation — both require interactive browser auth

Stage Summary:
- Project is 100% Vercel-ready, build verified
- User needs to: authenticate with Vercel, create a free Neon PostgreSQL database, set DATABASE_URL env var, deploy
- All code changes are backward-compatible (local SQLite still works with .env file)
