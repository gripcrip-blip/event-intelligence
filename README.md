# Event Intelligence

Structured sports & esports event calendar — normalized schedules, provenance, and admin tooling.

## Stack

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Prisma
- PandaScore Fixtures provider (esports)
- Docker Compose for local Postgres

## Quick start

```bash
cp .env.example .env
# set DATABASE_URL and PANDASCORE_API_TOKEN

docker compose up -d
npm install
npx prisma db push
npm run db:seed
npm run sync:pandascore
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Public routes

| Path | Description |
| --- | --- |
| `/` | Home — upcoming + sports |
| `/events` | Filterable upcoming calendar |
| `/events/[slug]` | Event detail |
| `/sports` | Sport directory |
| `/sports/[sport]` | Sport calendar |

## Docs

See [`/docs`](./docs) for architecture, API sources, SEO, and PandaScore setup.

## License note

Third-party API data is subject to provider terms. Do not commit secrets (`.env`). Esports fixture display attributes PandaScore where required.
