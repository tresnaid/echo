# Echo — Frontend

React SPA for the Echo prompt library. Built with Vite and the [Atlas Design System](https://github.com/gumelartresnadwinanda/atlas).

## Stack

- **Framework:** React 19
- **Bundler:** Vite 6
- **Language:** TypeScript
- **Package Manager:** pnpm
- **Design System:** Atlas (`@tresnaid/atlas`)

## Structure

```
frontend/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component — layout, routing, state
│   ├── providers.tsx         # ThemeProvider + AnnouncementProvider setup
│   ├── api/
│   │   ├── config.ts         # API base URL resolution + media URL helpers
│   │   ├── prompts.ts        # Prompt API calls
│   │   └── collections.ts    # Collection API calls
│   ├── components/
│   │   ├── prompts/          # PromptCard, PromptGrid, PromptFormModal, PromptDetailModal, FilterBar, DeletePromptDialog
│   │   └── collections/      # SidebarNavigation, CreateCollectionModal, RenameCollectionModal, DeleteCollectionDialog
│   └── types/                # TypeScript types
├── package.json
├── pnpm-lock.yaml
├── .env.example
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

## Development

```bash
pnpm install
pnpm run dev
```

The dev server starts at `http://localhost:5173` and proxies API requests to the backend (`http://localhost:3001`).

### Connecting to a Custom Backend

Set `VITE_API_URL` to point at the backend:

```bash
VITE_API_URL=https://api-echo.tresnaid.space pnpm run dev
```

If `VITE_API_URL` is empty, API calls are made relative to the current origin (or proxied via Vite in development).

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm run dev`      | Start Vite dev server with hot reload    |
| `pnpm run build`    | Type-check and build SPA to `dist/`      |
| `pnpm run typecheck`| Run TypeScript compiler without emitting |

## Vercel Deployment

Configure your project in the Vercel Dashboard:

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Environment Variables:**
  - `VITE_API_URL`: `https://api-echo.tresnaid.space`

## Production (Docker)

```bash
# Build standalone frontend container
docker build --build-arg VITE_API_URL=https://api-echo.tresnaid.space -t echo-frontend .
```
