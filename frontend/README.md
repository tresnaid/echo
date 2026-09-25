# Echo — Frontend

React SPA for the Echo prompt library. Built with Vite and the [Atlas Design System](https://github.com/gumelartresnadwinanda/atlas).

## Stack

- **Framework:** React 19
- **Bundler:** Vite 6
- **Language:** TypeScript
- **Design System:** Atlas (`@tresnaid/atlas`)

## Structure

```
src/
├── main.tsx              # App entry point
├── App.tsx               # Root component — layout, routing, state
├── providers.tsx         # ThemeProvider + AnnouncementProvider setup
├── api/
│   ├── config.ts         # API base URL resolution + media URL helpers
│   ├── prompts.ts        # Prompt API calls
│   └── collections.ts    # Collection API calls
├── components/
│   ├── prompts/          # PromptCard, PromptGrid, PromptFormModal, PromptDetailModal, FilterBar, DeletePromptDialog
│   └── collections/      # SidebarNavigation, CreateCollectionModal, RenameCollectionModal, DeleteCollectionDialog
└── types/                # Shared TypeScript types
```

## Development

```bash
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies API requests to the backend.

### Connecting to the backend

Set `VITE_API_URL` to point at the backend:

```bash
VITE_API_URL=http://localhost:3001 npm run dev
```

If `VITE_API_URL` is not set, API calls are made relative to the current origin (useful when served behind a reverse proxy).

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start Vite dev server with hot reload    |
| `npm run build`    | Type-check and build to `dist/`          |
| `npm run typecheck`| Type-check without emitting              |

## Production (Docker)

```bash
# From the repo root
docker compose up --build frontend
```

The built SPA is served via Nginx on port 80 (mapped to `5173` by default).

Pass `VITE_API_URL` at build time to configure the backend URL:

```bash
VITE_API_URL=https://api.example.com docker compose up --build frontend
```
