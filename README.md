# PulseOps

PulseOps is a small system-health dashboard built to demonstrate containerized application delivery, CI/CD, reverse proxying, and operational visibility on a low-resource cloud VM.

**Live demo:** http://129.225.116.192/  
**Source code:** https://github.com/Abhichaudhary2077/PulseOps

> The public demo currently uses HTTP on a single OCI Compute VM. It is a portfolio/learning deployment, not a hardened production service. Do not submit sensitive data.

## What it demonstrates

- React + TypeScript frontend served by NGINX.
- Express API packaged as a separate Docker image.
- Docker Compose orchestration with backend/frontend health checks and resource limits.
- GitHub Actions validation before image publishing and deployment.
- Docker Hub images tagged with both `latest` and the full Git commit SHA.
- SHA-pinned deployments so the VM runs the image built from the triggering commit.
- Deployment smoke tests through the NGINX proxy, with a local-image rollback path on failure.
- Runtime memory, CPU, load-average, and uptime visibility using Linux `/proc` data and Node.js `os` APIs.
- Commit and build-time metadata displayed in the dashboard.

## Architecture

```text
Browser
  |
  | HTTP :80
  v
OCI Compute VM
  |
  +-- NGINX frontend container (:80)
  |     +-- serves the built React application
  |     +-- forwards /api/* to backend:3000
  |
  +-- Express backend container (:3000, internal only)
        +-- /health
        +-- /version
        +-- /ai-summary
        +-- /system
```

Only the frontend publishes a host port. The backend is reachable through the Compose network, not directly through a public host port. NGINX removes the `/api/` prefix when forwarding requests; for example, `/api/health` reaches the backend `/health` route.

## Dashboard and API

| Browser-facing endpoint | Purpose | Behaviour |
|---|---|---|
| `GET /api/health` | Application health | Reports API reachability, process uptime, and a memory-status check. Overall status is `UP` when memory is healthy and `DEGRADED` when the memory check is warning, unhealthy, or unavailable. |
| `GET /api/version` | Build metadata | Returns application version, environment, full Git commit, build timestamp, and optional deployment timestamp. |
| `GET /api/ai-summary` | Operational summary | Produces a small **rules-based** message from the memory status. It is not a model/AI integration; the route name is retained for API compatibility. |
| `GET /api/system` | VM/runtime metrics | Returns CPU utilisation, CPU count, memory totals/usage/availability, 1/5/15-minute load averages, platform, architecture, hostname, and VM uptime. |

Memory status thresholds are below 85% (healthy), 85–94.9% (warning), and 95% or above (unhealthy). The metrics describe the Linux host view available to the container; they are not OCI billing or account metrics.

The health response explicitly labels the database as `not_configured`. No database is connected. The dashboard therefore does not claim a nonexistent dependency is healthy.

The Express API rate limiter allows up to 60 requests per minute per client key and returns HTTP 429 when that limit is exceeded. NGINX supplies the client IP in `X-Real-IP`.

## Technology

- **Frontend:** React 18, TypeScript, Vite, TanStack React Query, Tailwind CSS, shadcn/Radix UI components, Lucide icons.
- **Backend:** Node.js 20, Express, `express-rate-limit`, Linux `/proc` and Node.js `os` APIs.
- **Container/build:** Docker, Docker Compose, multi-stage frontend image, Docker Hub.
- **Delivery:** GitHub Actions, Buildx, SSH deployment to OCI Compute running Oracle Linux.
- **Maintenance:** npm lockfiles, API tests with Node's built-in test runner, Dependabot update checks.

## Repository structure

```text
PulseOps/
├── .github/
│   ├── dependabot.yml
│   └── workflows/deploy.yml
├── backend/
│   ├── app.js
│   ├── index.js
│   ├── test/app.test.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx/default.conf
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── lib/api.ts
└── docker-compose.yml
```

## Run with the published images

Requirements: Docker Engine and Docker Compose v2. Port 80 must be available.

```bash
git clone https://github.com/Abhichaudhary2077/PulseOps.git
cd PulseOps
docker compose pull
docker compose up -d
docker compose ps
```

Open http://localhost/. Without a local `.env`, Compose defaults to the public `latest` images. The deployment workflow writes a private-permission `.env` on the VM containing the deployed SHA tag and registry username, so subsequent Compose commands continue to use the pinned release.

To build locally from source:

```bash
docker build -t abhichoudhary2077/pulseops-backend:latest ./backend
docker build -t abhichoudhary2077/pulseops-frontend:latest ./frontend
docker compose up -d
```

Useful checks:

```bash
curl http://localhost/api/health
curl http://localhost/api/version
curl http://localhost/api/ai-summary
curl http://localhost/api/system
docker compose logs -f
```

Stop the services with `docker compose down`.

## CI/CD workflow

The GitHub Actions workflow runs validation on pull requests to `main`, pushes to `main`, and manual dispatches. Validation performs:

1. `npm ci` for backend and frontend dependencies.
2. Backend endpoint and rate-limit tests using `node --test`.
3. Frontend ESLint checks, TypeScript type-checking, and a production Vite build.

Only a push or manual dispatch on `main` continues to deployment. The pipeline generates build metadata, builds and publishes both images with `latest` and full-SHA tags, then uses SSH to deploy the full-SHA tags to the VM. Backend builds embed the short version, full commit, and UTC build timestamp into the image.

After deployment, the workflow checks the health route, verifies that the version route reports the expected commit and timestamp, and checks the system-metrics payload through NGINX. It retains locally tagged rollback copies of the previously running images and attempts to restore them if the deployment or smoke test fails. Rollback can only help when an earlier pair of containers exists and their images are still present on the VM.

### Required GitHub Actions secrets

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub account used to publish/pull images |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `OCI_HOST` | Public hostname/IP of the OCI VM |
| `OCI_USER` | SSH login user for the OCI VM |
| `OCI_SSH_KEY` | Private SSH key used by GitHub Actions |

Never put secret values, private keys, access tokens, or production data in tracked files. `.gitignore` and the Docker ignore files exclude common local environment files from the repository and image build contexts.

## Container safeguards

- Backend runs as the unprivileged `node` user.
- Backend filesystem is read-only except for a small `/tmp` tmpfs.
- Backend drops Linux capabilities and enables `no-new-privileges`.
- Compose applies memory, CPU, and process-count limits to both services.
- Docker health checks verify both services and control backend startup ordering.
- NGINX sets baseline browser security headers and explicit proxy timeouts.
- Frontend API requests time out after 10 seconds rather than spinning indefinitely.

## Known limitations

- Single VM: no high availability, multi-node scheduling, or automatic infrastructure failover.
- Public demo uses HTTP, not HTTPS, and has no application authentication.
- No database is configured.
- Operational summary is rule-based, not AI-generated.
- Memory status is an approximate host-level signal; it is not a full alerting/monitoring system and does not persist historical metrics.
- Deployments may briefly interrupt requests while containers are replaced; this is not a zero-downtime rollout.
- Automatic image rollback is best-effort; this is a compact portfolio system, not a production release platform.

## Project goal

PulseOps is intended to be an inspectable DevOps portfolio artifact: a small application with repeatable builds, explicit runtime metadata, honest health reporting, reproducible dependencies, container safeguards, and verifiable deployments.
