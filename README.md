# PulseOps

> Deployed with Docker, GitHub Actions, and OCI for automated image-based delivery.

PulseOps is a minimal, production-style system health and deployment visibility dashboard built to demonstrate real-world **DevOps workflows** using Docker, CI/CD, and AWS.

The project intentionally prioritizes **operational correctness, automation, and stateless deployment** over feature-heavy application logic.

---

## What This Project Demonstrates

- Containerized frontend and backend services
- Stateless deployment on AWS EC2
- Automated CI/CD using GitHub Actions
- Image-based deployments via Docker Hub
- Zero manual server changes during deployments
- Real-world debugging of production failures (auth, networking, CI issues)

This project is designed as a **DevOps-focused portfolio artifact**.

---

## Architecture Overview

Browser
|
| HTTP
v
Application Load Balancer (ALB)
|
v
AWS EC2 (Docker Host)
|
|-- Nginx Container (Frontend - React)
|
|-- Node.js Container (Backend API)

pgsql
Copy code

- Both services are **stateless**
- EC2 stores **only docker-compose.yml**
- No source code exists on the server
- Deployments are fully image-driven

---

## Backend API

### `GET /health`

Returns current system health.

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
Returns deployment metadata.

json
Copy code
{
  "version": "1.0.0",
  "environment": "production",
  "deployedAt": "2026-01-09T10:45:00.000Z"
}
GET /ai-summary
Simulated AI-generated system summary.

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

Nginx (containerized)

Backend
Node.js

Express

REST API

Stateless service design

DevOps & Infrastructure
Docker

Docker Compose

AWS EC2

AWS Application Load Balancer

GitHub Actions (CI/CD)

Docker Hub (image registry)

Project Structure
swift
Copy code
PulseOps/
├── backend/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── Dockerfile
│   └── src/
│
├── .github/workflows/
│   └── deploy.yml
│
├── docker-compose.yml
└── README.md
Docker Compose (Production)
yaml
Copy code
services:
  backend:
    image: abhichoudhary2077/pulseops-backend:latest
    container_name: pulseops-backend
    restart: unless-stopped
    ports:
      - "3000:3000"

  frontend:
    image: abhichoudhary2077/pulseops-frontend:latest
    container_name: pulseops-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
CI/CD Pipeline
On every push to the main branch:

Backend Docker image is built

Frontend Docker image is built

Images are pushed to Docker Hub

GitHub Actions connects to EC2 via SSH

EC2 pulls latest images

Containers are restarted using Docker Compose

No manual SSH or server configuration is required after initial setup.

Deployment Characteristics
Stateless EC2 instance

Immutable Docker images

No source code stored on server

Fully automated deployments

Manual rollback via image re-deploy

Designed to fail loudly and visibly

DevOps Focus
This project emphasizes:

CI/CD reliability

Container lifecycle management

Infrastructure debugging

Deployment automation

Real-world failure handling

Application logic is intentionally minimal to keep focus on operations.

Intended Use
This project is built as a DevOps portfolio project to demonstrate practical understanding of:

Dockerized deployments

CI/CD pipelines

Cloud infrastructure basics

Production debugging and recovery

Notes
Monitoring and autoscaling are intentionally excluded to keep scope focused

Architecture is single-EC2 by design for learning clarity

Project favors simplicity and correctness over scale