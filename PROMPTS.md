# LeadFlow — AI Development Prompts

## Phase 1 — Project Foundation

### Prompt 1 — Build the Initial LeadFlow Foundation

```text
I want you to build Phase 1 of my MERN Stack Developer assignment called LeadFlow.

Project location:
C:\Users\aryas\OneDrive\Desktop\Lead Flow

The project is a lead and document management platform for mortgage brokerages in Germany that serve expats.

The assignment is intentionally time-limited, so I want a smaller working product rather than trying to build every possible feature. We will implement the project phase by phase. For this phase, ONLY build the project foundation. Do not jump ahead into authentication, leads, documents, email automation, queues, Tally, deployment, or UI polish.

Use this technology stack:

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS

Backend:
- Node.js
- Express
- TypeScript

Database:
- MongoDB Atlas
- Mongoose

Development:
- npm
- Git/GitHub

Project structure should be:

Lead Flow/
├── client/
├── server/
├── PROMPTS.md
├── CLAUDE.md
└── README.md

The frontend and backend must be separate applications inside the monorepo.

--------------------------------------------------
1. FRONTEND FOUNDATION
--------------------------------------------------

Inside:

C:\Users\aryas\OneDrive\Desktop\Lead Flow\client

Create a React + TypeScript + Vite application.

Set up Tailwind CSS.

Create a clean initial application that can display a simple health/status page.

The frontend should be able to communicate with the backend through an environment variable rather than hardcoding the API URL throughout the application.

Use an environment variable such as:

VITE_API_URL

Create the appropriate .env.example file.

Do not put secrets in the frontend.

--------------------------------------------------
2. BACKEND FOUNDATION
--------------------------------------------------

Inside:

C:\Users\aryas\OneDrive\Desktop\Lead Flow\server

Create a Node.js + Express + TypeScript backend.

Add the basic Express application structure.

Add:
- CORS
- JSON request parsing
- environment variable loading
- centralized/basic application configuration
- health endpoint
- MongoDB connection through Mongoose

The backend should expose:

GET /api/health

The health endpoint should return a simple successful JSON response and should also make it possible to confirm whether the MongoDB connection is available.

Example response structure can be similar to:

{
  "status": "ok",
  "service": "leadflow-api",
  "database": "connected"
}

Do not expose credentials or secrets in the response.

--------------------------------------------------
3. DATABASE
--------------------------------------------------

Configure MongoDB through an environment variable.

Use something like:

MONGODB_URI

Create:

server/.env.example

Only include variable names/placeholders. Never place real secrets in tracked files.

The application should establish a Mongoose connection when the backend starts.

Handle connection failures clearly.

--------------------------------------------------
4. DEVELOPMENT SCRIPTS
--------------------------------------------------

Configure useful npm scripts for development and production checks.

I want to be able to run the frontend and backend easily during development.

If appropriate, configure a root-level script that can start both applications together.

Keep the setup simple and reliable.

Do not introduce unnecessary tooling.

--------------------------------------------------
5. CORS
--------------------------------------------------

Configure CORS so the frontend can communicate with the backend during local development.

Do not use an unnecessarily permissive production architecture yet.

Use environment configuration where appropriate so this can be tightened later when deployment is implemented.

--------------------------------------------------
6. INITIAL FRONTEND HEALTH PAGE
--------------------------------------------------

Create a simple frontend page that confirms the frontend is running and attempts to call:

GET /api/health

Display:
- frontend status
- backend status
- database status if returned by the backend

The page does not need to look polished yet.

This is only a technical foundation check.

Do NOT spend time on visual design in Phase 1.

--------------------------------------------------
7. DOCUMENTATION
--------------------------------------------------

Create/update:

README.md

Document:
- what LeadFlow is
- project structure
- technology stack
- how to install dependencies
- how to configure environment variables
- how to run frontend
- how to run backend
- how to run both if a root command is provided
- how to run tests/checks if available

Create/update:

CLAUDE.md

Include the project rules and important architecture expectations that future phases should follow.

Create/update:

PROMPTS.md

This file will eventually contain the AI prompts used during the assignment. Do not fabricate prompts that were not actually provided.

--------------------------------------------------
8. IMPORTANT ARCHITECTURE RULES
--------------------------------------------------

The application will eventually be multi-tenant.

The architecture must therefore be kept suitable for strict brokerage-level isolation.

Do not build a system that assumes there is only one brokerage.

Future roles will include:
- Platform Admin
- Brokerage Admin
- Advisor
- Client

Do not implement those roles yet in this phase, but structure the project so they can be added cleanly in later phases.

--------------------------------------------------
9. TESTING / VALIDATION
--------------------------------------------------

Before considering Phase 1 complete, verify all of the following:

1. Frontend starts successfully.
2. Backend starts successfully.
3. MongoDB connects successfully.
4. GET /api/health returns HTTP 200.
5. Frontend can reach the backend health endpoint.
6. Environment variables work correctly.
7. No secrets are committed.
8. TypeScript checks pass.
9. ESLint passes.
10. Frontend production build passes.
11. Backend checks/build pass.
12. npm scripts work as expected.

If a check fails, fix the issue before declaring the phase complete.

--------------------------------------------------
10. SCOPE CONTROL
--------------------------------------------------

For this phase, DO NOT implement:

- authentication
- JWT
- bcrypt
- users
- roles
- brokerage model
- leads
- pipeline
- webhook integrations
- Tally
- clients
- documents
- Supabase storage
- background workers
- Socket.IO
- email
- Resend
- tasks
- dashboard
- deployment
- advanced UI
- dark mode
- responsive SaaS shell

Those will be handled in later phases.

Do not add libraries simply because they might be useful later.

Keep the foundation clean and minimal.

--------------------------------------------------
11. GIT / COMMIT RULE
--------------------------------------------------

Do NOT create a Git commit yet.

After implementation, give me:

1. Exact files created/modified.
2. What was implemented.
3. Commands you ran.
4. Test/check results.
5. TypeScript result.
6. Lint result.
7. Build result.
8. MongoDB connection result.
9. Health endpoint result.
10. Any known issues or limitations.
11. Current Git status.

Do not claim the phase is complete if any required validation failed.

Wait for my review before making a commit.
```

---

### Prompt 2 — Phase 1 Review / Verification

```text
Now review Phase 1 of LeadFlow before I commit it.

Do NOT make changes yet.

Perform a read-only audit of the current project.

Project:
C:\Users\aryas\OneDrive\Desktop\Lead Flow

I want you to verify that Phase 1 was implemented correctly and that nothing from later phases was unnecessarily introduced.

Check:

--------------------------------------------------
1. PROJECT STRUCTURE
--------------------------------------------------

Verify:

client/
server/
README.md
CLAUDE.md
PROMPTS.md

Confirm that frontend and backend are properly separated.

--------------------------------------------------
2. FRONTEND
--------------------------------------------------

Check:

- React
- TypeScript
- Vite
- Tailwind
- frontend startup
- API configuration
- VITE_API_URL
- no frontend secrets
- health/status page

Verify that the frontend can call the backend health endpoint.

--------------------------------------------------
3. BACKEND
--------------------------------------------------

Check:

- Node
- Express
- TypeScript
- CORS
- environment configuration
- health route
- MongoDB connection
- Mongoose

Verify:

GET /api/health

returns HTTP 200 and the expected health information.

--------------------------------------------------
4. ENVIRONMENT / SECURITY
--------------------------------------------------

Check all environment files.

Make sure:

- real secrets are not committed
- .env files are ignored where appropriate
- .env.example contains only placeholders
- MongoDB credentials are not hardcoded
- frontend does not contain backend secrets

--------------------------------------------------
5. SCOPE
--------------------------------------------------

Confirm that Phase 1 has NOT unnecessarily implemented:

- authentication
- JWT
- users
- roles
- leads
- documents
- email
- Tally
- Socket.IO
- background workers
- deployment

If anything outside the Phase 1 scope was added, report it.

--------------------------------------------------
6. QUALITY CHECKS
--------------------------------------------------

Run/read the results for:

- tests
- TypeScript
- lint
- frontend build
- backend build
- MongoDB connection
- health endpoint

Do not modify files.

--------------------------------------------------
7. GIT
--------------------------------------------------

Check:

git status
git log -1

Report whether the working tree is clean or dirty.

--------------------------------------------------
8. FINAL REPORT
--------------------------------------------------

Give me a concise but detailed report using:

PASS
FAIL
IMPORTANT
MINOR

For every failure or important issue:
- give the exact file
- explain the problem
- explain the impact
- suggest the smallest appropriate fix

Do not make any changes.

Do not commit anything.

Do not move to Phase 2 yet.
```

---

### Prompt 3 — Phase 1 Final Validation

```text
Perform the final validation for Phase 1 of LeadFlow.

This is still a READ-ONLY validation. Do not modify files.

Project:
C:\Users\aryas\OneDrive\Desktop\Lead Flow

Confirm the following before I commit:

- frontend runs
- backend runs
- MongoDB connects
- /api/health returns HTTP 200
- frontend can communicate with backend
- environment configuration is correct
- no secrets are tracked
- TypeScript passes
- lint passes
- production build passes
- project structure is correct
- documentation files exist
- no later-phase functionality has been accidentally implemented

Also inspect Git status and tell me exactly what files are currently modified/untracked.

Final response must contain:

PHASE 1 STATUS:
READY TO COMMIT / NOT READY

Then list:
- Tests
- TypeScript
- Lint
- Build
- MongoDB
- Health endpoint
- Security
- Scope
- Git status

Do not create a commit.
```

---

## Phase 1 Result

Phase 1 was subsequently reviewed and accepted as the foundation for the next phase.

The project foundation included:

* React + TypeScript + Vite frontend
* Node + Express + TypeScript backend
* MongoDB/Mongoose connection
* Tailwind CSS
* CORS
* environment configuration
* health endpoint
* frontend health page
* root development scripts
* README
* CLAUDE.md
* PROMPTS.md

Later phases were then built on top of this foundation.


# PART 2 — PHASE 2: AUTHENTICATION, USERS & MULTI-TENANCY

> **Recovery note:** The original `PROMPTS.md` file was empty, so the prompts below are reconstructed from the actual Phase 2 implementation, requirements, tests, and verification history. They preserve the intended technical requirements and workflow, but are not claimed to be the exact original wording.

---

## PROMPT 1 — Build Phase 2: Authentication, Users & Multi-Tenancy

We are continuing the LeadFlow assignment.

Project path:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Before changing anything, inspect the existing Phase 1 implementation and understand the current structure. Do not rewrite or replace working Phase 1 code unnecessarily.

### Phase 2 goal

Implement the authentication, user-management, brokerage/tenant structure, role-based access control, and strict multi-tenancy foundation for LeadFlow.

The application will serve multiple mortgage brokerages from a single deployment.

The most important security requirement is:

**Data belonging to one brokerage must never be accessible to users belonging to another brokerage.**

Do not treat brokerage isolation as only a frontend concern. It must be enforced on the backend/API/database query layer.

---

### 1. Brokerage model

Create a Brokerage model using MongoDB/Mongoose.

At minimum it should contain appropriate fields such as:

* name
* unique identifier
* timestamps

Use a clean schema and add appropriate indexes/constraints where useful.

Each brokerage represents an isolated tenant.

There will be multiple brokerages in the same database.

---

### 2. User model

Create a User model using MongoDB/Mongoose.

Users should contain at minimum:

* name
* email
* password hash
* role
* brokerageId
* timestamps

Email must be unique.

Passwords must NEVER be stored as plaintext.

Use `bcrypt`/`bcryptjs` for password hashing.

Never return password hashes from API responses.

Do not expose sensitive authentication fields through `/me`, user-management endpoints, or other API responses.

---

### 3. Roles

Implement these four roles:

* `PLATFORM_ADMIN`
* `BROKERAGE_ADMIN`
* `ADVISOR`
* `CLIENT`

Role responsibilities:

#### Platform Admin

Platform-level user.

This role is not tied to a specific brokerage.

Therefore:

`brokerageId = null`

A Platform Admin can operate at platform level and should not be incorrectly treated as belonging to one brokerage.

#### Brokerage Admin

Belongs to exactly one brokerage.

Can manage users/resources belonging to that brokerage.

#### Advisor

Belongs to exactly one brokerage.

Works with leads/clients belonging to that brokerage.

#### Client

Belongs to exactly one brokerage.

Will eventually be restricted to their own client/case data.

Do not implement unnecessary features outside the current Phase 2 scope.

---

### 4. Authentication

Implement JWT-based authentication.

Required functionality:

* login
* authenticated user retrieval (`/me` or equivalent)
* logout handling on the frontend
* protected API routes
* invalid-token rejection
* expired-token rejection

Login should use:

* email
* password

On successful login, issue a JWT containing only the minimum necessary identity/authorization information.

Do not put sensitive information such as passwords into JWTs.

Use environment variables for JWT configuration/secrets.

Never hardcode secrets.

---

### 5. Authentication middleware

Create reusable authentication middleware.

The middleware should:

1. Read the Authorization header.
2. Expect a Bearer token.
3. Validate the JWT.
4. Reject missing/invalid/expired tokens.
5. Load or identify the authenticated user.
6. Attach authenticated-user information to the request/context for downstream handlers.

Keep authentication and authorization concerns separated where practical.

For example:

* authentication middleware answers: "Who is this user?"
* role middleware answers: "Is this role allowed to access this endpoint?"

---

### 6. Role-based authorization

Implement reusable role authorization middleware.

It should allow endpoints to specify which roles are permitted.

Examples:

* Platform Admin-only routes
* Brokerage Admin routes
* Advisor/Admin routes
* authenticated-user routes

Do not rely on frontend route hiding for security.

Even if a button/page is hidden in React, the backend must independently reject unauthorized requests.

Return appropriate HTTP status codes for:

* unauthenticated requests
* authenticated but unauthorized requests

---

### 7. Strict brokerage/tenant isolation

This is one of the most important parts of Phase 2.

For users who belong to a brokerage:

* they must only access users/resources from their own brokerage
* they must not be able to access another brokerage's users
* brokerage ID must not be trusted from arbitrary client input
* authorization must be based on the authenticated user's brokerage membership

Do not create endpoints where a user can simply send:

```text
brokerageId=<another brokerage>
```

and access that brokerage's data.

Where a brokerage-scoped resource is requested, derive the brokerage scope from the authenticated user whenever possible.

Platform Admin is the exception because it is platform-level.

---

### 8. User endpoints

Create the minimum user endpoints required for the application.

At minimum, provide functionality for:

* retrieving the authenticated user
* listing/managing users where the role permits it
* creating users where the role permits it

All user-management endpoints must enforce:

* authentication
* role authorization
* brokerage isolation

Do not expose password hashes.

---

### 9. Seed data

Create a development/test seed setup containing:

### Brokerage A

A realistic brokerage name.

Create users for appropriate roles.

### Brokerage B

A different realistic brokerage name.

Create users for appropriate roles.

The seed should provide enough users to test:

* Platform Admin
* Brokerage Admin
* Advisor
* Client
* two different brokerages

The expected Phase 2 environment should contain **2 brokerages and 7 users** in total.

Use deterministic test credentials that are clearly documented for local development/testing.

Do not commit real production secrets.

---

### 10. Frontend authentication

Implement the basic frontend authentication flow.

Required:

* Login page
* Login form
* API authentication
* authenticated/protected application area
* current-user handling
* logout
* refresh behavior

The frontend should not consider a user authenticated merely because a local UI variable says so.

Authentication state should be restored appropriately after a page refresh.

If the JWT/session is invalid or expired, the user should be returned to the login flow.

Keep the UI simple for now.

This is not the UI-polish phase.

---

### 11. Protected routes

Add frontend route protection where appropriate.

Unauthenticated users should not be able to access authenticated application pages.

However, remember:

**Frontend protection is only UX/navigation protection. Backend authorization remains the actual security boundary.**

Do not duplicate business authorization logic unnecessarily in the frontend.

---

### 12. Security requirements

Pay particular attention to:

* password hashing
* JWT validation
* expired JWT rejection
* invalid JWT rejection
* role authorization
* brokerage isolation
* user enumeration where practical
* password fields never returned
* no secrets committed to Git
* no hardcoded JWT secret
* no hardcoded database credentials

Do not add unnecessary security infrastructure that is outside the assignment scope.

---

### 13. Testing

Add meaningful automated tests for Phase 2.

At minimum, test:

#### Authentication

* valid login succeeds
* incorrect password fails
* unknown user fails
* missing authentication fails
* invalid JWT fails
* expired JWT fails

