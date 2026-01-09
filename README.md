# PulseOps

PulseOps is a minimal, production-style system health and deployment visibility dashboard built to demonstrate real-world DevOps workflows using Docker, CI/CD, and AWS.

The project intentionally focuses on operational correctness, automation, and deployment reliability rather than feature-heavy application logic.

---

## Architecture Overview

┌─────────────────────────────────────────────────────────┐
│ Frontend (React) │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐ │
│ │ HealthCard │ │ VersionCard │ │ AISummaryCard │ │
│ └──────┬──────┘ └──────┬──────┘ └────────┬────────┘ │
│ │ │ │ │
│ ┌──────┴────────────────┴───────────────────┴────────┐│
│ │ React Query (Data Fetch Layer) ││
│ └──────────────────────┬─────────────────────────────┘│
└─────────────────────────┼──────────────────────────────┘
│ HTTP REST API
│
┌─────────────────────────┼──────────────────────────────┐
│ Backend (Node.js + Express) │
│ ┌────────────┐ ┌────────────┐ ┌──────────────────┐ │
│ │ /health │ │ /version │ │ /ai-summary │ │
│ │ │ │ │ │ (mock AI output) │ │
│ └────────────┘ └────────────┘ └──────────────────┘ │
│ │
│ Docker Container (Stateless Service) │
└─────────────────────────┼──────────────────────────────┘
│
AWS EC2 (Docker Host)

yaml
Copy code

---

## API Endpoints

### GET /health

Returns the current health status of the system.

```json
{
  "status": "UP",
  "uptime": 930,
  "timestamp": "2026-01-09T10:49:52.681Z",
  "checks": {
    "database": "healthy",
    "memory": "healthy"
  }
}
GET /version
Returns application version and deployment metadata.

json
Copy code
{
  "version": "1.0.0",
  "environment": "production",
  "deployedAt": "2026-01-09T10:45:00.000Z"
}
GET /ai-summary
Returns a simulated AI-generated system summary.

json
Copy code
{
  "summary": "System healthy. All checks passing. No action required.",
  "generatedAt": "2026-01-09T10:50:00.000Z"
}
Tech Stack
Frontend
React 18

TypeScript

Vite

Tailwind CSS

TanStack React Query

Backend
Node.js

Express

REST API

Stateless architecture

Infrastructure & DevOps
Docker

Docker Compose

AWS EC2

Nginx (host-based reverse proxy)

GitHub Actions (CI/CD)

Docker Hub (Image Registry)

Project Structure
bash
Copy code
PulseOps/
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── pages/
│
├── frontend/
│   └── dist/                # Built frontend assets
│
├── .github/workflows/
│   └── deploy.yml           # CI/CD pipeline
│
├── docker-compose.yml
└── README.md
CI/CD Pipeline
On every push to the main branch, the following steps are executed automatically using GitHub Actions:

Backend Docker image is built

Image is pushed to Docker Hub

docker-compose.yml is copied to EC2 (stateless deployment)

EC2 pulls the latest Docker image

Containers are restarted using Docker Compose

Old Docker images are pruned to conserve disk space

Deployment Characteristics
Stateless EC2 instance

No source code stored on server

Immutable Docker images

Fully automated deployment

Manual rollback via image redeploy

Docker Compose
yaml
Copy code
version: "3.9"

services:
  backend:
    image: abhichoudhary2077/pulseops-backend:latest
    container_name: pulseops-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
Environment Configuration
Frontend API resolution is environment-aware:

Local development uses http://localhost:3000

Production uses http://<EC2_PUBLIC_IP>:3000

No secrets are hardcoded in the frontend.

Production Deployment
Backend runs inside Docker on AWS EC2

Frontend is served via Nginx

API is accessed via public EC2 IP

CI/CD handles all deployments automatically

Rollback is performed by redeploying a previous Docker image.

DevOps Focus
This project was designed to emphasize core DevOps principles:

Service health monitoring via HTTP endpoints

Stateless backend architecture

Containerized application runtime

Cloud deployment on AWS

CI/CD automation using GitHub Actions

Clear separation between application and infrastructure

The objective is to demonstrate real-world operational workflows rather than application complexity.