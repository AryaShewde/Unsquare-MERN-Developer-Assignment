# LeadFlow

LeadFlow is a mortgage-brokerage platform. Phase 1 provides the React/TypeScript/Vite frontend, Express/TypeScript API, Tailwind CSS v4, and Mongoose setup. Phase 2 adds JWT authentication, four user roles, brokerage membership, and scoped user management. Phase 3 adds brokerage-isolated leads and a live pipeline. Phase 4 converts leads into client cases and provides private document upload with asynchronous simulated verification.

## Requirements and setup

- Node.js 20.19+ (or 22.12+) and npm
- A MongoDB deployment for seed data and authenticated API use

From the repository root:

```sh
npm install
```

Configure `server/.env` with `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL`, and the S3-compatible storage settings described under Phase 4. Keep existing values if already configured; do not replace the file blindly. Copy variable names from `server/.env.example` as needed. Generate a strong local JWT secret (at least 32 characters), for example in PowerShell:

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

Non-platform users’ brokerage membership is derived from the authenticated database user. Brokerage Admin user lists and user lookups are scoped on the server; caller-supplied brokerage IDs cannot move a normal user into another tenant. Case and document endpoints derive client ownership from the authenticated user, and staff queries are restricted to their brokerage.

## Checks

```sh
npm run lint
npm run test
npm run build
```

Backend integration tests use a disposable local MongoDB instance; the first test run may download its MongoDB binary. Tests do not write records to the configured Atlas database.

## Phase 3: Leads and pipeline

The lead pipeline has six controlled stages: `NEW`, `CONTACTED`, `QUALIFIED`, `APPLICATION`, `WON`, and `LOST`. Brokerage Admins and Advisors can create and update leads, move stages, and assign/unassign advisors. Only Brokerage Admins and Platform Admins can delete leads. Clients cannot access lead endpoints. Platform Admins may list across brokerages; a `brokerageId` list filter is available to them. Normal users are always scoped to their authenticated brokerage.

### Lead API

- `GET /api/leads` lists leads visible to the caller; optional `status` filter is supported.
- `POST /api/leads` creates a lead. Platform Admins must provide a brokerage; other users’ brokerage is derived from authentication and a mismatching body ID is rejected.
- `GET /api/leads/:leadId` and `PATCH /api/leads/:leadId` read/update one scoped lead.
- `PATCH /api/leads/:leadId/status` changes pipeline stage and requires `status` plus the lead’s `expectedUpdatedAt` value.
- `PATCH /api/leads/:leadId/assignment` accepts `{ "assignedAdvisorId": "<user-id>" }` or `null` to unassign. The advisor must be in the lead’s brokerage.
- `DELETE /api/leads/:leadId` is restricted to Brokerage Admin and Platform Admin.
- `GET /api/leads/advisors` and `GET /api/leads/brokerages` provide scoped board selectors.

All lead API requests use `Authorization: Bearer <JWT>`. Brokerage scope is part of each database query/mutation; cross-brokerage lead IDs return 404. Lead responses omit internal normalized duplicate keys and authentication fields.

### Webhook setup

Brokerage Admins can create/rotate their own inbound token with `POST /api/brokerages/:brokerageId/lead-webhook-token`; Platform Admins can do this for either brokerage. The high-entropy token is returned once, and only its SHA-256 hash is stored. Rotating the token invalidates the previous token. Store the returned value in the external provider’s secret storage.

Send `POST /api/webhooks/leads` with `Authorization: Bearer <brokerage-webhook-token>`, `Content-Type: application/json`, and a body like:

```json
{
	"eventId": "source-record-123",
	"firstName": "Jordan",
	"lastName": "Taylor",
	"email": "jordan@example.com",
	"phone": "+1 555 123 4567",
	"source": "Website form"
}
```

Example with `curl.exe` (replace the URL and read the token from your secret manager; do not commit it):

```sh
curl.exe -X POST "https://YOUR-API/api/webhooks/leads" -H "Authorization: Bearer YOUR_BROKERAGE_WEBHOOK_TOKEN" -H "Content-Type: application/json" -d "{\"eventId\":\"source-record-123\",\"firstName\":\"Jordan\",\"lastName\":\"Taylor\",\"email\":\"jordan@example.com\",\"phone\":\"+1 555 123 4567\",\"source\":\"Website form\"}"
```

For Postman, create a POST request to `/api/webhooks/leads`, set Authorization type to Bearer Token, paste the brokerage token there, and use the JSON above as a raw JSON body. A real Zapier path is: trigger on a new lead in the source app, add **Webhooks by Zapier → POST**, set the URL and bearer header, map the lead fields, and map the source record ID to `eventId`. Make’s HTTP module can use the same URL/header/body. The API must be reachable via HTTPS by the provider; localhost alone is not reachable externally. This repository provides the compatible webhook endpoint but has not been connected to a provider account or tested against a live external provider.

### Duplicate behavior

Email is trimmed/lowercased and phone is compared by digits only. Checks and unique compound indexes include `brokerageId`, so the same person may exist independently in different brokerages. A duplicate person returns HTTP 409 with a safe `duplicateLead` summary from that brokerage; it is not silently inserted. When `eventId` is present, retrying the same event for that brokerage returns HTTP 200 with `duplicateEvent: true` and the original lead.

### Realtime and concurrent changes

Authenticated pipeline clients connect to Socket.IO with their JWT in the handshake auth data. The server reloads the user from MongoDB and assigns the socket to a server-generated brokerage room; Platform Admins join a separate platform room. `pipeline:update` carries an action (`created`, `updated`, `assigned`, `status`, or `deleted`) and safe lead data/ID. The browser refetches from the REST API after events. Room names are never accepted from clients, and no global lead broadcast is made.

