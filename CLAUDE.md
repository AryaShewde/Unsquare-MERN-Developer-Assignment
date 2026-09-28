# LeadFlow Project Guide

## Stack and structure

- `client/`: React, TypeScript, Vite, and Tailwind CSS v4.
- `server/`: Node.js, Express, TypeScript, and Mongoose for MongoDB.
- The root `package.json` defines npm workspaces and shared development commands.
- Client requests live in `client/src/services/`; API route handlers and database setup live under `server/src/`.

## Conventions

- Keep browser and server code separate and use strict TypeScript.
- Read secrets from environment variables. Never commit `.env` files or credentials.
- Keep API errors explicit and do not report MongoDB as connected unless Mongoose confirms it.
- Prefer small, focused changes that follow existing package and folder conventions.

## Scope discipline

Only implement the feature requested for the current phase. Phase 2 includes authentication, roles, brokerage membership, and authorization helpers. Do not add leads, dashboards, cases, document handling, jobs, WebSockets, email, tasks, or external integrations until a later phase explicitly requests them. Avoid modifying unrelated files or behavior.

## Authentication and tenant security

- Store only bcrypt hashes; never return password fields from API responses.
- Keep `JWT_SECRET` and database credentials in ignored environment files.
- Resolve user role and brokerage membership from the database after JWT verification; do not trust tenant or role claims from client input.
- Scope every future brokerage resource query by the authenticated user's brokerage. Platform Admin is the only cross-brokerage role.
- Client resource access must also verify the requested client owner matches the authenticated client.
- Development seed credentials are not production credentials.

## Commands

- `npm run dev`: run client and API with reload.
- `npm run lint`: type-check both workspaces.
- `npm run build`: build both workspaces.
- `npm run test`: run backend authentication and tenant authorization tests.
- `npm run seed --workspace server`: upsert development demo brokerages and users.