#### Authorization

* protected endpoint requires authentication
* role-restricted endpoint rejects incorrect roles
* allowed roles can access permitted endpoints

#### Multi-tenancy

Create users belonging to different brokerages.

Verify:

* Brokerage A user can access Brokerage A resources
* Brokerage A user cannot access Brokerage B resources
* Brokerage B user cannot access Brokerage A resources
* brokerage ID cannot simply be overridden through request input
* Platform Admin behavior is correctly handled

#### User data security

Verify that:

* password hashes are not returned
* sensitive fields are not accidentally exposed

#### Seed/database

Verify that the seed creates:

* 2 brokerages
* 7 users
* correct roles
* correct brokerage relationships

#### Frontend

Verify:

* login works
* authenticated page works
* refresh preserves authentication appropriately
* logout clears authentication state
* protected navigation works

---

### 14. Scope control

Do NOT start implementing Phase 3 features yet.

Do not implement:

* leads
* pipeline
* Tally/webhooks
* duplicate detection
* Socket.IO realtime pipeline
* client document uploads
* background document verification
* email automation
* tasks
* dashboard aggregation

Those belong to later phases.

Keep Phase 2 focused on:

**Authentication + users + roles + brokerage isolation.**

---

### 15. Development workflow

Before making changes:

1. Inspect the existing Phase 1 structure.
2. Identify reusable code.
3. Confirm existing health check and MongoDB connection still work.
4. Implement Phase 2 incrementally.
5. Run backend tests.
6. Run frontend checks.
7. Run TypeScript/lint/build checks.
8. Verify that Phase 1 functionality has not regressed.

Do not commit yet.

At the end, give me:

* files created
* files modified
* API endpoints added
* models added
* middleware added
* seed credentials/users created
* tests added
* test results
* TypeScript result
* lint result
* frontend build result
* any known issues
* whether Phase 2 is actually ready for review

Do not claim completion just because the code compiles.

---

## PROMPT 2 — Phase 2 Review & Security Verification

Phase 2 implementation is now complete.

Do a **read-only review first**.

Do not modify files.

Do not commit anything.

Review the current LeadFlow implementation specifically for:

* authentication
* JWT handling
* role authorization
* user model
* brokerage model
* tenant isolation
* seed data
* frontend authentication
* protected routes
* security
* tests

Compare the implementation against the Phase 2 requirements.

### Review 1 — Brokerage model

Verify:

* Brokerage model exists
* schema is valid
* unique identifiers/constraints are appropriate
* timestamps exist
* multiple brokerages can coexist

### Review 2 — User model

Verify:

* required fields exist
* role is constrained
* brokerage relationship is correct
* Platform Admin can have `brokerageId = null`
* other roles require brokerage membership where appropriate
* email uniqueness is enforced
* password is hashed
* password hash is never returned in normal responses

### Review 3 — Password security

Verify:

* passwords are hashed with bcrypt/bcryptjs
* plaintext passwords are never stored
* login compares hashes correctly
* password fields are excluded from API responses
* no test/debug endpoint accidentally returns password hashes

### Review 4 — JWT

Verify:

* JWT secret comes from environment configuration
* tokens contain only necessary information
* password is never included in JWT
* invalid JWTs are rejected
* expired JWTs are rejected
* malformed/missing tokens are rejected

### Review 5 — Authentication middleware

Verify:

* protected routes actually require authentication
* Authorization header is parsed correctly
* Bearer tokens are validated
* authenticated user information is available to downstream handlers
* authentication errors use appropriate status codes

### Review 6 — Role authorization

Test each role.

Verify that role restrictions are enforced by the backend and are not merely frontend UI restrictions.

A user must not gain access to an endpoint by changing:

* frontend state
* URL
* request body
* query parameter
* role value sent by the client

### Review 7 — Tenant isolation

This is the most important review.

Create/use:

* Brokerage A
* Brokerage B

Then test cross-tenant access.

For example:

```text
Brokerage A user -> Brokerage A user/resource
Brokerage A user -> Brokerage B user/resource
Brokerage B user -> Brokerage A user/resource
```

The cross-brokerage requests must be rejected.

Also verify that a request such as:

```json
{
  "brokerageId": "another-brokerage-id"
}
```

cannot allow a normal brokerage user to escape their tenant.

Brokerage scope must come from trusted authenticated context rather than arbitrary user input.

### Review 8 — Platform Admin

Verify that Platform Admin:

* is not incorrectly tied to a brokerage
* can perform intended platform-level operations
* is not accidentally treated like a normal brokerage user

Do not give Platform Admin unrestricted access merely by assumption; verify the actual endpoint authorization rules.

### Review 9 — Seed data

Verify:

* exactly 2 brokerages
* 7 users
* all four roles represented appropriately
* users are assigned to correct brokerages
* Platform Admin has no brokerage where intended
* passwords are hashed

Do not expose real secrets.

### Review 10 — Frontend auth

Verify:

* login succeeds
* failed login is handled
* authenticated pages are protected
* authentication survives refresh appropriately
* logout works
* invalid/expired authentication returns the user to login
* frontend does not contain backend secrets

### Review 11 — Regression

Confirm Phase 1 still works:

* backend health endpoint
* MongoDB connection
* frontend startup
* frontend build
* API communication
* existing configuration

### Review 12 — Automated tests

Run the complete Phase 2 test suite.

The expected Phase 2 result should be approximately **17 passing tests** based on the implemented scope.

Do not modify tests simply to make them pass.

If something fails, explain the actual failure.

### Final report

Return a concise but detailed report with:

```text
PHASE 2 REVIEW

Authentication: PASS/FAIL
JWT: PASS/FAIL
Password Security: PASS/FAIL
Role Authorization: PASS/FAIL
Tenant Isolation: PASS/FAIL
Platform Admin: PASS/FAIL
User Management: PASS/FAIL
Seed Data: PASS/FAIL
Frontend Auth: PASS/FAIL
Regression: PASS/FAIL
Tests: PASS/FAIL
TypeScript: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL

Critical Issues:
...

Non-Critical Issues:
...

Overall:
READY / NOT READY
```

If anything is unsafe or incorrect, clearly identify it.

Do not make changes during this review.

---

## PROMPT 3 — Phase 2 Final Validation Before Commit

Phase 2 has been reviewed and the implementation is believed to be correct.

Perform one final validation pass before the Phase 2 Git commit.

This is a **pre-commit validation only**.

Do not add new features.

Do not begin Phase 3.

Do not make unnecessary refactors.

### Validate the complete Phase 2 scope

Confirm that the project has:

* Brokerage model
* User model
* four roles
* Platform Admin handling
* bcrypt password hashing
* JWT authentication
* `/me` or equivalent authenticated-user endpoint
* authentication middleware
* role authorization middleware
* user-management endpoints
* strict brokerage isolation
* seed data for 2 brokerages and 7 users
* frontend login
* protected frontend page
* logout
* authentication refresh behavior
* automated tests

### Security validation

Explicitly verify:

* no plaintext passwords
* no password hashes in API responses
* no secrets in source code
* no JWT secret committed
* no database credentials committed
* cross-brokerage requests are rejected
* brokerage ID cannot be spoofed through request input
* unauthorized roles are rejected by backend middleware
* invalid JWTs are rejected
* expired JWTs are rejected

### Run final checks

Run:

1. backend tests
2. frontend checks
3. TypeScript checks
4. lint
5. production build

Do not stop at "tests pass" if TypeScript, lint, or build fails.

### Git check

Before committing:

```bash
git status
git diff
```

Inspect the diff.

Make sure:

* only intended Phase 2 files are changed
* no secrets are present
* no generated/unnecessary files are included
* no Phase 3 work is accidentally included

Do not commit unrelated changes.

### Final output

Report:

* tests
* TypeScript
* lint
* build
* security checks
* tenant-isolation checks
* Git status
* files changed
* whether the phase is safe to commit

Only after all checks pass should the phase be considered complete.

Do not create the commit yourself unless explicitly instructed.

---

## PHASE 2 RESULT

Phase 2 was successfully completed and approved.

Verified scope included:

* Brokerage model
* User model
* four roles
* JWT authentication
* bcrypt password hashing
* authentication/authorization middleware
* strict brokerage-level tenant isolation
* user endpoints
* seed data for 2 brokerages and 7 users
* frontend login/protected route/logout
* cross-brokerage access denial
* role protection
* invalid/expired JWT rejection
* database seed verification
* frontend refresh/logout verification
* password-field protection
* secret protection

The Phase 1–2 implementation was subsequently committed as:

`c3029be`

This commit represents the completed Phase 1 + Phase 2 foundation.
# PART 3 — PHASE 3: LEADS, PIPELINE, WEBHOOKS, DUPLICATE DETECTION & REALTIME

## PROMPT 1 — Build Phase 3: Lead Management & Multi-Tenant Pipeline

We are continuing the LeadFlow assignment.

Project:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Phase 1 and Phase 2 are already completed and approved.

Do not rewrite the existing authentication, user, brokerage, or tenant-isolation foundation.

Before implementing anything, inspect the current codebase and understand how:

* authentication works
* users are represented
* brokerage isolation works
* JWT middleware works
* role middleware works
* MongoDB/Mongoose is configured
* frontend authentication works

Phase 3 is focused on the **lead pipeline and realtime lead management**.

---

# Phase 3 goal

Implement a brokerage-scoped lead management system with:

* lead creation
* lead listing
* lead details
* lead updates
* pipeline statuses
* lead assignment
* advisor/brokerage lookups
* duplicate detection
* external webhook intake
* webhook authentication
* webhook idempotency
* optimistic concurrency protection
* realtime updates using Socket.IO
* frontend pipeline board

All lead data must remain strictly isolated by brokerage.

---

# 1. Lead model

Create a Mongoose `Lead` model.

A lead should contain the information necessary for the assignment and future client conversion.

Include appropriate fields such as:

* firstName
* lastName
* email
* phone
* normalized email
* normalized phone
* source
* status
* brokerageId
* assignedAdvisorId where applicable
* external/event identifier where needed
* timestamps

Do not duplicate fields unnecessarily.

Use appropriate indexes for fields that will be used frequently for:

* brokerage filtering
* duplicate detection
* sorting
* external event/idempotency handling

Every lead must belong to exactly one brokerage.

The brokerage must not be arbitrarily selectable by an ordinary user.

---

# 2. Pipeline statuses

Implement exactly these pipeline stages:

```text
NEW
CONTACTED
QUALIFIED
APPLICATION
WON
LOST
```

The frontend should present these as a pipeline.

Use a consistent representation across:

* database
* backend validation
* API
* frontend

Do not use arbitrary strings for statuses.

Reject invalid status values.

---

# 3. Lead CRUD

Implement the necessary lead endpoints.

At minimum:

* create lead
* list leads
* get lead
* update lead
* update lead status
* assign lead
* retrieve available advisors where needed

All lead endpoints must enforce authentication and brokerage isolation.

A normal brokerage user must never be able to:

* read another brokerage's lead
* modify another brokerage's lead
* assign another brokerage's lead
* move another brokerage's lead through the pipeline
* delete another brokerage's lead

Do not trust a brokerage ID supplied by the frontend.

Use the authenticated user's brokerage scope.

---

# 4. Role behavior

Respect the Phase 2 roles.

### Platform Admin

Platform-level access as appropriate.

### Brokerage Admin

Can manage leads belonging to their brokerage.

### Advisor

Can manage leads belonging to their brokerage.

For this assignment, advisors should not be artificially restricted to only leads explicitly assigned to them unless there is a specific requirement to do so.

They should be able to work with brokerage-wide leads.

### Client

A client should not be allowed to create or manipulate internal leads.

The client role will later receive its own client portal.

Do not implement future client functionality prematurely.

---

# 5. Lead creation

Implement authenticated lead creation.

Required validation should include appropriate validation for:

* name
* email
* phone
* status if supplied
* brokerage scope

Normalize contact information before duplicate checking.

For example:

### Email

Trim whitespace and normalize casing.

### Phone

Normalize into a consistent comparison representation.

The exact normalization should be reasonable for the assignment and documented.

Do not destroy the original user-facing values unnecessarily.

---

# 6. Duplicate detection

Implement duplicate detection within the brokerage.

The primary duplicate signals are:

* normalized email
* normalized phone

The important rule is:

**Duplicate detection must be brokerage-scoped.**

For example:

```text
Brokerage A
john@example.com -> existing lead

Brokerage A
john@example.com -> duplicate

Brokerage B
john@example.com -> allowed
```

A person existing in Brokerage A must not automatically prevent the same person from being a lead in Brokerage B.

When a duplicate is detected, return a clear API response.

Use an appropriate status code, such as `409 Conflict`, where appropriate.

Do not silently create duplicate leads.

---

# 7. External webhook lead intake

Implement a generic webhook endpoint that can receive leads from an external source.

The endpoint should support an authenticated brokerage-specific webhook flow.

The webhook must not accept arbitrary brokerage IDs from the request body as the source of tenant identity.

Instead, determine the brokerage from the authenticated/validated webhook credential.

For example:

```text
webhook token -> brokerage
```

rather than:

```text
request.body.brokerageId -> brokerage
```

This is important for tenant isolation.

---

# 8. Webhook authentication

Each brokerage should have its own webhook credential/token.

Implement secure token handling.

Do not store or expose raw webhook secrets unnecessarily.

Use a secure representation such as a hash for stored webhook credentials where appropriate.

The incoming webhook should be mapped to the correct brokerage using the credential.

Invalid credentials must be rejected.

A webhook belonging to Brokerage A must never create a lead in Brokerage B.

---

# 9. Webhook token rotation

Implement the ability to rotate/regenerate the brokerage webhook token where appropriate.

The old token should stop working after rotation.

The new token should work.

Do not expose the raw token unnecessarily through ordinary API responses.

Document how the development/test webhook credential is obtained.

Do not commit production secrets.

---

# 10. Webhook idempotency

External systems can retry webhook deliveries.

The same event must therefore not create duplicate leads.

Support an event identifier such as:

```text
eventId
```

or an equivalent stable external submission ID.

Store enough information to recognize a previously processed event.

The behavior should be:

```text
first request -> process lead
same event again -> do not create another lead
```

The second request should return an appropriate idempotent response.

This must be safe even when requests are retried.

---

# 11. Concurrency / stale update protection

Implement optimistic concurrency protection for lead updates.

The frontend may retrieve a lead at time A and attempt to update it later.

If another request has already changed the lead, the stale update should not silently overwrite the newer state.

Support a version/timestamp expectation such as:

```text
expectedUpdatedAt
```

or an equivalent mechanism.

If the client's expected version/timestamp does not match the current record:

Return:

`409 Conflict`

Do not overwrite the newer record.

This is particularly important for pipeline changes.

---

# 12. Lead assignment

Implement lead assignment to an advisor.

Verify that:

* the advisor exists
* the advisor belongs to the same brokerage
* unauthorized cross-brokerage assignment is rejected

Do not allow an arbitrary advisor ID from another brokerage to be attached to a lead.

---

# 13. Socket.IO realtime updates

Add realtime lead updates using Socket.IO.

The realtime architecture must respect brokerage isolation.

Users should join a room representing their brokerage.

For example:

```text
brokerage:<brokerageId>
```

Do not broadcast sensitive lead information globally.

When a lead changes, notify only the appropriate brokerage room.

Events should be emitted for relevant actions such as:

* lead created
* lead updated
* status changed
* assignment changed

Keep the event payload reasonably small.

Do not broadcast password/authentication data or other sensitive information.

---

# 14. Frontend pipeline

Build the first usable lead pipeline UI.

The UI should display:

```text
NEW
CONTACTED
QUALIFIED
APPLICATION
WON
LOST
```

Leads should be grouped by status.

Each lead card should show useful information such as:

* name
* email/phone as appropriate
* source
* assigned advisor
* status

Keep the initial design simple.

This is functionality-first.

Do not spend excessive time on visual polish yet.

---

# 15. Pipeline interactions

The frontend should support the necessary lead operations.

At minimum:

* load leads
* display pipeline
* create lead where the role allows it
* update status
* assign advisor where permitted
* reflect updates from realtime events

The frontend must handle:

* loading
* empty state
* API errors
* unauthorized responses
* duplicate responses
* stale update conflicts

Do not silently hide API errors.

---

# 16. Realtime frontend behavior

Connect the frontend to Socket.IO after authentication.

Join the correct brokerage room.

When an event is received:

