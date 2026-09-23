import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { getDatabase } from './db/connection';
import { createCollectionsRouter } from './routes/collections';
import { createPromptsRouter, createCategoriesRouter, createTagsRouter } from './routes/prompts';
import { createMediaRouter, createPromptMediaRouter } from './routes/media.js';
import { getUploadsDir } from './services/mediaService.js';
import Database from 'better-sqlite3';

export function createApp(dbInstance?: Database.Database) {
  const app = express();
  const db = dbInstance || getDatabase();

  app.use(cors());
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

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return { app, db };
}
