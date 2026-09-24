import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import { initSchema } from '../src/db/connection';

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

  it('supports comma-separated multiple origins in CORS_ORIGIN', async () => {
    process.env.CORS_ORIGIN = 'http://localhost:5173,http://localhost:8080';
    const { app } = createApp(db);

    const res1 = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res1.status).toBe(200);
    expect(res1.headers['access-control-allow-origin']).toBe('http://localhost:5173');

    const res2 = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:8080');
    expect(res2.status).toBe(200);
    expect(res2.headers['access-control-allow-origin']).toBe('http://localhost:8080');
  });
});