* update the appropriate lead
* add newly created leads
* move leads when status changes
* update assignment changes
* avoid creating duplicate records in the UI

Do not blindly append every incoming event.

Handle idempotent/repeated realtime events safely.

---

# 17. Security requirements

Review all Phase 2 security boundaries.

Every lead-related backend endpoint must verify:

1. authentication
2. role
3. brokerage scope
4. resource ownership/tenant relationship where appropriate

Never trust these values merely because they came from the frontend:

* brokerageId
* userId
* advisorId
* leadId
* status
* webhook brokerage identity

Validate them on the server.

---

# 18. Testing

Add comprehensive tests for Phase 3.

Test:

### Lead creation

* valid lead creation
* invalid input
* correct brokerage assignment

### Lead listing

* authenticated user can list their brokerage leads
* another brokerage's leads are excluded

### Lead access

* same-brokerage access succeeds
* cross-brokerage access fails

### Status

* valid status update
* invalid status rejected

### Assignment

* valid advisor assignment
* advisor from another brokerage rejected

### Duplicate detection

* duplicate email in same brokerage rejected
* duplicate phone in same brokerage rejected
* same email/phone in different brokerage allowed

### Webhook

* valid webhook accepted
* invalid token rejected
* correct brokerage derived from token
* body cannot override brokerage
* webhook lead created successfully
* repeated event does not create another lead

### Token rotation

* old token rejected after rotation
* new token accepted

### Concurrency

* stale update returns `409`
* current update succeeds

### Realtime

* appropriate brokerage room receives events
* other brokerage does not receive the event

Do not reduce test coverage merely to make the suite pass.

---

# 19. Phase 3 scope control

Do not implement:

* client conversion
* document uploads
* document verification
* email automation
* task automation
* dashboard aggregation
* Tally-specific integration
* production deployment

Those belong to later phases.

The generic webhook in this phase is enough.

Keep the implementation focused on:

**Leads + Pipeline + Duplicate Detection + Generic Webhook + Realtime.**

---

# 20. Validation before review

Run:

* backend tests
* frontend tests/checks
* TypeScript
* lint
* frontend production build
* backend production/build checks where applicable

Also manually verify:

* two brokerages
* two different users
* lead isolation
* duplicate detection
* webhook
* pipeline updates
* realtime updates

Do not commit yet.

At the end, report:

* files changed
* models
* routes
* middleware
* webhook behavior
* duplicate behavior
* realtime behavior
* tests
* TypeScript
* lint
* build
* known issues

---

## PROMPT 2 — Phase 3 Review / Security / Multi-Tenant Audit

Phase 3 implementation is complete.

Perform a read-only audit.

Do not modify files.

Do not commit.

Review the implementation against the complete Phase 3 requirements.

---

### Lead model audit

Verify:

* Lead model exists
* all required fields exist
* status is constrained to the six pipeline states
* brokerageId is present
* advisor assignment is represented correctly
* normalized email exists or equivalent duplicate-safe handling exists
* normalized phone exists or equivalent duplicate-safe handling exists
* appropriate indexes exist

---

### Tenant isolation audit

This is a critical security review.

Use at least two brokerages.

Test:

```text
Brokerage A user -> Brokerage A lead
Brokerage A user -> Brokerage B lead
Brokerage B user -> Brokerage A lead
```

The cross-brokerage requests must fail.

Also test attempts to manipulate:

```text
brokerageId
advisorId
leadId
```

through request bodies/query parameters/URLs.

Verify that server-side authorization prevents tenant escape.

---

### Lead CRUD audit

Verify:

* create
* list
* get
* update
* status change
* assignment

Check appropriate role restrictions.

Check validation and error handling.

---

### Duplicate detection audit

Test:

```text
Same brokerage + same email = duplicate
Same brokerage + same phone = duplicate
Different brokerage + same email = allowed
Different brokerage + same phone = allowed
```

Verify normalization.

For example, email case/whitespace differences should not accidentally bypass duplicate detection.

Verify duplicate responses are clear and use the intended conflict semantics.

---

### Webhook security audit

This is one of the highest-priority checks.

Verify:

* webhook token is required
* invalid token is rejected
* token maps to a specific brokerage
* request body cannot override brokerage identity
* valid webhook creates a lead in the correct brokerage
* another brokerage cannot use the wrong token
* secrets are not exposed

Inspect how webhook credentials are stored.

Do not expose raw secrets in normal responses.

---

### Webhook token rotation audit

Verify:

```text
old token -> accepted before rotation
rotate token
old token -> rejected
new token -> accepted
```

---

### Webhook idempotency audit

Send the same event twice.

Expected:

```text
request 1 -> lead created
request 2 -> no duplicate lead
```

Verify this is based on a stable event identifier and not only on a fragile in-memory variable.

---

### Concurrency audit

Test:

```text
GET lead
change lead from request A
attempt stale update from request B
```

Expected:

`409 Conflict`

The stale update must not overwrite the newer data.

---

### Realtime audit

Verify:

* authenticated users connect
* users join the correct brokerage room
* lead creation emits the correct event
* status changes emit the correct event
* assignment changes emit the correct event
* other brokerages do not receive the event

Do not accept a design that broadcasts all lead events globally.

---

### Frontend pipeline audit

Verify:

* six pipeline columns
* leads displayed in correct status
* create lead behavior
* status update
* assignment
* realtime refresh
* loading state
* empty state
* error state
* duplicate error handling
* stale update handling

---

### Regression audit

Verify Phase 1 and Phase 2 still work.

Run the complete test suite.

The Phase 3 implementation should result in the expected **36 tests passing by the end of Phase 4**, with the Phase 3-specific functionality covered before proceeding.

Do not modify tests simply to achieve a green result.

---

### Code quality audit

Check for:

* duplicated authorization logic
* unsafe casts
* unvalidated request data
* missing brokerage filters
* broad database queries
* secrets in source code
* global Socket.IO broadcasts
* inconsistent status values
* fragile duplicate detection
* webhook replay vulnerabilities
* race conditions

---

### Review output

Return:

```text
PHASE 3 REVIEW

Lead Model: PASS/FAIL
Lead CRUD: PASS/FAIL
Pipeline Statuses: PASS/FAIL
Tenant Isolation: PASS/FAIL
Duplicate Detection: PASS/FAIL
Webhook Authentication: PASS/FAIL
Webhook Token Rotation: PASS/FAIL
Webhook Idempotency: PASS/FAIL
Optimistic Concurrency: PASS/FAIL
Socket.IO Isolation: PASS/FAIL
Frontend Pipeline: PASS/FAIL
Regression: PASS/FAIL
Tests: PASS/FAIL
TypeScript: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL

Critical Issues:
...

Non-Critical Issues:
...

Overall:
READY / NOT READY
```

Do not modify anything during this review.

---

## PROMPT 3 — Phase 3 Final Validation Before Commit

Phase 3 has been reviewed.

Perform the final pre-commit validation.

Do not add new features.

Do not start Phase 4.

Do not redesign the UI.

---

### Verify the complete Phase 3 checklist

Confirm:

* Lead model
* six pipeline statuses
* lead CRUD
* lead assignment
* brokerage isolation
* normalized email
* normalized phone
* duplicate detection
* generic webhook
* brokerage-specific webhook authentication
* webhook token hashing/storage approach
* token rotation
* webhook event idempotency
* optimistic concurrency
* Socket.IO
* brokerage rooms
* frontend pipeline
* realtime frontend updates
* error/loading/empty states

---

### Security checks

Explicitly test:

* Brokerage A cannot read Brokerage B leads
* Brokerage A cannot modify Brokerage B leads
* Brokerage A cannot assign Brokerage B advisors
* request body cannot override brokerage scope
* invalid webhook token rejected
* webhook token cannot select arbitrary brokerage
* repeated webhook event does not duplicate
* stale update returns `409`
* realtime event does not leak to another brokerage

---

### Run complete checks

Run:

1. backend tests
2. frontend tests/checks
3. TypeScript
4. lint
5. frontend build
6. backend build/checks

Inspect all failures rather than ignoring them.

---

### Git inspection

Run:

```bash
git status
git diff
```

Verify:

* only intended Phase 3 changes are present
* no secrets
* no generated files
* no unrelated refactors
* no Phase 4 implementation
* no temporary debugging code

Do not commit automatically.

Report whether the phase is safe to commit.

---

## PHASE 3 RESULT

Phase 3 was completed and approved.

The implementation included:

* brokerage-scoped Lead model
* six lead pipeline statuses
* lead CRUD
* lead assignment
* normalized email/phone duplicate detection
* generic external webhook intake
* brokerage-specific webhook authentication
* webhook token rotation
* event idempotency
* optimistic concurrency using expected update state
* Socket.IO brokerage rooms
* realtime lead updates
* frontend pipeline board
* strict tenant isolation

The Phase 3 implementation was committed as:

`39f3150`

Commit message:

`feat: add brokerage-scoped lead pipeline`

The implementation was subsequently used as the foundation for the later client/document phase.



# PART 4 — PHASE 4: CLIENT CONVERSION, CLIENT PORTAL, DOCUMENTS & BACKGROUND VERIFICATION


# PROMPT — Build Phase 4: Lead-to-Client Conversion, Client Portal, Private Documents & Background Verification

We are continuing the LeadFlow assignment.

Project path:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Phase 1, Phase 2, and Phase 3 are already completed and approved.

Do not rewrite the existing authentication, tenant-isolation, lead pipeline, webhook, duplicate-detection, or Socket.IO foundations.

Before making changes, inspect the existing implementation and understand how the current:

* User model
* Brokerage model
* Lead model
* authentication
* authorization
* tenant isolation
* lead routes
* Socket.IO
* frontend authentication
* frontend pipeline

work.

The goal of this phase is to implement the next major workflow:

**Lead → Client → Client Login → Private Document Upload → Background Verification → Realtime Status Updates**

The implementation should remain assignment-focused. Do not introduce unnecessary infrastructure.

---

## 1. Lead → Client conversion

Implement the ability to convert a qualified lead into a client.

The conversion should:

* create a Client record/profile
* preserve the relationship to the original Lead
* preserve brokerage ownership
* prevent cross-brokerage conversion
* prevent invalid/unauthorized users from converting leads
* avoid accidentally creating multiple client records for the same lead

The client must belong to the same brokerage as the original lead.

The relationship should be explicit so that the system can determine:

```text
Lead → Client
```

Do not simply copy data and lose the relationship.

---

## 2. Client model

Create an appropriate Mongoose Client model.

At minimum, the client should have enough information to support:

* identity/contact information
* brokerageId
* relationship to the originating lead
* client account/authentication relationship where appropriate
* timestamps

The design should allow the client to later access their own mortgage case and documents.

Do not duplicate authentication logic unnecessarily.

If the existing User model can safely represent the client login identity, reuse it rather than creating a second unrelated authentication system.

The important requirement is that the client has a secure login and can only access their own case/documents.

---

## 3. Client role

Use the existing:

`CLIENT`

role from Phase 2.

Do not create another role.

A client belongs to one brokerage.

A client must only be able to access:

* their own client profile
* their own case
* their own documents
* their own document statuses

A client must never be able to:

* access another client's documents
* access another brokerage's clients
* access internal advisor/admin data
* list arbitrary documents
* modify another client's records

Tenant isolation must be enforced server-side.

---

# 4. Client authentication

Implement the client login flow using the existing JWT authentication system.

A converted client should be able to log in using credentials associated with their client account.

The authentication flow must integrate with the existing Phase 2 auth system.

Do not create a separate authentication architecture unless there is a strong technical reason.

After login, the client should be able to reach a protected client portal.

The backend must identify the authenticated client from the JWT/authentication context.

Do not trust a client ID supplied by the browser to determine whose documents are shown.

---

# 5. Client portal

Create a basic protected client portal.

The portal should show information relevant to the logged-in client.

At minimum:

* client identity
* case/lead information where appropriate
* document list
* document upload functionality
* document verification status

The client should never see internal brokerage administration functionality.

Do not expose:

* other clients
* advisor management
* brokerage administration
* internal webhook configuration
* internal automation configuration

Use the existing authentication and role-aware routing architecture.

The UI can remain functional and relatively simple at this stage. The major UI polish will happen later.

---

# 6. Document model

Create a Mongoose `Document` model.

A document should contain enough information to represent uploaded mortgage documents.

At minimum include fields such as:

* clientId
* brokerageId
* document type/category
* original filename
* storage key/path
* upload status
* verification status
* failure information where needed
* timestamps

The exact field names are up to the implementation, but keep the model clean and extensible.

Possible document types include examples such as:

* payslip
* identity document
* bank statement
* tax document
* other supporting document

Do not require an unnecessarily complex document taxonomy.

---

# 7. Private document storage

Use the agreed storage solution:

**Supabase S3-compatible private storage**

The bucket must remain private.

Do NOT make the bucket public just to simplify access.

The application should use the S3-compatible API to upload/access private files.

Storage credentials must come from environment variables.

Never commit:

* access keys
* secret keys
* service credentials
* bucket secrets

to Git.

---

# 8. Upload architecture

The assignment specifically says that a client may need to upload approximately:

**15–40 documents**

and the upload screen must not be blocked by document verification.

Design the upload flow accordingly.

The upload should return quickly after the document is successfully stored/registered.

Do NOT make the HTTP upload request wait for a potentially slow verification process.

The conceptual flow should be:

```text
Client selects document
        ↓
Upload document
        ↓
Store in private storage
        ↓
Create document record
        ↓
Return successful upload response
        ↓
Document status becomes CHECKING
        ↓
Background verification runs
        ↓
VERIFIED / FAILED
        ↓
Realtime status update
```

The user should be able to continue uploading other documents while verification happens in the background.

---

# 9. Upload status / verification status

Implement appropriate document states.

At minimum support:

```text
UPLOADED
CHECKING
VERIFIED
FAILED
```

Use a consistent enum/value representation across:

* MongoDB
* backend
* API
* frontend

Do not allow arbitrary status strings.

The lifecycle should be clear:

```text
UPLOADED
   ↓
CHECKING
   ↓
VERIFIED
```

or:

```text
CHECKING
   ↓
FAILED
```

A retry may return a failed document to:

```text
CHECKING
```

before another verification attempt.

---

# 10. Background verification

Implement a lightweight background verification mechanism.

The assignment does not require a production-grade distributed queue.

Do NOT introduce:

* Kafka
* RabbitMQ
* Redis/BullMQ
* microservices
* Kubernetes
* unnecessary infrastructure

unless absolutely required.

A lightweight in-process/background mechanism is acceptable for this assignment.

The important requirement is that verification does not block the upload request.

The verifier can simulate checking.

For example, it can:

* wait for a short configurable delay
* inspect basic file/document metadata
* simulate success/failure
* update the document status

The exact verification logic can be intentionally simple.

The architecture matters more than sophisticated document AI.

---

# 11. Failure handling

The background verification system must support failure.

A document may become:

```text
FAILED
```

with an appropriate error/failure reason.

Do not leave documents permanently stuck in:

```text
CHECKING
```

without an explanation.

Provide a reasonable retry mechanism.

Retry should be safe and should not create duplicate document records.

---

# 12. Idempotency

Document verification must be safe against repeated processing.

If the same document is accidentally processed more than once:

* do not create duplicate documents
* do not corrupt status
* do not create conflicting final states unnecessarily

Use an appropriate identifier/status transition check.

The upload itself should also avoid accidental duplicate processing where practical.

---

# 13. Private file access

Because the storage bucket is private, do not expose permanent public file URLs.

Use a secure mechanism for accessing documents.

A suitable approach is a short-lived signed URL.

The backend should verify that the authenticated user has permission to access the requested document before generating/accessing the signed URL.

For clients:

```text
authenticated client
    ↓
request own document
    ↓
server verifies ownership
    ↓
server generates short-lived signed URL
    ↓
client accesses private file
```

Do not allow:

```text
/client/documents/:randomDocumentId
```

to bypass authorization.

---

# 14. Advisor/Admin document access

Appropriate brokerage users should be able to view documents belonging to clients within their brokerage.

At minimum:

* Brokerage Admin
* Advisor

should be able to access relevant client documents according to their role.

They must still be restricted by brokerage.

A Brokerage A advisor must never access a Brokerage B client's document.

Platform Admin behavior should follow the established platform-level authorization model.

---

# 15. Client document upload authorization

Only appropriate authenticated users should be able to upload documents.

A client may upload documents only for their own client record.

Do not allow the client to submit:

```text
clientId = someone else's client ID
```

and upload into that account.

The backend must derive/verify ownership from authentication.

