# SFM PRO Enterprise Backend v6.2

Sprint 1 creates the backend foundation only. Business modules are intentionally not implemented yet.

## Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Helmet
- CORS
- Compression
- Cookie Parser
- dotenv
- Pino
- Zod
- Swagger/OpenAPI

## Setup

1. Create a PostgreSQL database.
2. Copy `.env.example` to `.env` and update the values.
3. Install dependencies from `backend/package.json`.
4. Run Prisma generate and migration commands.
5. Start the server.

## Scripts

- `npm run dev`
- `npm start`
- `npm run lint`
- `npm run format`
- `npm run test`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`

## Folder Structure

- `src/config` - environment, logger, database, Swagger
- `src/controllers` - controller layer placeholders
- `src/services` - service layer placeholders
- `src/repositories` - repository layer placeholders
- `src/routes` - versioned API routing
- `src/middleware` - auth, errors, request lifecycle
- `src/validators` - Zod schemas and validation helpers
- `src/utils` - token, password, and response helpers
- `src/models` - ORM-facing model placeholders
- `src/constants` - shared constants
- `src/types` - shared type references
- `prisma` - schema and migrations
- `tests` - backend tests
- `docs` - backend documentation

## Health API

- `GET /api/v1/health`

## Swagger

- `/api/docs`
