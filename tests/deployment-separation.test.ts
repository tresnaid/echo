import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../server/app';
import { initSchema } from '../server/db/connection';
import { getApiUrl, getMediaUrl } from '../src/api/config';

describe('Standalone & Separate Deployment Support', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  });

  afterEach(() => {
    db.close();
    delete process.env.CORS_ORIGIN;
  });

  it('configures open CORS headers by default when CORS_ORIGIN is not set', async () => {
    const { app } = createApp(db);
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('respects CORS_ORIGIN for specific origins when configured', async () => {
    process.env.CORS_ORIGIN = 'https://echo.customdomain.com';
    const { app } = createApp(db);

    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://echo.customdomain.com');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://echo.customdomain.com');
  });

  it('resolves relative vs absolute URLs correctly with getMediaUrl and getApiUrl', () => {
    // Relative endpoints
    expect(getApiUrl('/api/prompts')).toBe('/api/prompts');
    expect(getApiUrl('api/collections')).toBe('/api/collections');

    // Media URLs
    expect(getMediaUrl(null)).toBe('');
    expect(getMediaUrl(undefined)).toBe('');
    expect(getMediaUrl('/uploads/originals/sample.jpg')).toBe('/uploads/originals/sample.jpg');
    expect(getMediaUrl('https://images.unsplash.com/photo-123')).toBe('https://images.unsplash.com/photo-123');
    expect(getMediaUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
  });
});
