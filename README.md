# PulseOps

A minimal, production-style system health and deployment visibility dashboard designed to demonstrate real-world DevOps workflows.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ HealthCard  │  │ VersionCard │  │  AISummaryCard  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │           │
│  ┌──────┴────────────────┴───────────────────┴────────┐ │
│  │              React Query (Data Layer)               │ │
│  └──────────────────────┬──────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────┘
                          │
                   HTTPS API Calls
                          │
┌─────────────────────────┼───────────────────────────────┐
│           Backend (Lovable Cloud Edge Functions)         │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │  /health   │  │  /version  │  │   /ai-summary     │  │
│  │            │  │            │  │  (AI-powered)     │  │
│  └────────────┘  └────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints

### GET /health
Returns the current health status of the system.

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-01-08T14:30:00.000Z",
  "uptime": 86400,
  "checks": {
    "database": "healthy",
    "memory": "healthy"
  }
}
```

### GET /version
Returns application version and build information.

**Response:**
```json
{
  "version": "1.0.0",
  "buildTimestamp": "2026-01-08T14:00:00Z",
  "environment": "production",
  "gitCommit": "a1b2c3d",
  "deployedAt": "2026-01-08T14:30:00.000Z"
}
```

### GET /ai-summary
Returns an AI-generated system status summary.

**Response:**
```json
{
  "summary": "All systems operational. Database and memory checks passing. Uptime stable.",
  "generatedAt": "2026-01-08T14:30:00.000Z",
  "model": "gemini-2.5-flash"
}
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack React Query
- **Backend**: Lovable Cloud Edge Functions (Deno runtime)
- **AI Integration**: Lovable AI Gateway (Gemini 2.5 Flash)

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # App header with health check button
│   │   ├── Dashboard.tsx    # Main dashboard layout
│   │   ├── HealthCard.tsx   # Health status display
│   │   ├── VersionCard.tsx  # Version/deployment info
│   │   ├── AISummaryCard.tsx # AI-generated summary
│   │   ├── MetricCard.tsx   # Reusable card component
│   │   └── StatusBadge.tsx  # Status indicator
│   ├── hooks/
│   │   └── usePulseOps.ts   # Data fetching hooks
│   ├── lib/
│   │   └── api.ts           # API client functions
│   └── pages/
│       └── Index.tsx        # Main page
├── supabase/
│   └── functions/           # Edge functions (backend)
│       ├── health/          # Health check endpoint
│       ├── version/         # Version endpoint
│       └── ai-summary/      # AI summary endpoint
└── README.md
```

## CI/CD Deployment

### Recommended Pipeline

1. **Build Stage**
   ```yaml
   - npm ci
   - npm run build
   - npm run lint
   ```

2. **Test Stage**
   ```yaml
   - npm run test (if tests exist)
   - Health check endpoint verification
   ```

3. **Deploy Stage**
   - Frontend: Deploy built assets to CDN/static hosting
   - Backend: Edge functions deploy automatically with Lovable Cloud

### Environment Variables

The application uses these environment variables (automatically configured by Lovable Cloud):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Backend API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key |
| `LOVABLE_API_KEY` | AI Gateway access (server-side only) |

### Docker Support

The frontend can be containerized with a simple Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Features

- ✅ Real-time health status monitoring
- ✅ Application version and deployment tracking
- ✅ AI-powered system summaries
- ✅ Manual health check trigger
- ✅ Auto-refresh (30-second intervals)
- ✅ Loading and error states
- ✅ Dark terminal-inspired design
- ✅ Stateless backend architecture
- ✅ No hardcoded secrets

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Production Deployment

The backend service is containerized using Docker and deployed on an AWS EC2 instance.
The service exposes health and version endpoints to simulate real production monitoring.

Key characteristics:
- Stateless service
- Environment-based configuration
- Containerized runtime
- Manual rollback via container redeploy.

## DevOps Focus

This project was intentionally designed with minimal application logic to emphasize
DevOps fundamentals:

- Service health monitoring via HTTP endpoints
- Environment-based configuration
- Containerized backend runtime
- Cloud deployment on AWS EC2
- Clear separation between frontend and backend services

The goal was to simulate real-world operational workflows rather than build
feature-heavy application logic.
