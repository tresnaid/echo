import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { getDatabase } from './db/connection.js';
import { createCollectionsRouter } from './routes/collections.js';
import { createPromptsRouter, createCategoriesRouter, createTagsRouter } from './routes/prompts.js';
import { createMediaRouter, createPromptMediaRouter } from './routes/media.js';
import { getUploadsDir } from './services/mediaService.js';
import Database from 'better-sqlite3';

export function createApp(dbInstance?: Database.Database) {
  const app = express();
  const db = dbInstance || getDatabase();

  // Trust first proxy (e.g. Nginx, Cloudflare) for accurate client IP in X-Forwarded-For
  app.set('trust proxy', 1);

  // Configure CORS
  const corsOrigin = process.env.CORS_ORIGIN;
  if (corsOrigin) {
    const allowedOrigins = corsOrigin
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    app.use(
      cors({
        origin: (requestOrigin, callback) => {
          if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
            return callback(null, true);
          }
          return callback(null, false);
        },
        credentials: true,
      })
    );
  } else if (process.env.NODE_ENV === 'production') {
    // In production without CORS_ORIGIN, disallow cross-origin requests by default
    app.use(cors({ origin: false }));
  } else {
    // In development / testing, allow open CORS
    app.use(cors({ origin: true, credentials: true }));
  }

  app.use(express.json());

  // Static serving for uploaded media assets (images, thumbnails, videos)
  const uploadsDir = getUploadsDir();
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1y',
    immutable: true,
  }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    try {
      const result = db.prepare('SELECT 1 as healthy').get() as { healthy: number };
      res.json({
        status: 'ok',
        database: result.healthy === 1 ? 'connected' : 'unhealthy',
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      res.status(500).json({ status: 'error', error: message });
    }
  });

  // API Endpoints
  app.use('/api/collections', createCollectionsRouter(db));
  app.use('/api/prompts/:id/media', createPromptMediaRouter(db));
  app.use('/api/prompts', createPromptsRouter(db));
  app.use('/api/categories', createCategoriesRouter(db));
  app.use('/api/tags', createTagsRouter(db));
  app.use('/api/media', createMediaRouter(db));

  // Explicit JSON 404 handler for unknown /api/* endpoints
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Serve static assets if dist exists (monolithic / same-server mode)
  const distPath = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Not Found' });
      }
    });
  } else {
    // Split-server mode: any unhandled non-API route returns JSON 404
    app.use((_req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });
  }

  return { app, db };
}
