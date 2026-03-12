# Local Setup

## Run with Docker Compose

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

## Current Stack

### Frontend

- React
- Vite
- TypeScript
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

## Environment Files

- `frontend/.env`
- `frontend/.env.example`
- `backend/.env`
- `backend/.env.example`
