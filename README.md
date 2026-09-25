# Echo

A prompt library for storing, organizing, finding, and copying reusable prompts across multiple types — text, code, image, and video.

Built with React, Atlas Design System, Express, and SQLite.

## Repository Structure

```
echo/
├── backend/        # Express API + SQLite database
├── frontend/       # React SPA (Vite)
├── data/           # Persistent data (SQLite DB + media uploads)
├── docs/           # Global standards and workflow docs
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Development

Start both the API server and frontend dev server together:

```bash
npm run dev
```

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3001  |

Run them individually:

```bash
npm run dev:server   # backend only
npm run dev:client   # frontend only
```

### Production (Docker)

```bash
docker compose up --build
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for service-specific details.

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start both services concurrently     |
| `npm run dev:server` | Start backend only                   |
| `npm run dev:client` | Start frontend only                  |
| `npm run build`      | Build the frontend for production    |
| `npm run start`      | Start the compiled backend server    |
| `npm run test`       | Run backend test suite               |
| `npm run typecheck`  | Type-check both workspaces           |

## Design System

Echo uses the [Atlas Design System](https://github.com/gumelartresnadwinanda/atlas) (`@tresnaid/atlas`) for all UI components, tokens, and theming.
