# LeadFlow

LeadFlow is a multi-tenant mortgage brokerage platform designed for German mortgage brokerages serving expats. It manages the workflow from lead intake through lead qualification, pipeline management, lead-to-client conversion, client document collection, asynchronous document verification, communication automation, advisor tasks, and dashboard monitoring.

This project is a full-stack MERN application using React, TypeScript, and Vite on the frontend, and Node.js, Express, and TypeScript on the backend.

## Live Demo / Production URLs

- Frontend: [https://unsquare-mern-developer-assignment.netlify.app/](https://unsquare-mern-developer-assignment.netlify.app/)
- Backend: [https://unsquareassignmentbackend.vercel.app/](https://unsquareassignmentbackend.vercel.app/)
- Backend health check: [https://unsquareassignmentbackend.vercel.app/api/health](https://unsquareassignmentbackend.vercel.app/api/health)
- Tally test form (Use Unique Values "First name, Last name, Email and Phone Number"): [https://tally.so/r/rjzQpp](https://tally.so/r/rjzQpp)

## How to Test the Project
1. Open the [deployed frontend](https://unsquare-mern-developer-assignment.netlify.app/).
2. Log in using the demo credentials provided below.
3. Open the [Tally form](https://tally.so/r/rjzQpp).
4. Submit a test lead.
5. The submission is sent through the production Tally webhook and created in LeadFlow.
6. The lead appears in the pipeline for the configured brokerage.
7. You can move the lead through the pipeline stages.
8. A lead can be converted into a client.
9. The client can log in and upload documents.
10. Document verification happens asynchronously.
11. Email automation and advisor tasks can be tested via relevant pipeline stage changes.

## Demo / Test Credentials
These are DEMO/TEST credentials for development and evaluation purposes only.

| Role | Email | Password |
| :--- | :--- | :--- |
| Platform Admin | `platform.admin@leadflow.local` | `LeadflowDemo!2026` |
| Brokerage Admin A | `admin.a@leadflow.local` | `LeadflowDemo!2026` |
| Advisor A | `advisor.a@leadflow.local` | `LeadflowDemo!2026` |
| Client A | `client.a@leadflow.local` | `LeadflowDemo!2026` |
| Brokerage Admin B | `admin.b@leadflow.local` | `LeadflowDemo!2026` |
| Advisor B | `advisor.b@leadflow.local` | `LeadflowDemo!2026` |
| Client B | `client.b@leadflow.local` | `LeadflowDemo!2026` |

## Project Summary
LeadFlow is a multi-tenant mortgage brokerage platform developed with a React, TypeScript, and Vite frontend, and a Node.js, Express, and TypeScript backend powered by MongoDB and Mongoose. Key technical decisions included implementing a robust RBAC system with four distinct roles—Platform Admin, Brokerage Admin, Advisor, and Client—enforced by strict server-side tenant isolation. Tally serves as the primary external lead source, integrated through a secure, signature-verified webhook endpoint, while private document storage is facilitated via S3-compatible cloud storage, accompanied by an asynchronous background verification process. The application utilizes JSON Web Tokens for authentication, bcrypt for secure password hashing, and Socket.IO for real-time updates within the brokerage and client scopes. The architectural approach prioritized building a functional, multi-tenant product efficiently, avoiding unnecessary infrastructure complexity.

This was my first experience using AI tools throughout a complete full-stack development workflow. Previously, I had not used AI to create a complete application. During this project, I experimented with several AI coding tools, including GitHub Copilot, Claude, Cursor, and Antigravity. This experience significantly altered how I approach development, teaching me how to work with AI-assisted development rather than simply writing every part manually. Dealing with real production challenges, such as deployment issues, integration testing, and debugging failures on Vercel and Netlify, has greatly expanded my understanding of the complete development lifecycle and the importance of validating AI-generated code.

## What LeadFlow Does
### Lead Management
- Tally lead intake
- Secure webhook authentication
- Duplicate detection
- Webhook idempotency
- Six-stage pipeline (New, Contacted, Qualified, Application, Won, Lost)
- Advisor assignment
- Realtime updates

### Client Management
- Lead-to-client conversion
- Client authentication
- Client portal
- Brokerage-scoped access
- Client ownership restrictions

### Documents
- Private S3-compatible storage
- PDF/JPEG/PNG uploads
- Signed URLs
- Asynchronous verification
- Status: UPLOADED, CHECKING, VERIFIED, FAILED
- Retry support
- Realtime status updates

### Automation
- Email templates
- Placeholder rendering
- Stage-based email triggers
- Email logs
- Advisor task triggers
- Task management
- Realtime task updates

### Dashboard
- Server-side pipeline summary
- Stage counts
- Realtime updates

### Security
- JWT authentication
- bcrypt password hashing
- Four roles (Platform Admin, Brokerage Admin, Advisor, Client)
- Strict brokerage tenant isolation
- Tally HMAC signature verification
- Webhook idempotency
- Private object storage
- Protected cron endpoint

## Roles and Tenant Isolation
| Role | Access |
| :--- | :--- |
| Platform Admin | Platform-wide administration |
| Brokerage Admin | Manages users and data within their brokerage |
| Advisor | Manages leads, clients, documents and tasks within their brokerage |
| Client | Restricted to their own case and documents |

Brokerage-scoped resources are filtered server-side, and clients are additionally restricted to their own records.

## Tech Stack
| Area | Technology |
| :--- | :--- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Realtime | Socket.IO |
| Storage | Supabase S3-compatible private storage |
| Email | Resend |
| Lead Intake | Tally |
| Testing | Vitest |
| Hosting | Netlify (Frontend) + Vercel (Backend) |
| Scheduled Jobs | Vercel Cron |
| Version Control | Git + GitHub |

## Architecture / Production Setup
- **Frontend**: Netlify -> React/Vite application
- **Backend**: Vercel -> Express/TypeScript API
- **Database**: MongoDB Atlas
- **Storage**: Supabase S3-compatible private bucket
- **Email**: Resend
- **Lead Intake**: Tally -> Production webhook -> Backend -> MongoDB -> Realtime pipeline
- **Realtime**: Socket.IO
- **Scheduled Verification**: Vercel Cron -> Protected verification endpoint

## Local Setup
1. Prerequisites: Node.js 20.19+ and npm.
2. From the repository root:
   ```bash
   npm install
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:4000`

## Environment Variables
Ensure the following are configured in your environment:
- **Backend**: MongoDB URI, JWT secret, Frontend/Client URL, S3-compatible storage configuration, Resend API configuration, Tally signing secret, Cron secret.
- **Frontend**: `VITE_API_URL` (e.g., `https://unsquareassignmentbackend.vercel.app`)

*NEVER commit `.env` files or production credentials.*

## Testing
The project is verified with the following final functional QA status:
- 51/51 backend tests passing
- Frontend lint passing
- Backend lint passing
- Frontend production build passing
- Backend production build passing

Commands:
```bash
npm run lint
npm run test
npm run build
```

## Security / Important Decisions
- JWT authentication
- bcrypt password hashing
- Server-side brokerage scoping
- Client ownership enforcement
- Tally HMAC signature verification
- Webhook idempotency
- Private object storage with signed URLs

## Limitations and Future Improvements
The project currently has the following limitations and areas for future improvement:
- Background document verification uses a lightweight worker approach rather than a dedicated distributed queue (e.g., BullMQ + Redis).
- Socket.IO currently uses instance-local coordination, which would require shared infrastructure like Redis for horizontal scaling across multiple instances.
- The production cron endpoint is protected, though scheduled execution was not directly observed during final QA.
- Document verification is simulated and not a real compliance service.
- Only Tally was implemented as the real external lead source.
- Monitoring, structured logging, and automated end-to-end test coverage could be expanded.
- Future work will focus on implementing a durable background queue architecture, shared realtime infrastructure, better monitoring/logging, additional lead sources, real document-processing services, and further continuous UI refinement.

## Repository Structure
```
Lead Flow/
├── client/          # React frontend
├── server/          # Express backend
├── PROMPTS.md       # AI development prompts
└── README.md        # Project documentation
```

## AI Development Prompts
This project was developed using AI-assisted development. Prompts used are are preserved in `PROMPTS.md` as requested for the assignment.

## What I Took Away
This assignment became more than just a submission; it was my first experience building a complete full-stack project with AI-assisted development. I experimented with multiple tools, worked through production deployment problems, gained experience in debugging and integration, and learned the critical importance of validating AI-generated code. I am highly motivated to continue building, learning, and improving LeadFlow beyond this submission.
