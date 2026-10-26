# PulseOps

A lightweight system-health and deployment-visibility dashboard built to demonstrate containerization, CI/CD, and cloud deployment.

**Live demo:** http://129.225.116.192/  
**Source code:** https://github.com/Abhichaudhary2077/PulseOps

> The demo currently runs over HTTP on a single OCI Compute VM. It is a learning/portfolio environment, not a hardened production service. Do not submit sensitive data.

## Overview

PulseOps is a two-service web application:

- **Frontend:** React, TypeScript, and Vite; served as static assets by NGINX.
- **Backend:** Node.js and Express REST API.
- **Containerization:** Separate Docker images orchestrated with Docker Compose.
- **Delivery:** GitHub Actions builds and publishes the images to Docker Hub, then connects to the OCI VM over SSH to pull and run the published images.
- **System metrics:** The backend exposes Linux/Node system metrics for CPU, memory, load average, and uptime through a `/system` endpoint.

The deployment is image-based: compilation and image builds run on the GitHub-hosted runner. The OCI VM pulls the built images and runs the containers; it does not build the application from source during deployment.

## Live architecture

```text
Browser
  |
  | HTTP :80
  v
OCI Compute VM
  |
  +-- NGINX frontend container
  |     +-- serves the built React application
  |     +-- proxies /api/* to the backend service
  |
  +-- Express backend container
        +-- /health
        +-- /version
        +-- /ai-summary
        +-- /system
```

Both containers run on the Docker Compose network. The Compose configuration publishes **port 80** for the frontend; the backend's port **3000 is not published on the VM host**. NGINX forwards requests under `/api/` to `backend:3000` and removes the `/api/` prefix when proxying.

## Features

- Separate frontend and backend Docker images.
- Multi-stage frontend image: Vite builds the static assets, then NGINX serves them.
- Docker Compose service orchestration with restart policies.
- GitHub Actions CI/CD triggered by pushes to `main`.
- Docker Hub publishing with `latest` and commit-SHA image tags.
- SSH-based deployment to OCI using GitHub Actions secrets.
- API rate limiting: 60 requests per minute per client key, returning HTTP `429` when the limit is exceeded.
- React Query refreshes the health and VM-metrics data every 30 seconds.
- VM metrics endpoint reads Linux `/proc` data and Node.js `os` information; it does not require OCI API credentials.

## API endpoints

The public browser-facing paths are proxied by NGINX to the corresponding Express routes.

| Endpoint | Purpose | Current behaviour |
|---|---|---|
| `GET /api/health` | Application health response | Returns API status, backend-process uptime, and a timestamp. The `database` and `memory` labels in `checks` are currently placeholders, not live dependency checks. |
| `GET /api/version` | Version/environment metadata | Returns `version`, `environment`, and `deployedAt`. Defaults are defined in the backend when environment variables are not set. |
| `GET /api/ai-summary` | Summary card content | Currently returns a fixed demonstration message and a generated timestamp; it does not call an AI service. |
| `GET /api/system` | Runtime system metrics | Returns runtime hostname, platform, architecture, CPU information, memory totals/usage/availability, 1/5/15-minute load averages, and uptime read from Linux `/proc` and Node.js system APIs. |

### Rate limiting

The Express rate limiter is applied to backend API routes. NGINX sends the client's address in `X-Real-IP`; the backend uses that address when deriving the rate-limit key. Exceeding the configured limit returns a JSON response with status `RATE_LIMITED` and HTTP `429`.

## Technology stack

**Frontend**
- React 18, TypeScript, Vite
- TanStack React Query
- Tailwind CSS and shadcn/Radix UI components
- Lucide icons

**Backend**
- Node.js 20, Express
- `cors`, `express-rate-limit`
- Linux `/proc` and Node.js `os` APIs for system data

**DevOps and infrastructure**
- Docker and Docker Compose
- NGINX reverse proxy/static server
- GitHub Actions with Docker Buildx
- Docker Hub image registry
- OCI Compute running Oracle Linux

## Repository layout

```text
PulseOps/
├── .github/workflows/deploy.yml  # build, publish, and deploy pipeline
├── backend/
│   ├── Dockerfile
│   ├── index.js                  # Express routes and rate limiter
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── Dockerfile                # Vite build stage + NGINX runtime
│   ├── nginx/default.conf        # static hosting and /api proxy
│   ├── package.json
│   └── src/
│       ├── components/           # dashboard cards and UI components
│       ├── hooks/                # React Query and UI hooks
│       ├── lib/api.ts            # browser API calls
│       └── pages/
├── docker-compose.yml
└── README.md
```

## Run the published images locally

Requirements: Docker Engine and Docker Compose v2. Port 80 must be available on your machine.

```bash
git clone https://github.com/Abhichaudhary2077/PulseOps.git
cd PulseOps
docker compose pull
docker compose up -d
docker compose ps
```

Open [http://localhost/](http://localhost/). The Compose file uses the published `latest` images.

To build the images from the checked-out source instead, build them using the same tags referenced by `docker-compose.yml`, then start Compose:

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

Stop the containers with `docker compose down`.

## CI/CD workflow

The workflow in `.github/workflows/deploy.yml` runs on pushes to `main`:

1. Checks out the repository and configures Docker Buildx.
2. Authenticates to Docker Hub using GitHub Actions secrets.
3. Builds and pushes backend and frontend images tagged `latest` and with the commit SHA.
4. Connects to the OCI VM over SSH.
5. Runs `docker compose pull`, `docker compose up -d --remove-orphans`, and `docker image prune -f`.
6. Prints memory usage and service status before/after deployment.

The workflow requires these repository secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `OCI_HOST`, `OCI_USER`, and `OCI_SSH_KEY`.

**Deployment detail:** image tags include the commit SHA for traceability, but the current Compose file references the `latest` tags. Deployment therefore runs the images resolved from `latest`, rather than pinning Compose to a specific commit tag. The deployment recreates containers and may cause a brief interruption; it is not a zero-downtime or multi-instance rollout.

## Configuration

The backend supports these environment variables:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Express listening port |
| `APP_VERSION` | `1.0.0` | Version value returned by `/version` |
| `NODE_ENV` | `production` | Environment label returned by `/version` |
| `DEPLOYED_AT` | Current timestamp when responding | Value returned as `deployedAt` |

The current Compose file does not set these variables explicitly.

## Current scope and limitations

- Single-VM deployment; no high availability, multi-node orchestration, or automatic failover.
- The demo uses HTTP and does not currently configure TLS/HTTPS or application authentication.
- No database is connected; the database status in `/health` is a placeholder.
- The AI summary is static demonstration content, not a live model integration.
- The health endpoint's memory/database labels are not threshold-based checks; the separate `/system` endpoint supplies the numeric VM metrics.
- The UI has fields intended for commit/build metadata, but the current `/version` response does not yet return `gitCommit` or `buildTimestamp`.
- The workflow builds and deploys images but does not currently run a dedicated automated test or post-deployment smoke-test stage.
- The live demo is public. Keep secrets in GitHub Actions secrets and never commit credentials, private keys, or production data.

## Project goal

PulseOps is a practical DevOps portfolio project focused on repeatable containerized deployment, CI/CD automation, reverse proxying, API reliability controls, and system visibility on a small cloud VM. It is intentionally compact so the deployment and operational behaviour can be inspected directly.