Advisor/Admin upload behavior can be supported if useful, but do not expand the scope unnecessarily.

---

# 16. Realtime document status

Use the existing Socket.IO infrastructure.

When document verification status changes, emit a realtime event to the appropriate brokerage/client audience.

The event should allow the frontend to update the document status without requiring a full page refresh.

Maintain brokerage isolation.

Do not broadcast document information globally.

For a client, only their own document status should be visible.

For an advisor/admin, only documents belonging to their authorized brokerage should be visible.

---

# 17. Client portal realtime behavior

When a document changes:

```text
UPLOADED
→ CHECKING
→ VERIFIED
```

or:

```text
CHECKING
→ FAILED
```

the client portal should update the status.

The user should not need to manually refresh the page to see the result.

Handle repeated events safely.

Do not duplicate document rows when the same realtime event is received more than once.

---

# 18. Document API

Implement appropriate authenticated endpoints.

The exact route names can follow the existing project conventions.

The API should support the necessary operations such as:

* create/upload document
* list documents for current client
* retrieve document metadata
* retrieve secure access URL
* retry failed verification
* retrieve documents for authorized advisor/admin users

All endpoints must enforce:

* authentication
* role authorization
* brokerage isolation
* client ownership where applicable

---

# 19. Lead conversion API

Create a protected endpoint for converting a lead to a client.

Verify:

* lead exists
* lead belongs to authenticated user's brokerage
* user has permission to convert
* lead has not already been converted
* client is created consistently
* client account is created/linked appropriately
* relevant lead state is updated

The operation should be safe if the request is repeated.

Do not create multiple client records from repeated conversion requests.

---

# 20. Lead/client relationship

After conversion, the system should maintain a clear relationship between:

```text
Brokerage
    ↓
Lead
    ↓
Client
    ↓
Documents
```

Every level must preserve tenant isolation.

Example:

```text
Brokerage A
  ├── Lead A
  │     └── Client A
  │           ├── Document A
  │           └── Document B
  │
  └── Lead B
        └── Client B
              └── Document C
```

A Brokerage B user must not be able to access any of these Brokerage A records.

---

# 21. Frontend document UX

Build a simple functional document interface.

Show:

* document name
* document type
* upload status
* verification status
* failure reason where appropriate
* retry action for failed documents where permitted
* upload control

Make it obvious when a document is:

```text
UPLOADED
CHECKING
VERIFIED
FAILED
```

The UI should not freeze while verification occurs.

The client should be able to continue uploading documents.

Do not over-engineer the UI yet.

---

# 22. Loading and error handling

Handle:

* upload loading
* upload failure
* document listing loading
* document access failure
* verification failure
* retry failure
* unauthorized access
* expired authentication

Do not leave the user with a permanently spinning interface.

The upload operation and verification operation must be represented separately.

---

# 23. Testing requirements

Add comprehensive tests for Phase 4.

At minimum test:

### Lead conversion

* valid conversion succeeds
* unauthorized user cannot convert
* cross-brokerage conversion fails
* already-converted lead cannot create another client

### Client authentication

* client can log in
* invalid credentials fail
* client receives appropriate authenticated identity

### Client portal authorization

* client can access own client data
* client cannot access another client's data
* client cannot access another brokerage's data

### Documents

* document upload succeeds
* document belongs to correct client
* document belongs to correct brokerage
* unauthorized document access fails
* cross-brokerage document access fails
* advisor/admin access works for their brokerage

### Private storage

Verify the application uses private storage.

Do not change the bucket to public.

Test the signed/private access mechanism where practical.

### Background verification

Test:

```text
upload
→ CHECKING
→ VERIFIED
```

and:

```text
upload
→ CHECKING
→ FAILED
```

### Retry

Verify a failed document can be retried safely.

### Idempotency

Verify repeated processing does not create duplicate documents or inconsistent records.

### Realtime

Verify document status events reach the appropriate audience.

Verify another brokerage does not receive those events.

---

# 24. Security requirements

This phase contains sensitive documents, so security is critical.

Verify:

* storage bucket remains private
* storage credentials are environment variables
* no credentials are committed
* client ownership is enforced server-side
* brokerage ownership is enforced server-side
* document IDs cannot bypass authorization
* signed URLs are short-lived
* unauthorized users cannot generate document URLs
* advisor/admin access is brokerage-scoped
* client access is self-scoped
* document metadata does not expose sensitive information unnecessarily

Never solve an authorization problem by making storage public.

---

# 25. Preserve existing functionality

Do not break:

* Phase 1 health endpoint
* Phase 2 authentication
* Phase 2 role authorization
* tenant isolation
* Phase 3 leads
* duplicate detection
* webhook intake
* pipeline
* Socket.IO lead events

Run the existing test suite.

The Phase 4 work should build on top of the existing foundation.

---

# 26. Scope control

Do NOT implement the following yet:

* email templates
* email stage triggers
* advisor task automation
* dashboard aggregation
* Tally-specific integration
* production deployment
* Netlify/Vercel configuration
* final UI redesign

Those belong to later phases.

Keep this phase focused on:

**Lead → Client → Client Authentication → Private Documents → Background Verification → Realtime Status**

---

# 27. Validation

Before considering Phase 4 complete, run:

* complete backend test suite
* frontend checks
* TypeScript
* lint
* frontend build
* backend build/checks

Also manually verify the complete workflow:

```text
Advisor/Admin logs in
        ↓
Creates/uses a lead
        ↓
Converts lead to client
        ↓
Client logs in
        ↓
Client uploads document
        ↓
Upload completes quickly
        ↓
Document becomes CHECKING
        ↓
Client can continue using/uploading
        ↓
Background verification completes
        ↓
Document becomes VERIFIED or FAILED
        ↓
Client sees updated status without refresh
```

Also verify the security workflow:

```text
Brokerage A client
        ↓
can access own documents

Brokerage A client
        ↓
cannot access Brokerage B documents

Brokerage A advisor
        ↓
can access authorized Brokerage A documents

Brokerage A advisor
        ↓
cannot access Brokerage B documents
```

---

# 28. Git requirements

Do not commit automatically.

Before committing, inspect:

```bash
git status
git diff
```

Ensure:

* no secrets
* no credentials
* no generated files
* no unrelated changes
* no Phase 5 functionality
* no public storage configuration

At the end, report:

* files created
* files modified
* models added
* routes added
* storage implementation
* background verification implementation
* realtime implementation
* tests
* TypeScript
* lint
* build
* manual workflow result
* known limitations

Do not claim Phase 4 is complete unless the complete lead-to-client-to-document workflow works.


# PART 5 — PHASE 5: EMAIL AUTOMATION & ADVISOR TASKS

> **Recovery note:** The original `PROMPTS.md` file was empty. This is a detailed reconstruction of the main Phase 5 implementation prompt based on the actual LeadFlow implementation, assignment requirements, and verification history. It is not claimed to be the exact original wording.

---

# PROMPT — Build Phase 5: Email Templates, Stage Triggers, Email Logs & Advisor Tasks

We are continuing the LeadFlow assignment.

Project path:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Phases 1–4 are already completed and approved.

Do not rewrite or replace the existing:

* authentication
* JWT
* role authorization
* brokerage isolation
* leads
* pipeline
* duplicate detection
* webhooks
* Socket.IO
* client conversion
* client portal
* private document storage
* background document verification

This phase adds the assignment requirements for:

1. Email templates with placeholders
2. Stage-based email triggers
3. Email delivery/logging
4. Stage-based task triggers
5. Advisor task management
6. Realtime task updates

Keep the implementation practical and assignment-focused.

Do not introduce unnecessary infrastructure.

---

# 1. Email provider

Use **Resend** for transactional email delivery.

The project should already be prepared to use environment variables.

Use environment variables for:

```text id="d6tb8x"
RESEND_API_KEY
EMAIL_FROM
```

Do not hardcode either value.

Do not print the API key in logs.

Do not commit secrets.

Do not ask me to paste secret values into source files.

The implementation should work with the configured Resend account.

---

# 2. Email template model

Create an email template system.

Templates should belong to a brokerage where appropriate so different brokerages can configure their own email content.

A template should support fields such as:

* name/identifier
* subject
* body
* brokerageId
* active/enabled state
* timestamps

Keep the model simple.

Do not create a complex marketing/email platform.

---

# 3. Supported placeholders

Email templates must support placeholders.

Examples:

```text id="ydf0e3"
{{firstName}}
{{lastName}}
{{fullName}}
{{email}}
{{phone}}
{{status}}
{{brokerageName}}
{{advisorName}}
```

The exact set can be adjusted to the actual data model, but placeholders must be clearly defined.

The system must safely replace known placeholders.

Unknown placeholders should not cause the application to crash.

Do not execute arbitrary code from template content.

Do not treat template text as JavaScript.

---

# 4. Safe placeholder rendering

Implement a reusable template-rendering utility.

Example:

```text id="ik2p7m"
Template:

Hello {{firstName}},

Your application is currently in the {{status}} stage.
```

With data:

```text id="40p4xu"
firstName = Arya
status = Qualified
```

The result should be:

```text id="q0ydm2"
Hello Arya,

Your application is currently in the Qualified stage.
```

Handle:

* missing values
* unknown placeholders
* null/undefined values
* repeated placeholders

Do not throw unexpected runtime errors because a template contains an unsupported placeholder.

---

# 5. Email trigger configuration

Implement stage-based email triggers.

When a lead changes pipeline stage, the system should be able to trigger an email based on configured rules.

The assignment requires:

**Stage email triggers.**

For example:

```text id="m7v5ay"
NEW
→ send configured email

QUALIFIED
→ send configured email

APPLICATION
→ send configured email

WON
→ send configured email
```

The exact enabled stages should be configurable rather than hardcoded into frontend behavior.

---

# 6. Trigger ownership / brokerage isolation

Email automation must remain brokerage-scoped.

A brokerage should only use:

* its own templates
* its own trigger configuration
* its own leads
* its own client/advisor information

Brokerage A must never accidentally use Brokerage B's template or trigger configuration.

All backend queries must include appropriate brokerage filtering.

Do not trust a brokerage ID supplied by the frontend.

---

# 7. Stage-change integration

Integrate the email trigger with the existing lead status update flow.

When a lead changes status:

```text id="n7n6tq"
Lead status changes
        ↓
Validate status
        ↓
Update lead
        ↓
Emit realtime event
        ↓
Check email trigger
        ↓
Render configured template
        ↓
Send email through Resend
        ↓
Record result
```

Do not break the existing pipeline/realtime behavior.

Email automation should be an additional side effect of the status transition.

---

# 8. Email idempotency

Email triggers must not accidentally send the same stage email multiple times because of:

* duplicate API requests
* frontend retries
* realtime events
* webhook retries
* repeated processing

Implement an idempotency mechanism.

For example, identify an email-trigger event using a combination of:

* lead
* stage
* trigger/template
* transition/event identifier

The exact implementation is up to you.

The important requirement is:

**The same logical stage transition should not repeatedly send duplicate emails.**

---

# 9. Email logs

Create an email log model.

Record useful information such as:

* brokerageId
* lead/client reference
* recipient
* template
* trigger/stage
* provider message ID if available
* status
* error information
* timestamps

Possible statuses:

```text id="6m65o8"
PENDING
SENT
FAILED
```

Do not store unnecessary sensitive data.

Do not store the Resend API key.

---

# 10. Resend failure handling

If Resend fails:

* do not crash the entire lead status update
* record the email failure
* return/retain the successful lead update
* make the failure observable through the email log

The lead should not become stuck simply because an email provider is temporarily unavailable.

Use appropriate error handling.

Do not hide failures silently.

---

# 11. Email administration

Provide appropriate backend endpoints for managing email templates/triggers.

At minimum, authorized brokerage administrators should be able to:

* list templates
* create/update templates
* enable/disable templates or triggers
* view relevant email logs

Advisors should have only the access appropriate to the assignment.

Clients should not be able to configure brokerage email automation.

Platform Admin behavior should follow the existing platform-level authorization model.

---

# 12. Frontend email automation UI

Add a functional UI for brokerage administration.

It should allow an authorized user to:

* view templates
* create/edit a template
* see supported placeholders
* enable/disable automation
* view email delivery/log status where appropriate

Keep this UI functional rather than overly polished.

The dedicated UI/UX phase comes later.

---

# 13. Advisor task system

Implement advisor tasks.

A task should contain information such as:

* title
* description
* brokerageId
* leadId/clientId where relevant
* assigned advisor
* due date
* status
* timestamps

Possible task statuses:

```text id="fd32bq"
TODO
IN_PROGRESS
COMPLETED
```

Use a consistent enum.

---

# 14. Task ownership

Tasks must be brokerage-scoped.

A task belonging to Brokerage A must never be visible or editable by Brokerage B.

Advisors should be able to work with tasks belonging to their brokerage.

Where a task is assigned to a specific advisor, enforce the appropriate authorization rules.

Do not trust a brokerage ID supplied by the frontend.

---

# 15. Task creation

Support creating tasks from the appropriate advisor/admin workflows.

Tasks should be able to reference a lead or client where useful.

Validate that the referenced lead/client belongs to the same brokerage.

Do not allow:

```text id="z8w2d6"
Brokerage A task
    ↓
Brokerage B lead
```

---

# 16. Stage task triggers

The assignment requires:

**Stage task triggers.**

When a lead reaches a configured pipeline stage, the system should be able to create an advisor task.

Example:

```text id="0c1j4b"
Lead becomes QUALIFIED
        ↓
Create advisor task:
"Review qualified lead"
```

Another example:

```text id="0q3y6x"
Lead becomes APPLICATION
        ↓
Create advisor task:
"Review mortgage application"
```

The exact task text/configuration should be configurable where practical.

---

# 17. Task trigger configuration

Implement a simple configuration mechanism for stage-to-task triggers.

A configuration should support things such as:

* brokerage
* lead stage
* task title
* task description
* enabled state
* default assignee behavior where appropriate

Do not over-engineer this into a workflow engine.

The assignment only needs practical stage-based automation.

---

# 18. Task trigger idempotency

Repeated processing of the same stage transition must not create unlimited duplicate tasks.

For example:

```text id="mxj47f"
Lead becomes QUALIFIED
→ create task

Same transition processed again
→ do not create another identical task
```

Use a suitable event/transition identifier or equivalent idempotency strategy.

---

# 19. Advisor task API

Implement appropriate endpoints for:

* list tasks
* get task
* create task
* update task
* change task status
* assign/reassign task where authorized
* configure task triggers where authorized

Every endpoint must enforce:

* authentication
* role authorization
* brokerage isolation
* referenced lead/client ownership

---

# 20. Realtime task updates

Use the existing Socket.IO infrastructure.

When a task is:

* created
* updated
* completed
* reassigned

emit an appropriate realtime event to the correct brokerage audience.

Maintain the same tenant-isolation rules used for leads and documents.

Do not broadcast task data globally.

---

# 21. Frontend advisor task UI

Create a functional task interface.

It should allow advisors/admins to see:

* task title
* related lead/client
* assigned advisor
* due date
* task status

Support useful interactions such as:

* mark in progress
* complete
* create task
* assign task where authorized

Handle:

* loading
* empty state
* API errors
* realtime updates

Keep the styling consistent with the existing application.

Do not spend excessive time on visual polish.

---

# 22. Lead-stage automation architecture

The existing lead status update should become the central event point.

Conceptually:

```text id="qq0xj7"
Lead status update
        │
        ├── Update lead
        │
        ├── Emit lead realtime event
        │
        ├── Email trigger
        │      ├── Find configured trigger
        │      ├── Render template
        │      ├── Send via Resend
        │      └── Record email log
        │
        └── Task trigger
               ├── Find configured trigger
               ├── Create task
               └── Emit task event
```

Keep these responsibilities modular.

Do not put all automation logic directly inside a massive route handler.

Use services/helpers where appropriate.

---

# 23. Automation failure isolation

An automation failure must not corrupt the primary lead operation.

For example:

```text id="0k1x0q"
Lead status update succeeds
Email fails
Task creation succeeds
```

This should be represented accurately.

Likewise:

```text id="q2kqg6"
Lead status update succeeds
Email succeeds
Task creation fails
```

The lead should still retain the correct status.

Record failures so they can be diagnosed.

Do not roll back the lead update merely because an automation side effect failed unless there is a specific reason.

---

# 24. Role restrictions

Enforce appropriate role permissions.

At minimum:

### Platform Admin

Platform-level administration according to existing authorization rules.

### Brokerage Admin

Can manage:

