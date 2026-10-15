# Echo

A multi-modal prompt library for cataloging, parameterizing, discovering, and deploying reusable AI prompts across text, code, image, and video generation workflows.

[![Live App](https://img.shields.io/badge/Live_App-echo.tresnaid.space-2b6cb0?style=flat-square)](https://echo.tresnaid.space/)
[![Design System](https://img.shields.io/badge/UI_Library-@tresnaid/atlas-informational?style=flat-square)](https://atlas.tresnaid.space/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-black?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=flat-square)](https://github.com/WiseLibs/better-sqlite3)

---

## Overview

Prompt engineering requires structure, versioning, and fast retrieval. **Echo** serves as a personal prompt repository that organizes complex prompts into structured cards with syntax highlighting, parameter variables, modal previews, and one-click clipboard copying.

It also serves as a reference production implementation of the **Atlas Design System** (`@tresnaid/atlas`), leveraging its accessible component primitives, design tokens, and CSS layers.

### Key Highlights
- **Multi-Modal Organization:** Dedicated categories and metadata fields for Text (LLMs, system instructions, few-shot), Code, Image generation (Diffusion and Text-to-Image models), and Generative Video.
- **Atlas Design System Integration:** Built with `@tresnaid/atlas` components (`Card`, `Button`, `Badge`, `Stack`, `Input`, `ThemeProvider`), adhering to WCAG 2.2 AA accessibility standards.
- **Fast Full-Text Search:** Instant client and server filtering by title, prompt body, modality tags, and keywords.
- **Decoupled Architecture:** Independent frontend SPA (Vite + React 19) and backend REST API (Express + SQLite) for independent deployment and zero coupling.
- **Containerized Production Deployment:** Production backend packaged as Docker containers on GitHub Container Registry (GHCR) and deployed to a VPS with persistent SQLite storage.

---

## Tech Stack

| Area | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Atlas Design System (`@tresnaid/atlas`) |
| **Backend** | Node.js, Express, TypeScript, Zod, Multer, Sharp (Image Processing) |
| **Database** | SQLite (`better-sqlite3`) with schema migrations and seed scripts |
| **Testing & Tooling** | Vitest, Supertest, TSX, ESLint, Prettier |
| **DevOps & Hosting** | Vercel (Frontend), Docker Compose + GHCR + VPS (Backend) |

---

## Repository Structure

The frontend and backend are maintained within the same repository as independent applications without a shared root workspace:

```text
echo/
├── frontend/           # React 19 SPA (Vite + Atlas Design System)
│   ├── src/            # Components, views, hooks, and services
│   ├── package.json
│   └── .env.example
├── backend/            # Express REST API with SQLite persistence
│   ├── src/            # Controllers, routes, DB migrations, seed scripts
│   ├── package.json
│   └── .env.example
├── docs/               # Architecture standards and deployment runbooks
├── .github/            # GitHub Actions CI/CD workflows
├── compose.prod.yml    # Production Docker Compose specification for VPS
└── docker-compose.yml  # Local multi-service development Compose
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+ (or npm)
- Docker (optional, for containerized local development)

---

### Local Development (Manual)

#### 1. Backend Setup

```bash
cd backend
pnpm install
pnpm run seed    # (Optional) Seed the database with starter prompts
pnpm run dev     # Starts Express server at http://localhost:3001
```

#### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
pnpm install
pnpm run dev     # Starts Vite dev server at http://localhost:5173
```

---

### Local Development (Docker Compose)

To start both services together with Docker:

```bash
docker compose up --build
```

| Service | Local Address |
| :--- | :--- |
| **Frontend** | `http://localhost:5173` |
| **Backend API** | `http://localhost:3001` |

---

## Production Deployment

### Frontend (Vercel)
The frontend is statically compiled and deployed to Vercel:
- **Production URL:** [https://echo.tresnaid.space/](https://echo.tresnaid.space/)
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`
- **EnvHub scope:** `echo/frontend-production`
- **Vercel bootstrap variable:** sensitive Production-only `ENVHUB_TOKEN`

Vercel fetches `VITE_API_URL` from EnvHub during `pnpm run build`. Vite embeds
that public URL into the frontend bundle; the EnvHub token is unset before Vite
runs and is never sent to the browser.

### Backend (VPS via Docker & GHCR)
The production backend runs as an isolated container at `/srv/apps/echo/`:
- **Production API:** `https://api-echo.tresnaid.space`
- Images are automatically built and published to GHCR via GitHub Actions on release tags (`v*-be`).
- Database and uploaded assets are persisted under `/srv/apps/echo/data/` across container rebuilds.
- Runtime configuration is fetched from EnvHub through GitHub OIDC; production does not use a persistent `.env` file.

See [the EnvHub migration runbook](docs/ENVHUB_MIGRATION.md) and the separate
[identity reference](docs/ENVHUB_IDENTITIES.md) for setup, release, rollback,
and local development instructions.
