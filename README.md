# DevBoard

Open-source developer productivity platform for daily standups, coding goals, code snippets, and AI-powered PR summaries.

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 11+
- PostgreSQL 16
- Redis 7

### Setup

1. Install dependencies from the repo root:

```bash
pnpm install
```

2. Copy environment templates and fill in values:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. Apply database migrations:

```bash
pnpm --filter @devboard/api exec prisma migrate deploy
```

4. Start all services with Docker (recommended):

```bash
docker compose up
```

Or run locally without Docker:

```bash
pnpm dev
```

- API: http://localhost:4000
- Web: http://localhost:5173

See [local-setup.md](./local-setup.md) for detailed local setup without Docker.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web and API in development mode |
| `pnpm build` | Build all workspace packages |
| `pnpm lint` | Lint all packages |
| `pnpm --filter @devboard/api test` | Run API integration tests |

## Project structure

```text
apps/
  api/    Express + Prisma backend
  web/    React + Vite frontend
packages/
  types/      Shared TypeScript interfaces
  tsconfig/   Shared TS configs
docs/         PRD, architecture, API contracts
```

## Documentation

- [Product requirements](./docs/product/PRD.md)
- [Feature tickets](./docs/product/feature-ticket.md)
- [Technical architecture](./docs/architecture/technical-architecture.md)
- [API contracts](./docs/api/api-contracts.md)