* brokerage email templates
* email triggers
* email logs where permitted
* task triggers
* brokerage tasks

### Advisor

Can:

* view relevant tasks
* update assigned/authorized tasks
* create tasks where allowed
* work with brokerage leads/clients

Should not be able to change sensitive brokerage-wide automation configuration unless explicitly allowed.

### Client

Cannot:

* manage email templates
* manage automation
* create internal advisor tasks
* access email logs
* access another client's automation information

---

# 25. Testing requirements

Add comprehensive tests.

### Email templates

Test:

* template creation
* template retrieval
* template update
* brokerage isolation
* role restrictions

### Placeholder rendering

Test:

* known placeholders
* repeated placeholders
* missing values
* unknown placeholders
* null values
* safe rendering

### Stage email triggers

Test:

* configured stage trigger fires
* disabled trigger does not fire
* correct template selected
* correct recipient
* brokerage isolation
* duplicate transition does not send duplicate email

### Resend

Test with a mocked provider where appropriate.

Test:

* successful send
* provider failure
* email log creation
* failure log
* lead update remains successful if email fails

Also manually verify the real Resend integration later.

### Tasks

Test:

* task creation
* task update
* task completion
* assignment
* brokerage isolation
* role restrictions

### Stage task triggers

Test:

* configured trigger creates task
* disabled trigger does not create task
* correct stage
* correct brokerage
* repeated transition does not create duplicate tasks

### Realtime

Test:

* task events reach correct brokerage room
* another brokerage does not receive task data
* frontend updates correctly

### Regression

Run the complete test suite from Phases 1–4.

Do not reduce or remove existing tests to make the new suite pass.

---

# 26. Real Resend verification

Because Resend is an actual external integration, after the implementation is complete:

1. configure the required environment variables locally
2. use a safe test email address
3. trigger an actual stage transition
4. verify the email is received
5. verify the email content
6. verify placeholders were rendered
7. verify the email log was created
8. verify duplicate processing does not send repeated emails

Do not expose the API key in the terminal output or source code.

---

# 27. Preserve existing functionality

Do not break:

* authentication
* role authorization
* tenant isolation
* leads
* pipeline
* webhooks
* duplicate detection
* client conversion
* client portal
* document uploads
* background verification
* Socket.IO document/lead events

Run the full test suite after implementation.

---

# 28. Scope control

Do NOT implement yet:

* dashboard aggregation
* Tally-specific integration
* production Vercel deployment
* Netlify deployment
* final UI/UX redesign
* advanced distributed queues
* Redis
* Kafka
* microservices
* Kubernetes

Keep Phase 5 focused on:

**Email Templates + Stage Email Triggers + Email Logs + Advisor Tasks + Stage Task Triggers + Realtime Task Updates**

---

# 29. Validation before completion

Run:

* complete backend tests
* frontend checks
* TypeScript
* lint
* frontend build
* backend build/checks

Manually verify:

```text id="1k4a3w"
Lead changes stage
        ↓
Email trigger executes
        ↓
Template renders
        ↓
Resend sends email
        ↓
Email log created
```

And:

```text id="zq4j4x"
Lead changes stage
        ↓
Task trigger executes
        ↓
Advisor task created
        ↓
Task appears in advisor UI
        ↓
Socket.IO update received
```

Also verify:

* duplicate email triggers are prevented
* duplicate task triggers are prevented
* email failure does not break lead status update
* task failure does not corrupt lead status
* Brokerage A cannot access Brokerage B automation/tasks
* unauthorized roles cannot modify automation

---

# 30. Git requirements

Do not commit automatically.

Before considering the phase complete:

```bash id="wujyq0"
git status
git diff
```

Inspect the complete diff.

Ensure:

* no secrets
* no Resend API key
* no credentials
* no generated files
* no unrelated modifications
* no Phase 6 functionality

At the end, report:

* files created
* files modified
* email models/services/routes
* task models/services/routes
* trigger architecture
* Resend integration
* realtime events
* tests
* TypeScript
* lint
* build
* real email verification result
* known limitations

Do not claim Phase 5 is complete unless the email automation and advisor task workflows are actually functioning.


# PART 6 — PHASE 6: DASHBOARD, PIPELINE SUMMARY & FINAL HARDENING


# PROMPT — Build Phase 6: Fast Dashboard Pipeline Summary & Final Hardening

We are continuing the LeadFlow assignment.

Project path:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Phases 1–5 are already completed and approved.

Do not rewrite the existing architecture.

The application already contains:

* authentication
* JWT
* four roles
* brokerage isolation
* users
* leads
* pipeline
* duplicate detection
* generic webhook intake
* Socket.IO realtime updates
* lead → client conversion
* client authentication
* private document storage
* background document verification
* email templates
* stage email triggers
* email logs
* advisor tasks
* stage task triggers

This phase focuses on the assignment's dashboard requirement and final hardening of the existing functionality.

---

# 1. Dashboard requirement

Implement a fast dashboard summary for the lead pipeline.

The assignment requires:

**Pipeline numbers should load fast and never be stale.**

The dashboard should show counts for all lead stages:

```text id="6v9c3q"
NEW
CONTACTED
QUALIFIED
APPLICATION
WON
LOST
```

The counts must be scoped to the authenticated user's brokerage.

Do not calculate another brokerage's data.

---

# 2. Backend pipeline summary endpoint

Create a dedicated backend endpoint such as:

```text id="9x8q6z"
GET /api/leads/summary
```

Use the existing authentication and tenant-isolation middleware.

The endpoint should return the count for every supported pipeline status.

Example response shape:

```json id="q4m7y2"
{
  "NEW": 10,
  "CONTACTED": 5,
  "QUALIFIED": 4,
  "APPLICATION": 3,
  "WON": 2,
  "LOST": 1
}
```

The exact response structure can follow the project's existing conventions.

Important:

**The summary must be calculated server-side.**

Do not fetch every lead to the frontend and calculate counts in React.

---

# 3. Efficient database aggregation

Use MongoDB/Mongoose aggregation or another efficient server-side query strategy.

The query must:

1. filter by the authenticated user's brokerage
2. group by lead status
3. count records
4. return the six statuses
5. provide zero for statuses with no leads

Do not perform six completely independent full-database queries if one efficient aggregation can provide the result.

The brokerage filter must happen before aggregation/grouping.

Conceptually:

```text id="sl6qfr"
authenticated user
        ↓
brokerageId
        ↓
filter leads by brokerageId
        ↓
group by status
        ↓
count
        ↓
return all six statuses
```

---

# 4. Tenant isolation

This endpoint is especially important because dashboard data can accidentally leak aggregate information.

Verify:

```text id="k2f9xq"
Brokerage A dashboard
→ only Brokerage A counts

Brokerage B dashboard
→ only Brokerage B counts
```

A user must not be able to pass another brokerage ID and receive that brokerage's statistics.

Do not accept arbitrary `brokerageId` from the query string/body as the authority for the request.

Use the authenticated user's brokerage scope.

Platform Admin behavior should follow the existing platform-level access model.

---

# 5. Dashboard frontend

Update the existing dashboard to consume the new summary endpoint.

Display summary cards for:

* New
* Contacted
* Qualified
* Application
* Won
* Lost

The cards should show:

* stage name
* current count
* appropriate visual hierarchy

Keep the UI functional and consistent with the existing application.

Do not perform unnecessary redesign during this phase.

---

# 6. Pipeline and dashboard consistency

The dashboard summary and pipeline should remain consistent.

If a lead changes stage:

```text id="q7x0h3"
Lead:
NEW → QUALIFIED
```

the displayed pipeline and summary counts should eventually reflect:

```text id="6o4k8p"
NEW -1
QUALIFIED +1
```

Use the existing realtime infrastructure where appropriate.

Do not create a second independent realtime system.

---

# 7. Realtime summary updates

When lead events are received through Socket.IO:

* lead created
* lead updated
* status changed
* lead moved
* lead deleted if supported

ensure the dashboard does not remain stale.

A practical approach is to trigger a summary refresh after relevant lead events.

Do not blindly mutate counts without considering event duplication or missed events.

The server-side summary endpoint remains the source of truth.

---

# 8. Loading state

The dashboard should have an explicit loading state.

While the summary is loading:

* do not show misleading stale numbers as if they were current
* use appropriate loading placeholders/skeletons or a clear loading state
* avoid layout jumps where practical

Do not leave the dashboard permanently blank.

---

# 9. Empty state

If the brokerage has no leads:

```text id="4o9f0y"
NEW: 0
CONTACTED: 0
QUALIFIED: 0
APPLICATION: 0
WON: 0
LOST: 0
```

The pipeline should also communicate that there are currently no leads.

Do not treat zero leads as an API error.

---

# 10. Error handling

If the dashboard summary request fails:

* display a clear error state
* do not show incorrect counts
* allow retry where appropriate
* do not crash the application

Handle:

* authentication failure
* authorization failure
* network failure
* backend failure

appropriately.

---

# 11. Client role restrictions

Review the existing lead creation functionality.

A `CLIENT` must not be able to create internal brokerage leads.

The client role is intended for accessing their own client portal and documents.

If a client can currently reach a lead creation endpoint, fix the backend authorization.

Do not rely solely on hiding the button in React.

The API must reject unauthorized lead creation.

---

# 12. Role-aware dashboard behavior

Ensure the dashboard only exposes functionality appropriate to the authenticated role.

For example:

### Brokerage Admin

Can see brokerage-level lead pipeline information.

### Advisor

Can see brokerage-level lead pipeline information according to the existing assignment design.

### Client

Should not receive internal brokerage pipeline management functionality.

Do not leak aggregate brokerage information to clients.

---

# 13. API and frontend consistency

Verify that the frontend uses the correct production-compatible API structure.

Keep API URL handling centralized.

Do not hardcode multiple different backend URLs across components.

Do not introduce frontend secrets.

---

# 14. Dashboard performance

The dashboard summary should remain lightweight.

Do not:

* retrieve all leads just to calculate counts
* perform expensive client-side processing
* introduce unnecessary state libraries
* add Redis just for dashboard counts
* add a complicated caching layer

The assignment requires a working, fast product, not a distributed analytics platform.

A server-side MongoDB aggregation is sufficient for this scale.

---

# 15. Regression hardening

Use this phase to identify and fix only issues that directly affect correctness/security of the completed assignment.

Review:

* authentication
* tenant isolation
* lead authorization
* client authorization
* document authorization
* email/task authorization
* realtime brokerage rooms
* dashboard data isolation

Do not perform broad refactoring.

---

# 16. Testing requirements

Add tests for the dashboard summary endpoint.

At minimum:

### Summary correctness

Create known leads with different statuses and verify the returned counts.

Example:

```text id="q8j0wm"
NEW = 2
CONTACTED = 3
QUALIFIED = 1
APPLICATION = 4
WON = 5
LOST = 2
```

The endpoint should return the correct counts.

### Zero-count stages

If a status has no leads, verify that the endpoint still returns:

```text id="6j5m2a"
0
```

rather than omitting the status.

### Brokerage isolation

Create leads in two brokerages.

Verify:

```text id="b8j7v0"
Brokerage A summary
≠
Brokerage B data
```

Each brokerage should receive only its own counts.

### Spoofing

Attempt:

```text id="h0r3d8"
GET /api/leads/summary?brokerageId=<other-brokerage>
```

The request must not return the other brokerage's counts.

### Client authorization

Verify that a Client cannot create an internal lead.

### Realtime

Verify that relevant lead events cause the dashboard/pipeline to refresh or otherwise remain consistent.

### Regression

Run all existing tests from previous phases.

Do not remove or weaken tests.

---

# 17. Existing functionality must remain intact

Do not break:

* login
* JWT authentication
* role authorization
* brokerage isolation
* user management
* lead CRUD
* duplicate detection
* generic webhook
* lead pipeline
* Socket.IO
* lead conversion
* client login
* client portal
* private documents
* document verification
* email automation
* advisor tasks

The dashboard is an addition to the existing system, not a replacement for it.

---

# 18. Optional Typeform consideration

The assignment requires at least one real external lead source.

If evaluating an additional external lead integration such as Typeform:

* do not replace the working generic webhook
* do not break the existing webhook/Tally-compatible architecture
* only implement it if it can be done reliably within the current scope
* remove incomplete/unused integration code rather than leaving half-working functionality

The core product must remain stable.

Do not sacrifice the working lead intake flow for an optional second integration.

---

# 19. Validation

Run:

* complete backend tests
* frontend checks
* TypeScript
* lint
* frontend build
* backend build/checks

Manually verify:

```text id="v5j7me"
Login
  ↓
Dashboard
  ↓
Summary loads
  ↓
Pipeline loads
  ↓
Create/update lead
  ↓
Pipeline changes
  ↓
Summary remains accurate
```

Also verify:

```text id="w3y2p7"
Brokerage A login
  ↓
A's dashboard
  ↓
Only A's counts

Brokerage B login
  ↓
B's dashboard
  ↓
Only B's counts
```

---

# 20. Git requirements

Do not commit automatically.

Before completion:

```bash id="q4f9p1"
git status
git diff
```

Inspect the complete diff.

Make sure:

* no secrets
* no unrelated refactoring
* no generated files
* no broken Phase 1–5 functionality
* no unnecessary dependencies

At the end, report:

* dashboard endpoint
* aggregation approach
* frontend changes
* realtime behavior
* authorization fixes
* tests
* TypeScript
* lint
* build
* manual verification
* known limitations

Do not claim completion unless the dashboard is actually backed by the server-side summary endpoint and tenant isolation has been verified.

# Part 7 — Phase 7: Tally Lead Integration

## Recovery Note

This is a detailed reconstruction of the Phase 7 implementation prompt based on the actual LeadFlow project work, requirements, implementation issues, and final verified behavior. The exact original prompt wording is not fully recoverable, so this should not be treated as a verbatim copy.

---

## Main Implementation Prompt — Phase 7: Tally Integration

Continue working on the existing LeadFlow project from the completed Phase 6 baseline.

### Project

Project root:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

The project is a multi-tenant mortgage brokerage lead and document platform for German mortgage brokerages serving expats.

Do not rebuild or replace existing functionality.

Phase 1–6 are already implemented and verified. Preserve all existing authentication, tenant isolation, lead pipeline, duplicate detection, realtime updates, client conversion, documents, verification, email automation, tasks, and dashboard functionality.

---

# Phase 7 Goal

Add **Tally** as a real external lead source.

The assignment requires LeadFlow to receive leads automatically from at least one real external tool.

Tally should submit lead information to LeadFlow through a secure webhook endpoint.

The integration must create a normal LeadFlow lead and therefore automatically participate in the existing:

* brokerage isolation
* duplicate detection
* lead pipeline
* status handling
* realtime updates
* dashboard counts
* email automation
* task automation

Do not create a separate lead system for Tally.

---

# 1. Tally Webhook Endpoint

Create a dedicated backend webhook endpoint for Tally, for example:

`POST /api/webhooks/tally`

Use the existing Express application and routing architecture.

The endpoint must:

1. Accept Tally webhook requests.
2. Verify the webhook signature.
3. Authenticate the intended brokerage.
4. Parse the Tally submission.
5. Extract the required lead fields.
6. Normalize the lead data.
7. Check for duplicate contacts within the brokerage.
8. Enforce submission idempotency.
9. Create the Lead if valid and new.
10. Trigger the existing realtime/pipeline behavior.
11. Return an appropriate HTTP response.

Do not trust brokerage identifiers supplied directly in the webhook body.

---

# 2. Tally Webhook Authentication

Use a Tally webhook signing secret.

The secret must be stored in environment variables.

Never hard-code the signing secret.

Never expose it to the frontend.

Never commit the secret to Git.

Add the required variable to:

`server/.env.example`

but only provide a placeholder/example value there.

---

# 3. Raw Request Body Signature Verification

Signature verification must be implemented correctly.

The Tally webhook signature must be calculated from the **exact raw request body bytes**.

Do not parse the request body into JSON and then stringify it again before calculating the HMAC.

Do not perform signature verification against a reconstructed JSON object.

The flow must be:

1. Receive the raw request body.
2. Obtain the Tally signature header.
3. Calculate HMAC-SHA256 using the configured Tally signing secret.
4. Compare the calculated signature with the received signature using a timing-safe comparison.
5. Only after successful verification should the body be parsed and processed.

Use Node's cryptographic APIs appropriately, including a timing-safe comparison mechanism such as `crypto.timingSafeEqual`.

Reject requests with:

* missing signature
* malformed signature
* invalid signature
* incorrect signing secret

