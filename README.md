# Echo

A prompt library for storing, organizing, finding, and copying reusable prompts across multiple types — text, code, image, and video.

Built with React, Atlas Design System, Express, and SQLite.

## Repository Structure

The frontend and backend are maintained in the same repository as fully independent applications (no root workspace or shared package manager root).

```
echo/
├── frontend/           # React SPA (Vite + Atlas DS)
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── .env.example
├── backend/            # Express REST API + SQLite database
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── .env.example
├── docs/               # Global standards and workflow docs
├── .github/            # CI/CD workflows (CI checks & VPS backend release)
├── compose.prod.yml    # Source of truth for production VPS Compose deployment
└── docker-compose.yml  # Local multi-service development Compose
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

---

## Frontend

The frontend is an independent React SPA deployable directly to Vercel or locally with Vite.

### Installation & Development

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend dev server starts at `http://localhost:5173`.

### Typecheck & Build

```bash
cd frontend
pnpm run typecheck
pnpm run build
```

### Vercel Deployment

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL`: `https://api-echo.tresnaid.space`

---

## Backend

The backend is an independent Express REST API with SQLite persistence and media processing.

### Installation & Development

```bash
cd backend
pnpm install
pnpm run dev
```

The API server starts at `http://localhost:3001`.

### Typecheck, Tests & Build

```bash
cd backend
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run start
```

---

## Local Development with Docker Compose

To run both services together using Docker:

```bash
docker compose up --build
```

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3001  |

---

## Production VPS Deployment

The production backend runs on a VPS at `/srv/apps/echo/` using a prebuilt container image from GitHub Container Registry (GHCR):

- `compose.prod.yml` defines the container service and is synchronized by GitHub Actions on release tags (`v*-be`).
- Persistent SQLite database and uploads live in `/srv/apps/echo/data/` on the VPS and are preserved across deployments.
- No manual VPS filesystem changes are required.

---

## Design System

Echo uses the [Atlas Design System](https://github.com/gumelartresnadwinanda/atlas) (`@tresnaid/atlas`) for UI components, tokens, and theming.