Status updates use optimistic concurrency: the client submits `expectedUpdatedAt`; only a matching current document is changed. If two users submit from the same old version, one succeeds and the stale update gets HTTP 409 and must refresh. This is a single-document compare-and-set, not a distributed lock; it relies on MongoDB’s atomic update behavior.

The webhook is provider-agnostic, not a completed vendor-specific integration. Features beyond Phase 3 (client conversion, cases, documents, tasks, email, analytics, or queues) are not included in Phase 3.

## Phase 4: Client cases and documents

### Lead conversion and client login

Brokerage Admins and Advisors can convert an unconverted lead with `POST /api/leads/:leadId/convert`. The API verifies brokerage ownership, creates a `CLIENT` user and one case, sets the lead to `WON`, and links the lead to the case. A unique case-per-lead/client constraint plus an atomic lead update prevents duplicate conversion; if a step fails, newly created case/user records are compensated. A repeat conversion returns HTTP 409.

Email delivery is not implemented. The conversion response contains a randomly generated temporary password once so the staff member can relay it to the client through an approved secure channel. It is hashed before storage, omitted from the client profile, and not recoverable from the API afterward. The client signs in through the existing `/api/auth/login` endpoint.

### Client and staff APIs

- `GET /api/clients/me/cases` and `GET /api/clients/me/documents` return only the authenticated Client’s data.
- `POST /api/clients/me/documents` accepts multipart fields `file` and `documentType`; all ownership/brokerage/status fields are server-derived.
- `GET /api/clients` and `GET /api/clients/:clientId/cases` are restricted to Platform Admin, Brokerage Admin, and Advisor. Non-platform results are brokerage-scoped.
- `GET /api/cases/:caseId` and `GET /api/cases/:caseId/documents` verify client ownership or staff brokerage membership.
- `GET /api/documents/:documentId` and `/download` enforce the same ownership checks. The download endpoint returns a short-lived (120 second) signed URL for the private object.
- `POST /api/documents/:documentId/retry` requeues only a failed document accessible to the caller.

Clients cannot access lead/admin APIs, select their client/case/brokerage IDs, or set verification status. Verification status is changed only by the worker. Advisors/Admins can see cases and documents within their allowed brokerage; Platform Admin is cross-brokerage.

### Private storage configuration

The application uses AWS S3-compatible object storage; Supabase Storage’s S3 endpoint is a suitable free/development provider. Create a **private** bucket and S3 access credentials in the provider dashboard. Configure these server-only values in `server/.env`:

- `S3_ENDPOINT`: Supabase form `https://<project-ref>.supabase.co/storage/v1/s3` (or your S3-compatible endpoint).
- `S3_REGION`: Supabase S3 region, commonly `us-east-1`.
- `S3_BUCKET`: private bucket name, for example `leadflow-documents`.
- `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`: server-side S3 credentials; never expose them to Vite or commit them.

Uploads accept only PDF, JPEG, and PNG content verified from file signatures, with a 10 MiB maximum. Storage keys are random UUIDs under server-derived brokerage/client prefixes; original filenames are metadata only. File bytes are stored in the private object store, not MongoDB. Browser downloads use server-authorized short-lived signed URLs. Until S3 settings are configured, uploads return a clear storage-not-configured error; conversion and case views can still be exercised.

### Asynchronous verification and recovery

After the object is stored and the MongoDB document plus verification job records are created, upload returns HTTP 201 with `UPLOADED`. It does not run verification inline. A lightweight worker in the API process polls the MongoDB `VerificationJob` collection; the persisted job has a unique document ID, state, attempts, and lease. The worker changes state to `CHECKING`, waits `DOCUMENT_VERIFICATION_DELAY_MS` (default 5000 ms, capped at 60000), then simulates `VERIFIED` or `FAILED` using `DOCUMENT_VERIFICATION_FAILURE_PERCENT` (default 30; set 100 to force failures during a demo).

Leases let the worker reclaim a `PROCESSING` job after a crash/restart. Worker failures get up to three automatic claims with backoff; exhausted attempts become `FAILED`. Staff or the owning Client can retry a failed document, which reuses the unique job record and resets its job attempts. Document verification is simulated and does not perform OCR, antivirus scanning, or real compliance checks.

### Realtime and manual Phase 4 test

Socket.IO emits `document:update` after upload, `CHECKING`, and final/retried status changes. Client sockets join only their own user-ID room. Advisor/Admin sockets join only their authenticated brokerage room; Platform Admin has a separate platform room. Client and staff pages refetch/update the visible status from the API; no global document broadcast is used.

Manual workflow:

1. Configure the private S3-compatible bucket settings above, then run `npm run dev`.
2. Sign in as an Advisor or Brokerage Admin and create a lead in the pipeline.
3. Select **Convert to client**. Copy the one-time temporary password and give it to the client securely; the lead becomes `WON` and cannot be converted again.
4. Sign out, sign in as the new client, and upload a PDF/JPEG/PNG in the Client portal. The response should return while the status is `UPLOADED`.
5. Watch `CHECKING`, then `VERIFIED` or `FAILED` update without refreshing. Staff can sign in and view the client’s case/document status in **Clients and documents**.
6. To demonstrate failure/retry, set `DOCUMENT_VERIFICATION_FAILURE_PERCENT=100` before starting the API, upload, then use **Retry check** after `FAILED`. Set it back to a lower value (for example `30`) for normal demonstrations.
7. Use the two demo brokerages/accounts in the table above to confirm the other brokerage cannot view the case or document.

Automated tests use an injected in-memory object-storage adapter and a disposable MongoDB instance; they verify storage calls, authorization, queue timing/state transitions, retry, and realtime tenant isolation. They do not prove credentials or networking for a real Supabase/S3 project. Configure provider credentials to complete the external-storage manual path.