Do not process the lead if signature verification fails.

Return an appropriate unauthorized/invalid webhook response without leaking implementation details or secrets.

---

# 4. Raw Body Middleware

Because the signature depends on the exact raw request body, configure Express middleware appropriately.

Do not allow the normal JSON parser to destroy the original body before signature verification.

Use a raw-body capture approach compatible with the existing Express application.

Preserve normal JSON parsing for the rest of the application.

The implementation must not break existing API routes.

---

# 5. Tally Payload Mapping

Map the actual Tally webhook payload into the LeadFlow Lead model.

Do not assume that Tally's human-readable question labels are the stable identifiers.

Use the stable field identifiers from the Tally payload.

The relevant production field keys are:

### First name

`question_OBZW1Y`

### Last name

`question_V1akEM`

### Email

`question_PBNajB`

### Phone

`question_EbG4zB`

Tally fields are provided under:

`data.fields`

and the stable field identifier is:

`data.fields[].key`

Do not incorrectly rely on another property if the actual payload uses `key`.

Extract the value associated with each required field.

The implementation should be structured so that the mapping is easy to update if the Tally form changes.

---

# 6. Submission ID

Use the Tally submission identifier for webhook idempotency.

The Tally payload provides:

`data.submissionId`

Store or otherwise track this identifier so that the same Tally submission cannot create multiple LeadFlow leads if Tally retries the webhook.

If the same submission is received again:

* do not create another lead
* return a successful/idempotent response where appropriate
* do not duplicate downstream automation

This must work even when the same webhook is delivered multiple times.

---

# 7. Brokerage Authentication

LeadFlow is multi-tenant.

A Tally submission must be associated with the correct brokerage.

Use the existing brokerage-specific webhook authentication mechanism rather than trusting a brokerage ID from the request body.

The brokerage should be derived from the authenticated webhook credential/token.

Do not allow a caller to simply provide:

`brokerageId`

in the payload and choose another brokerage.

The authenticated brokerage determines where the lead belongs.

Ensure that the Tally integration follows the same tenant-isolation rules already established in previous phases.

---

# 8. Lead Creation

After authentication and validation, create a normal LeadFlow Lead.

Populate the appropriate fields:

* first name
* last name
* email
* phone
* source
* brokerageId
* normalized email
* normalized phone
* external/submission identifier
* initial status
* timestamps

The source should clearly identify that the lead came from Tally.

The initial pipeline status should be:

`NEW`

Do not create a special Tally-only lead type.

Tally-created leads must behave exactly like other LeadFlow leads after creation.

---

# 9. Duplicate Detection

Reuse the existing LeadFlow duplicate detection logic.

Normalize:

* email
* phone

before comparing.

Duplicate detection must be performed within the authenticated brokerage.

For example:

Brokerage A having a lead with phone number X must not prevent Brokerage B from creating a lead with the same phone number.

Therefore:

* same contact within the same brokerage → duplicate
* same contact in different brokerages → allowed

Do not weaken or bypass the existing duplicate detection because the lead came from Tally.

Return the existing application's appropriate duplicate response.

---

# 10. Idempotency vs Duplicate Detection

Treat these as two separate protections.

### Submission idempotency

Prevents the same Tally submission from being processed multiple times.

Example:

Tally sends submission `abc123` twice.

Only one LeadFlow lead should be created.

### Duplicate detection

Prevents different submissions containing the same person/contact information from creating duplicate leads within the same brokerage.

Example:

Tally sends submission `abc123` with phone X.

Later it sends submission `xyz789` with the same phone X.

The second submission should be detected as a duplicate even though its Tally submission ID is different.

Implement both protections.

---

# 11. Existing Lead Pipeline Integration

Tally-created leads must enter the existing pipeline.

After creation:

* lead appears in the appropriate brokerage pipeline
* initial status is NEW
* existing lead APIs can retrieve it
* existing status changes work
* assignment works
* lead conversion works
* dashboard summary includes it
* duplicate logic remains active

Do not duplicate pipeline functionality inside the Tally integration.

Reuse the existing Lead service/model/business logic wherever possible.

---

# 12. Realtime Integration

After successful Tally lead creation, emit the existing realtime event through Socket.IO.

Only users in the correct brokerage room should receive the new lead event.

Do not broadcast the lead to other brokerages.

The frontend should update the pipeline/dashboard through the existing realtime mechanisms rather than requiring a manual refresh.

Preserve the existing Socket.IO architecture from earlier phases.

---

# 13. Error Handling

Handle failures cleanly.

Examples:

* missing signature
* invalid signature
* missing webhook authentication
* invalid brokerage token
* malformed payload
* missing required fields
* invalid email
* invalid phone
* duplicate contact
* duplicate Tally submission
* database failure

Do not expose:

* signing secrets
* JWT secrets
* database credentials
* internal stack traces
* sensitive implementation details

Webhook failures should return meaningful HTTP status codes while keeping error messages safe.

---

# 14. Validation

Validate incoming Tally data before creating a lead.

At minimum validate:

* first name
* last name where required by the application's lead rules
* email
* phone

Normalize values before persistence.

Avoid creating partially corrupted leads from malformed Tally payloads.

---

# 15. Frontend Integration

Do not build a separate frontend page for Tally.

The existing pipeline/dashboard should automatically display Tally-created leads.

If useful, display the lead source as Tally in the existing lead card/details UI, but do not redesign the application during this phase.

Keep Phase 7 focused on the external integration.

---

# 16. Tests

Add comprehensive automated tests for the Tally integration.

At minimum test:

### Signature

* valid signature succeeds
* missing signature fails
* invalid signature fails
* incorrect signing secret fails
* signature verification uses the raw request body
* timing-safe comparison is used

### Payload

* valid Tally payload maps first name correctly
* valid Tally payload maps last name correctly
* valid Tally payload maps email correctly
* valid Tally payload maps phone correctly
* mapping reads the actual stable field key
* submission ID is extracted correctly

### Authentication

* valid brokerage webhook authentication succeeds
* invalid token fails
* missing token fails
* brokerage is derived from authentication rather than request body

### Idempotency

* same Tally submission cannot create two leads
* repeated webhook delivery is handled safely

### Duplicate detection

* duplicate email within brokerage is detected
* duplicate phone within brokerage is detected
* same contact in another brokerage is allowed

### Tenant isolation

* Brokerage A cannot create a Tally lead for Brokerage B
* Tally-created leads are only visible to the authenticated brokerage

### Integration

* successful Tally lead enters NEW status
* pipeline receives the lead
* realtime event is emitted
* dashboard summary reflects the lead
* existing downstream automation remains compatible

Do not reduce or remove existing tests.

Run the full test suite after implementing the integration.

---

# 17. Security Requirements

Before finishing, verify:

* Tally signing secret exists only on the backend
* no secret is hard-coded
* no secret is exposed through frontend environment variables
* `.env` files remain ignored
* `.env.example` contains placeholders only
* raw body is used for HMAC verification
* timing-safe signature comparison is used
* brokerage is derived from authenticated credentials
* request body cannot spoof brokerage ownership
* duplicate detection remains brokerage-scoped
* submission idempotency is brokerage-safe
* no sensitive values are logged

Do not print secret values during debugging.

Remove temporary debugging logs before completion.

---

# 18. Preserve Existing Functionality

Do not break:

* authentication
* JWT validation
* role authorization
* brokerage isolation
* user management
* lead CRUD
* lead status changes
* lead assignment
* duplicate detection
* Socket.IO
* client conversion
* client login
* document upload
* document verification
* email templates
* email triggers
* email logs
* advisor tasks
* task triggers
* dashboard summary

Do not modify unrelated modules unless necessary for the integration.

Do not introduce a new framework.

Do not add unnecessary infrastructure.

Do not introduce Kafka, Redis, BullMQ, microservices, or other infrastructure just for this phase.

---

# 19. Scope Control

This phase is specifically for:

**Tally → secure webhook → LeadFlow lead pipeline**

Do not implement:

* Netlify deployment
* Vercel deployment
* production infrastructure redesign
* UI redesign
* advanced monitoring
* distributed queues
* Redis
* new external lead providers
* major dashboard redesign

Those can be handled in later phases.

Keep the implementation assignment-sized and production-minded.

---

# 20. Documentation

Document the Tally integration.

Include:

* webhook endpoint
* required environment variables
* authentication/signing approach
* expected payload structure
* field mapping
* submission idempotency
* duplicate behavior
* local testing instructions
* Tally configuration steps

Do not document actual secret values.

Update `.env.example` with placeholder configuration.

Update README/technical documentation only where appropriate.

---

# 21. Final Verification

Before declaring Phase 7 complete:

1. Inspect all changed files.
2. Verify the Tally webhook endpoint.
3. Verify raw-body handling.
4. Verify HMAC-SHA256 verification.
5. Verify timing-safe comparison.
6. Verify stable Tally field-key mapping.
7. Verify submission ID idempotency.
8. Verify brokerage authentication.
9. Verify tenant isolation.
10. Verify duplicate detection.
11. Verify lead creation.
12. Verify NEW pipeline status.
13. Verify realtime event behavior.
14. Run all backend tests.
15. Run frontend tests if applicable.
16. Run TypeScript checks.
17. Run lint.
18. Run production build.
19. Verify no secrets are tracked.
20. Verify `git status` contains only intentional changes.

Do not claim the phase is complete if tests or builds are failing.

Do not commit until the implementation has been reviewed and verified.

After successful verification, create a focused Git commit for Phase 7.

Use a descriptive commit message such as:

`feat: add Tally lead integration`

Then verify:

* commit exists
* working tree is clean
* no unintended files were included
* previous phase functionality remains intact.


# Part 8 — Phase 8: Production Deployment Preparation

## Recovery Note

This is a detailed reconstruction of the Phase 8 implementation prompt based on the actual LeadFlow project work, deployment decisions, files created, production architecture, and final verification. The exact original prompt wording is not fully recoverable, so this should not be treated as a verbatim copy.

---

## Main Implementation Prompt — Phase 8: Production Deployment Preparation

Continue working on the existing LeadFlow project from the completed Phase 7 baseline.

### Project

Project root:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

LeadFlow is a multi-tenant mortgage brokerage platform for German mortgage brokerages serving expats.

Phase 1–7 are already implemented and verified.

Do not rebuild the application.

Do not replace existing functionality.

The purpose of this phase is to prepare the existing application for production deployment.

---

# Phase 8 Goal

Prepare LeadFlow for deployment using:

* **Frontend:** Netlify
* **Backend:** Vercel
* **Database:** MongoDB Atlas
* **File storage:** Supabase S3-compatible private storage
* **Email:** Resend
* **External lead source:** Tally
* **Realtime:** Socket.IO
* **Background verification:** lightweight worker/cron approach
* **Repository:** GitHub

The deployment architecture should remain simple and appropriate for the assignment.

Do not introduce unnecessary distributed infrastructure.

---

# 1. Production Architecture

The intended production architecture is:

```text
User Browser
    |
    v
Netlify
React + Vite frontend
    |
    | HTTPS API requests
    v
Vercel
Express + TypeScript backend
    |
    +----> MongoDB Atlas
    |
    +----> Supabase private storage
    |
    +----> Resend
    |
    +----> Tally webhook
    |
    +----> Socket.IO
    |
    +----> Scheduled verification endpoint
```

The frontend and backend must communicate securely over HTTPS.

The backend must remain responsible for:

* authentication
* authorization
* tenant isolation
* database access
* storage signing
* email sending
* webhook processing
* document verification
* cron authentication

Never move backend secrets into the frontend.

---

# 2. Inspect the Existing Project First

Before making changes:

1. Inspect the current repository.
2. Inspect existing package files.
3. Inspect current server startup.
4. Inspect current frontend build configuration.
5. Inspect existing environment variables.
6. Inspect existing API routes.
7. Inspect Socket.IO setup.
8. Inspect background verification implementation.
9. Inspect Tally integration.
10. Inspect current Git status.

Do not assume the existing structure.

Make the minimum changes required for deployment.

---

# 3. Backend Vercel Preparation

Prepare the Express backend to run correctly on Vercel.

The backend must expose an appropriate serverless entry point.

Create/use:

`server/api/index.ts`

The entry point should initialize and export the existing Express application in a Vercel-compatible way.

Do not duplicate application initialization unnecessarily.

Keep the existing local development server working.

Local development must still support the existing workflow.

---

# 4. Database Connection Handling

MongoDB connections must be safe for a serverless environment.

Implement connection caching where appropriate so repeated Vercel invocations do not unnecessarily create new MongoDB connections.

Use the existing MongoDB/Mongoose configuration.

The connection logic must:

* read the MongoDB URI from environment variables
* cache an existing connection where appropriate
* reconnect when necessary
* avoid leaking credentials
* preserve local development behavior

Do not hard-code the MongoDB URI.

---

# 5. Vercel Configuration

Create or update:

`server/vercel.json`

Configure the backend appropriately for the Vercel deployment.

Ensure the correct API entry point is used.

Do not configure unnecessary serverless functions.

Keep the configuration minimal.

---

# 6. Production Health Endpoint

Ensure the existing health endpoint works in production.

The endpoint should provide enough information to confirm:

* API is running
* database connectivity is available

Do not expose:

* database URI
* credentials
* JWT secret
* storage credentials
* Resend key
* Tally secret
* cron secret

The production health endpoint should be safe to expose publicly.

---

# 7. Scheduled Background Verification

The document verification system currently uses a lightweight background mechanism.

Prepare it for production using a scheduled Vercel Cron endpoint.

Create:

`server/api/cron/verify.ts`

and the necessary cron route/configuration.

The scheduled process should:

1. Authenticate the cron request.
2. Find documents that need verification.
3. Process pending verification work.
4. Update document status.
5. Preserve retry/failure behavior.
6. Emit existing realtime status events where applicable.
7. Avoid processing the same document incorrectly multiple times.

Do not replace the existing lightweight verification architecture with Redis/BullMQ/Kafka.

The assignment does not require distributed infrastructure.

---

# 8. Cron Authentication

Protect the cron endpoint using a secret.

Add:

`CRON_SECRET`

to the backend environment configuration.

The secret must:

* exist only on the server
* never be exposed to the frontend
* never be committed
* never be logged

The cron route must reject unauthorized requests.

Use a secure comparison/authorization mechanism appropriate for the deployment.

---

# 9. Vercel Cron Schedule

Configure the scheduled verification endpoint in `server/vercel.json`.

Use a reasonable scheduled interval for the assignment.

The implemented configuration should run the verification job daily at:

`0 3 * * *`

This corresponds to a daily scheduled execution.

Document that the schedule is configured but do not falsely claim that a future scheduled invocation has been observed if it has not yet run.

---

# 10. Cron Testing

Add automated tests for the cron endpoint.

Test at minimum:

* valid cron authentication succeeds
* invalid secret fails
* missing secret fails
* pending verification documents can be processed
* already completed documents are not incorrectly reprocessed
* failure/retry behavior remains intact
* document status updates correctly
* tenant isolation remains intact

Do not remove existing document verification tests.

---

# 11. Socket.IO Production Considerations

Keep the existing Socket.IO implementation.

Do not introduce Redis merely to make Socket.IO horizontally scalable.

For the assignment-scale deployment, document the limitation that Socket.IO coordination is currently instance-local.

The system should continue working correctly on a single backend instance.

Document that shared realtime infrastructure would be required for horizontal multi-instance scaling in a future production iteration.

Do not over-engineer this phase.

---

# 12. Frontend Netlify Preparation

Prepare the React/Vite frontend for Netlify.

The frontend must build successfully using:

`npm run build`

The build output should be:

`dist`

The Netlify base directory should be:

`client`

Create/update:

`client/netlify.toml`

Configure the Netlify build appropriately.

The configuration should support:

* Vite production builds
* SPA routing
* client-side routes
* correct publish directory
* correct build command

Do not hard-code the production backend URL into source files if it can be supplied through environment configuration.

---

# 13. Frontend API URL

The frontend must use the existing centralized API URL configuration.

The production frontend should communicate with:

`https://unsquareassignmentbackend.vercel.app`

Use:

`VITE_API_URL`

for the frontend API configuration.

Do not put:

* MongoDB credentials
* Supabase secret keys
* Resend keys
* JWT secrets
* Tally signing secrets
* cron secrets

into `VITE_*` variables.

Remember that Vite environment variables beginning with `VITE_` are exposed to the browser.

---

# 14. Environment Files

Review both frontend and backend environment configuration.

Ensure:

* `.env` files are ignored
* `.env.local` is ignored where appropriate
* `.env.example` contains placeholders only
* no production secret is committed
* no real credentials exist in tracked files

Backend environment variables should include the required production configuration such as:

* MongoDB URI
* JWT secret
* Supabase storage configuration
* Resend configuration
* Tally signing secret
* cron secret
* other required server-side configuration

Frontend should only contain safe browser-visible configuration such as:

* API base URL

Do not expose server secrets through Vite.

---

# 15. CORS

Configure production CORS correctly.

The backend must allow the deployed Netlify frontend origin.

Do not use unrestricted CORS in production unless absolutely necessary.

Keep local development origins working as needed.

The backend should reject unexpected browser origins where appropriate.

Ensure CORS configuration does not break:

* login
* API requests
* authenticated requests
* Tally webhook requests
* cron requests
* local development

Remember that server-to-server webhook/cron requests do not behave like browser CORS requests.

---

# 16. Tally Production Compatibility

Ensure the existing Tally integration remains compatible with deployment.

Verify:

* Tally webhook endpoint is reachable through Vercel
* signature verification still uses the raw request body
* signing secret is configured server-side
* brokerage authentication still works
* submission idempotency remains active
* duplicate detection remains active
* lead creation still enters the existing pipeline

Do not expose the Tally signing secret.

Do not modify the working Tally implementation unnecessarily.

---

# 17. Supabase Storage Production Compatibility

Verify that document storage continues to use the private Supabase S3-compatible bucket.

The bucket must remain private.

Do not make the document bucket public merely to simplify deployment.

Backend should continue generating signed URLs where required.

Verify:

* upload
* private storage
* signed access
* client authorization
* advisor/admin access
* document verification

Do not expose storage credentials to the frontend.

---

# 18. Resend Production Compatibility

Verify Resend configuration remains server-side.

Required environment values should be available to the backend.

Do not expose the Resend API key to the frontend.

Verify that email automation remains compatible with the deployed backend.

Do not redesign email templates in this phase.

---

# 19. Authentication in Production

Verify production authentication.

The deployed backend must correctly handle:

* login
* JWT generation
* JWT validation
* `/me`
* protected routes
* role-based authorization
* brokerage isolation
* client access restrictions

Do not weaken authentication to make deployment easier.

Do not put JWT secrets into frontend environment variables.

---

# 20. Production Error Handling

Ensure production errors do not expose sensitive internals.

Do not return:

* stack traces
* database credentials
* secret values
* internal connection strings
* filesystem paths where unnecessary

Keep useful error responses for the frontend.

Log only information that is safe and useful for debugging.

Remove temporary development/debug logging.

---

# 21. Serverless Compatibility Review

Review backend code for assumptions that do not work well in Vercel/serverless execution.

Check for:

* long-lived background loops
* permanent in-memory queues
* filesystem persistence
* startup-only state assumptions
* connection leaks
* request-specific global state
* unnecessary local file storage

The cron endpoint should handle scheduled background work instead of relying on a permanently running Node process.

Do not attempt to make the application fully distributed in this phase.

---

# 22. Local Production Verification

Before deploying:

### Backend

Run the backend build/type checks.

Verify:

* TypeScript
* lint
* tests
* production startup/entry point

### Frontend

Run:

`npm run build`

Verify:

* TypeScript
* lint
* production build
* no missing environment configuration

Do not proceed while the production build is broken.

---

# 23. Full Regression Testing

Run the complete existing test suite.

Verify that deployment preparation did not break:

* authentication
* role authorization
* tenant isolation
* users
* leads
* duplicate detection
* webhook integration
* Tally
* pipeline
* realtime
* client conversion
* client login
* document upload
* document verification
* retry/failure
* email templates
* email triggers
* email logs
* tasks
* task triggers
* dashboard summary

Do not delete tests simply to make the suite pass.

---

# 24. Git Safety

Before committing:

1. Run `git status`.
2. Review every changed file.
3. Inspect the diff.
4. Confirm no secrets are present.
5. Confirm no unrelated files changed.
6. Confirm deployment configuration is intentional.
7. Confirm tests pass.
8. Confirm builds pass.

Do not commit generated secrets or local environment files.

---

# 25. Production Deployment Documentation

Update the README with the deployment architecture.

Document:

* frontend deployment target
* backend deployment target
* database
* storage
* email provider
* external webhook provider
* cron/background verification
* required environment variables
* local development commands
* production build commands
* important deployment limitations

Do not document secret values.

Document that:

* Socket.IO is currently instance-local
* shared realtime infrastructure would be required for horizontal scaling
* cron is configured for scheduled verification
* scheduled execution itself may require post-deployment observation

Be accurate about what has actually been tested versus what is only configured.

---

# 26. Scope Control

This phase is for:

**Production deployment preparation**

Do not implement:

* UI redesign
* Netlify deployment itself if the repository preparation is the current scope
* major backend refactoring
* Redis
* BullMQ
* Kafka
* microservices
* Kubernetes
* distributed Socket.IO infrastructure
* advanced observability platform
* unnecessary third-party services

Keep the architecture simple and assignment-appropriate.

---

# 27. Final Validation

Before declaring Phase 8 complete, verify:

1. Vercel backend entry point exists.
2. Vercel configuration is valid.
3. MongoDB connection handling is serverless-safe.
4. Health endpoint works locally.
5. Cron endpoint exists.
6. Cron endpoint is authenticated.
7. Cron schedule is configured.
8. Cron tests pass.
9. Frontend Netlify configuration exists.
10. SPA routing is configured.
11. Frontend production build succeeds.
12. `VITE_API_URL` configuration is correct.
13. CORS supports the production frontend.
14. Tally integration remains intact.
15. Supabase storage remains private.
16. Resend remains server-side.
17. Authentication remains intact.
18. Tenant isolation remains intact.
19. Full test suite passes.
20. Frontend lint/build passes.
21. Backend lint/build passes.
22. No secrets are tracked.
23. Git diff contains only intentional changes.
24. Documentation is updated.
25. `git status` is clean after commit.

Do not claim production readiness if any critical check is failing.

Do not commit until the implementation has been reviewed and verified.

After successful verification, create a focused Git commit for Phase 8.

Use a descriptive commit message such as:

`feat: prepare LeadFlow for production deployment`

Then verify:

* commit exists
* working tree is clean
* no unintended files were committed
* previous Phase 1–7 functionality remains intact.


# Part 9 — Phase 9: Production Deployment, Integrations & Final Functional QA

## Recovery Note

This is a detailed reconstruction of the Phase 9 implementation prompt based on the actual LeadFlow project work across production deployment, integration testing, production fixes, end-to-end verification, and final functional QA. The exact original prompt wording is not fully recoverable, so this should not be treated as a verbatim copy.

---

## Main Implementation Prompt — Phase 9: Production Deployment, Integrations & Final Functional QA

Continue working on the existing LeadFlow project from the completed Phase 8 baseline.

### Project

Project root:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

LeadFlow is a multi-tenant mortgage brokerage platform for German mortgage brokerages serving expats.

Phases 1–8 have already been implemented and production-prepared.

Do not rebuild the application.

Do not replace working functionality.

The goal of this phase is to move the backend into production, verify the real integrations, perform production end-to-end testing, fix any production-only issues, and complete final functional QA before UI polish.

---

# Phase 9 Goal

Complete the following production workflow:

```text
GitHub
   |
   +----> Vercel Backend
   |
   +----> Netlify Frontend
   |
   +----> MongoDB Atlas
   |
   +----> Supabase Storage
   |
   +----> Resend
   |
   +----> Tally
```

The final deployed application must support the complete core workflow:

```text
Tally lead
   ↓
Secure webhook
   ↓
Lead creation
   ↓
Duplicate detection
   ↓
Pipeline
   ↓
Status changes
   ↓
Lead → Client
   ↓
Client login
   ↓
Document upload
   ↓
Background verification
   ↓
Realtime updates
   ↓
Email automation
   ↓
Advisor tasks
   ↓
Dashboard summary
```

The application must remain strictly multi-tenant throughout this workflow.

---

# 1. Phase 9A — Backend Production Deployment

Deploy the backend to Vercel using the production configuration created in Phase 8.

Use the GitHub repository as the deployment source.

Verify that Vercel builds the backend successfully.

Configure all required backend environment variables in Vercel.

Never commit or expose their values.

Required production configuration includes the relevant:

* MongoDB configuration
* JWT secret
* Supabase storage configuration
* Resend configuration
* Tally signing secret
* cron secret
* other required server-side environment variables

Do not put any of these secrets into frontend environment variables.

---

# 2. Production Backend Health Check

After deployment, verify the backend health endpoint.

The production backend must return a successful health response and confirm database connectivity.

The deployed backend used for verification is:

`https://unsquareassignmentbackend.vercel.app`

Verify:

`/api/health`

Do not expose credentials or internal connection information through the endpoint.

---

# 3. Production Database Verification

Verify that the deployed backend successfully connects to MongoDB Atlas.

Confirm:

* connection succeeds
* authentication works
* database queries work
* brokerage data remains isolated
* existing production records are not accidentally modified or deleted

Do not reset or reseed the production database unnecessarily.

Do not run destructive migration commands.

---

# 4. Production Authentication Verification

Test the deployed authentication system.

Verify:

* Platform Admin login
* Brokerage Admin login
* Advisor login
* Client login
* invalid credentials
* protected routes
* JWT validation
* `/me`
* role restrictions
* brokerage isolation

Verify that passwords are never returned by API responses.

Verify that client users cannot access advisor/admin resources.

Verify that users from one brokerage cannot access another brokerage's resources.

---

# 5. Phase 9B — Frontend Production Deployment

Prepare and deploy the frontend to Netlify.

Use:

* Base directory: `client`
* Build command: `npm run build`
* Publish directory: `dist`

Configure the production frontend API variable appropriately.

The frontend must communicate with the deployed Vercel backend.

Do not hard-code secrets into the frontend.

Verify that the deployed frontend loads successfully.

---

# 6. SPA Routing

Verify that client-side routing works after deployment.

Test:

* login route
* protected application route
* dashboard
* client portal
* direct navigation to application routes
* browser refresh on a nested route

Netlify must return the frontend application instead of a 404 for valid client-side routes.

---

# 7. Production CORS Verification

Verify that the deployed Netlify frontend can communicate with the Vercel backend.

Test authenticated requests from the real deployed frontend.

Verify:

* login request
* `/me`
* lead requests
* dashboard requests
* document requests
* task requests
* email/automation requests

Do not solve CORS by allowing unrestricted origins unless genuinely required.

Keep production origin configuration explicit.

---

# 8. Phase 9C — Production Tally Integration

Verify the real Tally → Vercel → MongoDB workflow.

Configure Tally to use the production webhook endpoint.

Verify that:

1. Tally sends the webhook.
2. Vercel receives it.
3. The raw request body is preserved.
4. HMAC-SHA256 signature verification succeeds.
5. Timing-safe signature comparison is used.
6. Brokerage authentication succeeds.
7. Tally field mapping succeeds.
8. Submission ID is extracted.
9. Duplicate detection runs.
10. A LeadFlow lead is created.
11. The lead is assigned to the correct brokerage.
12. The lead appears in the pipeline.
13. The dashboard reflects it.
14. Realtime updates work.

Use the actual production Tally payload structure.

The production payload uses:

`data.fields[].key`

and:

`data.submissionId`

The field mappings are:

* first name → `question_OBZW1Y`
* last name → `question_V1akEM`
* email → `question_PBNajB`
* phone → `question_EbG4zB`

Do not replace stable field keys with display labels.

---

# 9. Tally Duplicate Testing

Perform a real duplicate test.

Submit a Tally form with a contact that already exists in the same brokerage.

Verify that the existing duplicate detection rejects/prevents duplicate lead creation.

Then test a genuinely new contact.

Verify that the new contact is successfully created.

Also verify that the same contact information can exist in a different brokerage without incorrectly triggering a cross-tenant duplicate.

---

# 10. Tally Idempotency Testing

Send/replay the same Tally submission where possible.

Verify that the same:

`data.submissionId`

does not create multiple LeadFlow leads.

Confirm that webhook retries do not trigger duplicate downstream automation.

---

# 11. Production Pipeline Verification

From the deployed frontend, verify the complete lead lifecycle:

```text
NEW
→ CONTACTED
→ QUALIFIED
→ APPLICATION
→ WON / LOST
```

Verify:

* status changes persist
* unauthorized users cannot modify leads
* correct brokerage sees the lead
* other brokerages cannot see the lead
* realtime updates work
* dashboard counts update
* existing email/task automation remains connected to status changes

---

# 12. Lead → Client Conversion

Verify production lead conversion.

A valid lead should be convertible into a Client.

Verify:

* client record is created
* relationship to the original lead is preserved
* brokerage isolation remains intact
* client credentials/access are created according to existing logic
* advisor/admin can access the client case
* client cannot access another client's case

Do not create duplicate clients from repeated conversion attempts.

---

# 13. Client Portal Verification

Log in as a real client account through the deployed frontend.

Verify:

* client can authenticate
* client sees only their own case
* client can access their documents
* client can upload permitted documents
* client cannot access advisor/admin resources
* client cannot access another client's documents
* logout works

Do not expose internal administrative data to the client.

---

# 14. Production Document Storage Verification

Verify real document upload using the production Supabase S3-compatible private bucket.

Confirm:

* file upload works
* bucket remains private
* backend generates appropriate signed access
* unauthorized users cannot access documents
* advisor/admin access works where permitted
* client access is restricted to their own case

Do not make the bucket public.

Do not expose storage credentials.

---

# 15. Background Document Verification

Verify the document verification workflow.

The expected lifecycle is:

```text
UPLOADED
→ CHECKING
→ VERIFIED
```

and failure should result in:

```text
UPLOADED
→ CHECKING
→ FAILED
```

Verify retry behavior.

Verify that the upload request itself is not blocked while verification occurs.

Verify that document status updates are reflected in the UI.

---

# 16. Cron Verification

Verify that the cron endpoint exists in production and is protected.

Test authorized and unauthorized requests where appropriate.

Verify that the endpoint can process pending verification work.

Document the distinction between:

* cron being configured
* cron endpoint being manually tested
* an actual scheduled production invocation being observed

Do not claim that a scheduled execution occurred if it was not directly observed.

---

# 17. Production Resend Verification

Verify the real Resend integration.

Test at least one actual email delivery.

Verify:

* email is sent from the configured sender
* template rendering works
* placeholders are replaced
* stage triggers execute
* email logs are recorded
* failed email delivery does not corrupt the lead update

Do not expose the Resend API key.

---

# 18. Advisor Task Automation

Verify task automation in production.

When configured lead stages trigger tasks:

* correct task is created
* task belongs to the correct brokerage
* task status can change
* advisor can manage permitted tasks
* unauthorized users cannot modify unrelated tasks
* realtime task updates work

Verify task idempotency so repeated events do not create unintended duplicates.

---

# 19. Dashboard Verification

Verify the production dashboard.

Summary counts must be calculated server-side.

Verify:

* New
* Contacted
* Qualified
* Application
* Won
* Lost

The dashboard must:

* load correctly
* show correct counts
* respect brokerage isolation
* update after lead changes
* handle zero counts
* handle loading
* handle errors
* remain consistent with the pipeline

Do not rely on client-side filtering of another brokerage's data.

---

# 20. Realtime Verification

Verify Socket.IO in the deployed application.

Test:

* lead creation
* lead status changes
* document status changes
* task updates
* dashboard/pipeline refresh behavior

Confirm events are scoped to the correct brokerage.

Document that the current Socket.IO implementation is instance-local and therefore not designed for horizontally scaled multi-instance coordination without additional infrastructure.

Do not add Redis during this phase.

---

# 21. Full Production Regression

Run the complete automated test suite.

The final backend test suite should pass.

At the final QA stage, preserve all existing tests.

Do not remove tests to make the count pass.

Also run:

* TypeScript checks
* lint
* production build

Verify both frontend and backend.

---

# 22. Production Security Audit

Perform a final security-focused inspection.

Check:

* no secrets in Git
* no secrets in frontend bundles
* no secret values in logs
* `.env` ignored
* `.env.example` contains placeholders only
* JWT protection active
* role middleware active
* tenant filters active
* webhook signature validation active
* Tally brokerage authentication active
* duplicate detection brokerage-scoped
* document storage private
* signed URLs used where appropriate
* cron endpoint protected
* client authorization enforced

Pay particular attention to cross-brokerage access.

---

