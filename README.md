# LeadFlow

LeadFlow is a mortgage-brokerage platform foundation. Phase 1 provides the React/TypeScript/Vite frontend, Express/TypeScript API, Tailwind CSS v4, and Mongoose setup. Phase 2 adds JWT authentication, four user roles, brokerage membership, scoped user management, and the login/profile test UI. Leads, cases, documents, and other CRM workflows are intentionally out of scope.

## Requirements and setup

- Node.js 20.19+ (or 22.12+) and npm
- A MongoDB deployment for seed data and authenticated API use

From the repository root:

```sh
npm install
```

Configure `server/.env` with `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_URL`. Keep the existing MongoDB URI if one is already configured; do not replace the file blindly. Copy the required variable names from `server/.env.example` as needed. Generate a strong local JWT secret (at least 32 characters), for example in PowerShell:

```powershell
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Put the generated value in `server/.env` as `JWT_SECRET=...`. Never commit `.env` files or use the demo JWT secret in production. The root `.gitignore` excludes environment files.

The Atlas free tier works for development and the small seed dataset. Its storage, throughput, and connection limits still apply; this setup does not imply production capacity. The API reports actual Mongoose connection state at `/api/health` and continues to start if MongoDB is unavailable, but authentication and user endpoints require a working database and `JWT_SECRET`.

## Seed development accounts

Run once, or again to safely update the same demo users:

```sh
npm run seed --workspace server
```

This creates two brokerages and seven development users: a platform admin, plus a brokerage admin, advisor, and client in each brokerage. The script hashes the shared demo password and is idempotent by brokerage name and user email. These credentials are for local development only; never use them in production.

| Role | Email | Password |
| --- | --- | --- |
| Platform Admin | `platform.admin@leadflow.local` | `LeadflowDemo!2026` |
| Brokerage Admin A | `admin.a@leadflow.local` | `LeadflowDemo!2026` |
| Advisor A | `advisor.a@leadflow.local` | `LeadflowDemo!2026` |
| Client A | `client.a@leadflow.local` | `LeadflowDemo!2026` |
| Brokerage Admin B | `admin.b@leadflow.local` | `LeadflowDemo!2026` |
| Advisor B | `advisor.b@leadflow.local` | `LeadflowDemo!2026` |
| Client B | `client.b@leadflow.local` | `LeadflowDemo!2026` |

## Run

Start both applications with hot reload from the repository root:

```sh
npm run dev
```

- Frontend: `http://localhost:5173`
- API health: `http://localhost:4000/api/health`
- Login: `http://localhost:5173/login`

## Authentication API

- `POST /api/auth/login` accepts `{ "email", "password" }`; returns a JWT and safe user profile.
- `GET /api/auth/me` requires `Authorization: Bearer <token>` and returns the current safe profile.
- `GET /api/users` lists users visible to a Platform Admin or Brokerage Admin.
- `GET /api/users/:userId` retrieves a user visible to the caller’s scope.
- `POST /api/users` creates users. Brokerage Admins can create users only in their own brokerage; only a Platform Admin can create Platform Admin accounts.

JWTs expire after one hour. The frontend stores the token in `localStorage` for this development MVP, checks it through `/api/auth/me` on load, and clears it on logout. `localStorage` is accessible to JavaScript, so an XSS vulnerability could expose a token; a production deployment should prefer a properly configured Secure, HttpOnly, SameSite cookie and add CSRF protections as appropriate. Logout clears the browser token; because JWTs are stateless, it does not revoke a copied token before expiry.

## Roles and tenant isolation

- Platform Admin: platform-wide; `brokerageId` is null.
- Brokerage Admin: can manage users in exactly their brokerage.
- Advisor: belongs to exactly one brokerage; no user-administration access.
- Client: belongs to exactly one brokerage; reusable access rules limit client records to the signed-in client.

Non-platform users’ brokerage membership is derived from the authenticated database user. Brokerage Admin user lists and user lookups are scoped on the server; caller-supplied brokerage IDs cannot move a normal user into another tenant. `assertBrokerageAccess` and `assertClientRecordAccess` provide reusable server-side checks for future resource routes. No leads, client cases, or document resources are created in this phase.

## Checks

```sh
npm run lint
npm run test
npm run build
```

Backend integration tests use a disposable local MongoDB instance; the first test run may download its MongoDB binary. Tests do not write records to the configured Atlas database.