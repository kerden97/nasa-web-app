# NASA Web App

## Live Deployment

| Service | Platform | URL |
| ---- | ---- | ---- |
| Frontend | Vercel | [nasa-web-app-iota.vercel.app](https://nasa-web-app-iota.vercel.app) |
| Backend | Render | [nasa-web-app-lv7c.onrender.com](https://nasa-web-app-lv7c.onrender.com) |
| Backend Health | Render | [nasa-web-app-lv7c.onrender.com/healthz](https://nasa-web-app-lv7c.onrender.com/healthz) |

> Note: The Render free tier spins down after inactivity. The first request after idle may take up to 50 seconds.

## Deployment Setup

### Backend (Render)

- Platform: Render Web Service (Free tier)
- Region: Frankfurt (EU Central)
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Health Check Path: `/healthz`
- Auto-Deploy: after CI checks pass on `main`

Required environment variables on Render:

```env
NASA_API_KEY=
NASA_API_BASE_URL=
PORT=4000
FRONTEND_ORIGIN=https://nasa-web-app-iota.vercel.app
```

### Frontend (Vercel)

- Platform: Vercel (Hobby)
- Root Directory: `frontend`
- Framework Preset: Vite
- Auto-Deploy: on commit to `main`

Required environment variables on Vercel:

```env
VITE_API_URL=https://nasa-web-app-lv7c.onrender.com
```

## Local Setup

Two options: Docker Compose (recommended) or manual.

### Option 1: Docker Compose

#### Prerequisites

- Windows / Mac: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: Docker Engine via CLI (`sudo apt install docker.io docker-compose-plugin`)

From the repository root:

```bash
docker compose up -d
```

Available local endpoints:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Backend health check: `http://localhost:4000/healthz`
- Nginx entrypoint: `http://localhost:8080`
- Nginx health check: `http://localhost:8080/healthz`

To stop containers:

```bash
docker compose down
```

### Option 2: Manual Setup

This project uses Node.js v24.x (see `backend/package.json` engines field). Other versions may work but are untested.

#### 1. Set up environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in `backend/.env` with your NASA API key. Set `frontend/.env` with:

```env
VITE_API_URL=http://localhost:4000
```

#### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

#### 3. Run backend

```bash
cd backend && npm run dev
```

#### 4. Run frontend (in a separate terminal)

```bash
cd frontend && npm run dev
```

Available local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Backend health check: `http://localhost:4000/healthz`

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

- **Backend Tests** — `npm test` (Jest) in `backend/`
- **Frontend Tests** — `npm test` (Vitest) in `frontend/`

Both jobs run in parallel. Render (backend) is configured to deploy only after CI checks pass. Vercel (frontend) deploys on every push independently.

Workflow file: `.github/workflows/ci.yml`

## Current Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- ESLint
- Vitest
- React Testing Library
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

### Backend

- Node.js
- Express
- TypeScript
- Nodemon
- Jest
- Supertest
- Winston
- `winston-daily-rotate-file`
- `dotenv`
- `helmet`
- `cors`
- `compression`

### Root / General

- Docker Compose
- Nginx
- Playwright
