# Echo — Backend

Express REST API serving the Echo prompt library. Handles all CRUD operations for prompts, collections, tags, and media uploads, backed by a SQLite database.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 4
- **Database:** SQLite via `better-sqlite3`
- **Validation:** Zod
- **Media processing:** Multer + Sharp
- **Package Manager:** pnpm
- **Test runner:** Vitest + Supertest

## Structure

```
backend/
├── src/
│   ├── index.ts          # Server entry point — binds port, handles graceful shutdown
│   ├── app.ts            # Express app factory — middleware, routes
│   ├── routes/
│   │   ├── prompts.ts    # Prompt CRUD endpoints
│   │   ├── collections.ts# Collection CRUD endpoints
│   │   └── media.ts      # Media upload and serving endpoints
│   ├── services/
│   │   └── mediaService.ts # Thumbnail generation, upload path resolution
│   └── db/
│       ├── connection.ts  # SQLite connection and schema migrations
│       └── seed.ts        # Development seed data
├── tests/                # Automated API and integration tests
├── package.json
├── pnpm-lock.yaml
├── .env.example
├── tsconfig.json
└── Dockerfile
```

## Development

```bash
cd backend
pnpm install
pnpm run dev
```

API listens on `http://0.0.0.0:3001` by default.

### Seed the database

```bash
pnpm run seed
```

## Environment Variables

| Variable        | Default                | Description                         |
| --------------- | ---------------------- | ----------------------------------- |
| `PORT`          | `3001`                 | Port the API listens on             |
| `HOST`          | `0.0.0.0`              | Host the API binds to               |
| `DATABASE_PATH` | *(in-memory fallback)* | Absolute path to the SQLite DB file |
| `UPLOADS_PATH`  | *(relative `uploads/`)*| Directory for uploaded media files  |
| `CORS_ORIGIN`   | `*`                    | Comma-separated allowed origins     |

## Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm run dev`      | Start with `tsx watch` (hot reload)|
| `pnpm run build`    | Compile TypeScript to `dist/`      |
| `pnpm run start`    | Run compiled output                |
| `pnpm run seed`     | Seed the database with sample data |
| `pnpm run test`     | Run the test suite                 |
| `pnpm run typecheck`| Type-check without emitting        |

## Testing

```bash
pnpm run test
```

Tests cover CRUD operations, collection cascade behaviour, search, filtering, and soft-delete logic using an in-memory SQLite database.

## Production (Docker)

```bash
# Build standalone backend container
docker build -t echo-backend ./backend
```