# 23. Final Functional QA Checklist

Perform a read-only final QA after all production fixes.

### Authentication

* login
* logout
* invalid login
* role protection
* JWT/session persistence

### Multi-tenancy

* brokerage isolation
* user isolation
* lead isolation
* client isolation
* document isolation
* task isolation

### Lead Management

* Tally intake
* lead creation
* duplicate detection
* idempotency
* status changes
* assignment
* realtime updates

### Clients

* lead conversion
* client login
* client portal
* authorization

### Documents

* upload
* private storage
* checking
* verified
* failed
* retry
* realtime status

### Automation

* email templates
* stage email triggers
* email logs
* task triggers
* task management
* task realtime updates

### Dashboard

* summary counts
* pipeline consistency
* loading
* empty state
* error state
* realtime refresh

### Production

* Vercel backend
* Netlify frontend
* MongoDB Atlas
* Supabase
* Resend
* Tally
* cron endpoint
* CORS
* SPA routing

---

# 24. Known Production Limitations

Record limitations honestly.

At minimum document:

1. Background document verification uses a lightweight scheduled/worker approach rather than a dedicated distributed queue.
2. Socket.IO currently uses instance-local coordination.
3. Horizontal realtime scaling would require shared infrastructure such as Redis.
4. Live scheduled cron execution may not have been directly observed during final QA.
5. Tally is the implemented real external lead source; additional lead providers were not required.
6. The product is intentionally assignment-sized rather than a fully distributed enterprise system.

Do not describe these as fixed if they are not fixed.

---

# 25. Git Verification

After production fixes:

1. Run `git status`.
2. Inspect all changes.
3. Confirm only intentional files changed.
4. Review the complete diff.
5. Verify no credentials were added.
6. Run tests.
7. Run lint.
8. Run builds.
9. Verify deployment-related files.
10. Commit only the actual fixes.

Do not create empty or misleading commits.

Keep Git history meaningful.

---

# 26. Final Phase 9 Completion Criteria

Phase 9 is complete only when:

* backend is deployed
* backend health endpoint works
* frontend is deployed/prepared for production
* production API communication works
* CORS works
* SPA routing works
* authentication works
* tenant isolation works
* real Tally submission creates a lead
* Tally duplicate detection works
* Tally idempotency works
* lead pipeline works
* lead-to-client conversion works
* client portal works
* production document upload works
* private storage remains private
* document verification works
* email delivery works
* task automation works
* dashboard counts are correct
* realtime updates work
* cron endpoint is protected/configured
* automated tests pass
* lint passes
* builds pass
* secrets are not tracked
* final functional QA is complete
* Git working tree is clean

Do not move to the UI/UX phase until the functional application is stable.

The next phase should focus on visual/UI refinement rather than changing core business logic.


# Part 10 — Phase 10: UI/UX Design & Frontend Polish

## Recovery Note

This is a detailed reconstruction of the Phase 10 implementation prompt based on the actual LeadFlow UI/UX work across 10A–10E. The exact original prompt wording is not fully recoverable, so this should not be treated as a verbatim copy.

---

## Main Implementation Prompt — Phase 10: UI/UX Design & Frontend Polish

Continue working on the existing LeadFlow project from the completed Phase 9 functional/production baseline.

### Project

Project root:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow`

Frontend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\client`

Backend:

`C:\Users\aryas\OneDrive\Desktop\Lead Flow\server`

LeadFlow is a multi-tenant mortgage brokerage platform for German mortgage brokerages serving expats.

The application's backend, integrations, production deployment, and core functionality have already been implemented and verified.

This phase is focused on **frontend UI/UX polish only**.

Do not redesign or rewrite the backend.

Do not change business logic unless a very small frontend compatibility fix is absolutely necessary.

---

# Phase 10 Goal

Transform the existing frontend from a functional application into a clean, professional, polished SaaS-style interface.

The target visual direction is:

* clean
* minimal
* premium
* professional
* modern
* spacious
* practical
* restrained

Avoid making the application look like a flashy marketing website.

The UI should feel appropriate for a real mortgage brokerage SaaS product.

Do not overuse:

* gradients
* glowing effects
* huge illustrations
* excessive shadows
* excessive rounded cards
* large animations
* decorative elements
* unnecessary motion

The design should prioritize usability and hierarchy.

---

# 1. Preserve Existing Functionality

This is a UI/UX phase.

Do not break:

* authentication
* JWT handling
* login logic
* role handling
* tenant isolation
* lead APIs
* pipeline logic
* realtime updates
* client conversion
* client portal
* document uploads
* document verification
* email automation
* advisor tasks
* dashboard summary
* Tally integration

Do not modify server files unless absolutely necessary.

Prefer frontend-only changes.

---

# 2. Design System

Create a consistent frontend design system.

Use the existing Tailwind setup and semantic design tokens.

The design system should support:

* background
* foreground/text
* muted text
* borders
* cards/surfaces
* primary action
* destructive action
* input backgrounds
* focus states
* success states
* warning states
* error states

Use semantic classes/tokens instead of scattering arbitrary colors throughout components.

Maintain consistent:

* spacing
* typography
* border radius
* shadows
* button sizes
* input sizes
* card styles
* heading hierarchy

Avoid introducing a large component library.

Do not add unnecessary dependencies.

---

# 3. Light and Dark Mode

Add a proper light/dark theme system.

The theme should:

* work across the entire application
* persist across refreshes
* use `localStorage`
* provide a theme toggle
* update the UI without breaking existing functionality
* use semantic design tokens
* avoid hard-coded light-only colors

Create a reusable theme context if necessary.

The theme should cover:

* page backgrounds
* cards
* sidebar
* header
* forms
* inputs
* buttons
* tables/lists
* pipeline
* task board
* client portal
* document areas
* status indicators

The theme should look intentionally designed in both modes rather than simply inverting colors.

---

# 4. Reusable UI Components

Create/reuse lightweight UI primitives where appropriate.

At minimum support consistent:

* Button
* Input
* status indicators
* cards
* form controls

Buttons must have:

* pointer cursor
* hover state
* focus state
* disabled state
* loading state where appropriate

Inputs must have:

* focus state
* disabled state
* error state where appropriate
* consistent height/padding
* accessible labels

Do not duplicate button/input styling across every page.

---

# 5. Application Shell

Authenticated pages should use a proper SaaS application shell.

Use:

* left sidebar on desktop
* top header
* main content area
* responsive mobile navigation

Do not use a traditional marketing navbar/footer for the authenticated dashboard.

The shell should provide:

* application navigation
* current page context
* user/account information
* theme toggle
* logout access where appropriate

Keep the shell visually restrained.

---

# 6. Sidebar

Build a responsive sidebar.

The sidebar should:

* clearly identify LeadFlow
* show role-appropriate navigation
* highlight the current page
* provide hover states
* support dark mode
* remain usable at desktop widths
* collapse/convert appropriately on smaller screens

Navigation should respect the user's role.

Do not expose pages through navigation that the user cannot access.

The sidebar should not contain excessive decorative content.

---

# 7. Mobile Navigation

On smaller screens:

* convert the sidebar into a drawer/menu
* provide a visible menu trigger
* use an overlay where appropriate
* close the drawer after navigation
* support keyboard interaction where practical
* avoid blocking the entire application unnecessarily

Test common mobile widths.

Do not assume desktop width.

---

# 8. Top Header

Create a clean top header.

It should provide appropriate:

* page/context information
* theme toggle
* user information
* navigation controls
* mobile menu trigger

Keep it compact.

Avoid filling the header with unnecessary actions.

---

# 9. Login Page

Redesign the login page so it feels consistent with the application.

The login page should include:

* clear LeadFlow branding
* email field
* password field
* login button
* loading state
* error state
* responsive layout
* light/dark mode
* appropriate spacing
* accessible labels
* keyboard-friendly interaction

Preserve the existing authentication logic exactly.

Do not change:

* API calls
* credentials handling
* authentication state
* redirect behavior
* role handling

Only improve presentation and frontend structure.

---

# 10. Dashboard

Redesign the dashboard around the actual LeadFlow workflow.

The dashboard should provide a clear overview of:

* current lead pipeline
* lead counts
* recent/important information where already available
* actions appropriate to the user's role

Use the existing backend data.

Do not create fake metrics.

Do not add unnecessary charts merely for visual appearance.

---

# 11. Pipeline Summary

Display the six existing lead statuses:

* New
* Contacted
* Qualified
* Application
* Won
* Lost

Summary cards should:

* have clear hierarchy
* display counts prominently
* work in light/dark mode
* be responsive
* handle loading
* handle zero values
* handle errors
* use subtle hover/transition effects

Do not make the cards overly decorative.

The summary must continue to use the existing server-side summary endpoint.

---

# 12. Pipeline Board

Redesign the lead pipeline board.

Columns should represent:

* New
* Contacted
* Qualified
* Application
* Won
* Lost

Lead cards should clearly show useful information such as:

* name
* email/phone where appropriate
* source
* current status
* assigned advisor where appropriate
* relevant actions

Preserve all existing lead functionality.

Do not replace API behavior with local-only state.

Realtime updates must continue to work.

---

# 13. Lead Cards

Create a polished but compact lead card.

Cards should have:

* clear name hierarchy
* useful metadata
* source indicator
* status context
* actions where permitted
* hover feedback
* accessible buttons
* responsive layout

Avoid information overload.

Do not display sensitive information unnecessarily.

Role-based actions must remain respected.

---

# 14. Loading, Empty and Error States

Every major UI section should handle:

### Loading

Show a clear loading state while data is being fetched.

### Empty

Show a useful empty state when no records exist.

Do not use large decorative empty-state graphics unnecessarily.

### Error

Show a readable error message and a retry/action where appropriate.

Do not expose raw server errors or stack traces.

Apply this consistently to:

* dashboard
* pipeline
* tasks
* clients
* documents
* forms

---

# 15. Client Portal

Polish the client-facing portal.

The client should clearly understand:

* their case
* their documents
* document status
* upload actions
* verification progress
* errors/retry states

Maintain strict client authorization.

Do not expose internal brokerage/admin information.

The portal should feel simpler than the advisor/admin interface.

---

# 16. Documents UI

Improve the document interface.

Clearly communicate:

* uploaded
* checking
* verified
* failed
* retry

The UI should make the non-blocking verification process understandable.

Show appropriate loading/status transitions.

Do not change the actual upload or verification logic.

---

# 17. Tasks UI

Polish the advisor task interface.

Support clear:

* task title
* status
* relevant metadata
* actions
* loading state
* empty state
* error state

Task actions must remain role-aware.

Realtime task updates must continue to work.

Do not redesign task business logic.

---

# 18. Email Automation UI

Polish existing automation/template interfaces.

Improve:

* hierarchy
* forms
* cards
* buttons
* status indicators
* loading/error states

Preserve:

* template CRUD
* placeholder behavior
* stage triggers
* email logs
* role restrictions

Do not change email delivery logic.

---

# 19. Responsive Design

The application must work across:

* desktop
* laptop
* tablet
* mobile

Test at representative widths, including narrow mobile screens.

Pay attention to:

* sidebar
* header
* dashboard cards
* pipeline columns
* forms
* tables/lists
* task board
* document sections

For the pipeline, horizontal scrolling is acceptable when necessary, but the UI should remain usable.

Do not allow important content to become inaccessible.

---

# 20. Accessibility

Maintain accessible frontend behavior.

Check:

* semantic HTML
* button elements for actions
* labels for inputs
* keyboard navigation
* visible focus states
* sufficient text contrast
* meaningful interactive states
* mobile navigation accessibility

Do not remove existing accessible behavior merely for visual styling.

---

# 21. Interactions

Every interactive button/action should feel interactive.

Ensure:

* pointer cursor
* hover state
* focus state
* disabled state
* loading state where applicable

Use subtle transitions.

Do not animate everything.

Avoid animations that make the application feel slow.

---

# 22. Subtle Animations

Add restrained motion where useful.

Examples:

* button hover
* card hover
* sidebar transitions
* theme transition
* mobile drawer
* small content transitions
* subtle page/section reveal

Animations should be:

* short
* subtle
* purposeful

Do not use:

* excessive bouncing
* large transforms
* distracting parallax
* constant motion
* flashy page transitions

Respect reduced-motion preferences where practical.

---

# 23. Typography

Improve typography hierarchy.

Establish clear levels for:

* page titles
* section headings
* card titles
* body text
* metadata
* labels
* status text

Do not use huge headings.

The interface should prioritize information density appropriate for a business application.

---

# 24. Visual Consistency

Audit the application for inconsistent styling.

Fix:

* inconsistent button sizes
* inconsistent spacing
* inconsistent border radii
* inconsistent card treatment
* inconsistent text colors
* inconsistent form controls
* inconsistent dark mode behavior

Reuse shared primitives where possible.

Do not rewrite components merely for the sake of rewriting them.

---

# 25. Performance

Do not sacrifice application performance for visual polish.

Avoid:

* unnecessary dependencies
* heavy animation libraries
* oversized assets
* unnecessary rerenders
* large client-side data transformations

Keep the frontend lightweight.

---

# 26. Role-Aware UI

The frontend must continue respecting the four roles:

* Platform Admin
* Brokerage Admin
* Advisor
* Client

Do not rely on UI hiding alone for security.

Backend authorization remains the actual security boundary.

The UI should simply avoid presenting irrelevant actions where possible.

---

# 27. Existing API and Business Logic

Do not modify backend APIs during this phase.

Do not change:

* database schemas
* authentication
* webhook processing
* document processing
* email automation
* task automation
* dashboard aggregation

If a frontend issue reveals a genuine backend bug, document it separately rather than silently changing backend behavior during UI work.

---

# 28. Dependency Restrictions

Do not add new npm dependencies unless there is a clear requirement.

Prefer:

* existing React
* existing Tailwind
* existing utility components
* browser APIs
* existing project dependencies

Do not install a large UI framework just to improve styling.

---

# 29. Phase Structure

Implement the UI in controlled stages.

### Phase 10A — Design Foundation

Implement:

* theme system
* semantic tokens
* Button
* Input
* global styling
* shared interaction states

Verify before continuing.

### Phase 10B — Application Shell

Implement:

* sidebar
* top header
* mobile navigation
* authenticated layout
* theme toggle integration

Verify before continuing.

### Phase 10C — Login

Redesign:

* login page
* responsive layout
* theme support
* loading/error states

Preserve authentication logic.

### Phase 10D — Dashboard and Pipeline

Redesign:

* dashboard header
* summary cards
* pipeline board
* lead cards
* loading/empty/error states
* responsive behavior
* realtime compatibility

### Phase 10E — Final UI QA

Perform a read-only audit of:

* login
* dashboard
* pipeline
* clients
* documents
* tasks
* email automation
* theme
* responsiveness
* accessibility
* interactions
* loading/error/empty states
* code quality
* lint
* build
* Git state

Fix only genuine issues found during QA.

Do not introduce unrelated redesigns during final QA.

---

# 30. Git Discipline

For each UI stage:

1. Inspect Git status.
2. Implement only the intended scope.
3. Run tests.
4. Run lint.
5. Run build.
6. Review changed files.
7. Review the diff.
8. Verify no backend changes were introduced unintentionally.
9. Commit only after verification.
10. Push to GitHub.
11. Confirm the working tree is clean.

Do not create a commit before reviewing the implementation.

Do not claim a commit contains files that were not actually committed.

---

# 31. Final UI Validation

At the end of Phase 10, verify:

### Visual

* clean professional SaaS appearance
* consistent spacing
* typography hierarchy
* polished cards
* polished forms
* polished buttons
* intentional light mode
* intentional dark mode

### Responsive

* desktop
* tablet
* mobile
* narrow mobile

### Interaction

* hover
* pointer cursor
* focus
* disabled
* loading
* transitions
* mobile navigation

### Accessibility

* labels
* semantic elements
* keyboard navigation
* focus states
* contrast

### Functional

* login
* dashboard
* pipeline
* realtime
* clients
* documents
* tasks
* email automation
* role-aware UI

### Technical

* tests pass
* lint passes or remaining warnings are documented and non-blocking
* build passes
* no unnecessary dependencies
* no backend regressions
* Git working tree clean

---

# 32. Important Scope Rule

The goal is **polish, not feature expansion**.

Do not add unrelated functionality during this phase.

Do not change the product's core architecture.

Do not redesign working backend logic.

Do not add infrastructure.

Do not turn LeadFlow into a marketing website.

The final result should look like a clean, credible SaaS product while preserving the already-working assignment functionality.
