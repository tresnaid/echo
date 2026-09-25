# Echo — Backend

Express REST API serving the Echo prompt library. Handles all CRUD operations for prompts, collections, tags, and media uploads, backed by a SQLite database.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 4
- **Database:** SQLite via `better-sqlite3`
- **Validation:** Zod
- **Media processing:** Multer + Sharp
- **Test runner:** Vitest + Supertest

## Structure

```
src/
├── index.ts          # Server entry point — binds port, handles graceful shutdown
├── app.ts            # Express app factory — middleware, routes
├── routes/
│   ├── prompts.ts    # Prompt CRUD endpoints
│   ├── collections.ts# Collection CRUD endpoints
│   └── media.ts      # Media upload and serving endpoints
├── services/
│   └── mediaService.ts # Thumbnail generation, upload path resolution
└── db/
    ├── connection.ts  # SQLite connection and schema migrations
    └── seed.ts        # Development seed data
```

## Development

```bash
npm run dev
```

API listens on `http://0.0.0.0:3001` by default.

### Seed the database

```bash
npm run seed
```

## Environment Variables

| Variable        | Default                | Description                         |
| --------------- | ---------------------- | ----------------------------------- |
| `PORT`          | `3001`                 | Port the API listens on             |
| `HOST`          | `0.0.0.0`              | Host the API binds to               |
| `DATABASE_PATH` | *(in-memory fallback)* | Absolute path to the SQLite DB file |
| `UPLOADS_PATH`  | *(relative `uploads/`)* | Directory for uploaded media files  |
| `CORS_ORIGIN`   | `*`                    | Comma-separated allowed origins     |

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start with `tsx watch` (hot reload)|
| `npm run build`    | Compile TypeScript to `dist/`      |
| `npm run start`    | Run compiled output                |
| `npm run seed`     | Seed the database with sample data |
| `npm run test`     | Run the test suite                 |
| `npm run typecheck`| Type-check without emitting        |

## API Endpoints

### Prompts

| Method | Path                    | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/api/prompts`          | List prompts (search, filter)  |
| POST   | `/api/prompts`          | Create a prompt                |
| GET    | `/api/prompts/:id`      | Get a prompt by ID             |
| PUT    | `/api/prompts/:id`      | Update a prompt                |
| DELETE | `/api/prompts/:id`      | Soft-delete a prompt           |

### Collections

| Method | Path                       | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/collections`         | List all collections     |
| POST   | `/api/collections`         | Create a collection      |
| PUT    | `/api/collections/:id`     | Rename a collection      |
| DELETE | `/api/collections/:id`     | Delete a collection      |

### Media

| Method | Path                   | Description                          |
| ------ | ---------------------- | ------------------------------------ |
| POST   | `/api/media/upload`    | Upload a media file                  |
| GET    | `/uploads/:filename`   | Serve an uploaded file               |

## Testing

```bash
npm run test
```

Tests cover CRUD operations, collection cascade behaviour, search, filtering, and soft-delete logic using an in-memory SQLite database.

## Production (Docker)

```bash
# From the repo root
docker compose up --build backend
```

The service writes its database and uploads to `../data/` (mounted at `/app/data` inside the container).
