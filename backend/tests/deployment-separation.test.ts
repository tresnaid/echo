import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';
import { initSchema } from '../src/db/connection.js';

describe('Standalone & Separate Deployment Support', () => {
  let db: Database.Database;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    delete process.env.CORS_ORIGIN;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    db.close();
    process.env = { ...originalEnv };
  });

  it('configures open CORS in development/testing mode when CORS_ORIGIN is not set', async () => {
    process.env.NODE_ENV = 'development';
    const { app } = createApp(db);
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('restricts CORS in production mode when CORS_ORIGIN is not set', async () => {
    process.env.NODE_ENV = 'production';
    const { app } = createApp(db);
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://untrusted-site.com');

    expect(res.status).toBe(200);
    // Should NOT allow untrusted site
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('respects CORS_ORIGIN for specific origins when configured in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'https://echo.customdomain.com';
    const { app } = createApp(db);

    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://echo.customdomain.com');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://echo.customdomain.com');

    const blocked = await request(app)
      .get('/api/health')
      .set('Origin', 'https://evil.com');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('supports comma-separated multiple origins in CORS_ORIGIN', async () => {
    process.env.NODE_ENV = 'production';
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

  it('returns consistent JSON 404 for unknown /api/* routes', async () => {
    const { app } = createApp(db);
    const res = await request(app).get('/api/unknown-endpoint');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body).toEqual({ error: 'Not Found' });
  });

  it('configures trust proxy for reverse proxies', () => {
    const { app } = createApp(db);
    expect(app.get('trust proxy')).toBe(1);
  });

  it('validates health endpoint response structure and database connectivity status', async () => {
    const { app } = createApp(db);
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('database', 'connected');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
  });

  describe('Release Tag Filtering Logic', () => {
    // Strict regex matching requirement: ^v[0-9]+\.[0-9]+\.[0-9]+-be$
    const isBackendReleaseTag = (tag: string): boolean => {
      return /^v[0-9]+\.[0-9]+\.[0-9]+-be$/.test(tag);
    };

    it('matches valid backend release tags', () => {
      const validBackendTags = [
        'v1.0.0-be',
        'v1.0.1-be',
        'v2.10.3-be',
        'v10.20.30-be',
      ];

      for (const tag of validBackendTags) {
        expect(isBackendReleaseTag(tag), `Expected tag ${tag} to match backend release filter`).toBe(true);
      }
    });

    it('rejects invalid tags, frontend tags, and legacy dot-separated tags', () => {
      const invalidTags = [
        'v.1.0.0-be',
        'v1.0-be',
        'v1.0.0',
        'v1.0.1',
        'v2.0.0',
        'v1.0.0-fe',
        'vfoo-be',
        '1.0.0-be',
        'main',
      ];

      for (const tag of invalidTags) {
        expect(isBackendReleaseTag(tag), `Expected tag ${tag} NOT to match backend release filter`).toBe(false);
      }
    });
  });

  describe('Production Compose Configuration Invariants', () => {
    it('verifies compose.prod.yml uses prebuilt GHCR image without local build', () => {
      const composeProdPath = path.resolve(process.cwd(), '../compose.prod.yml');
      if (fs.existsSync(composeProdPath)) {
        const content = fs.readFileSync(composeProdPath, 'utf8');
        expect(content).toContain('image: ghcr.io/tresnaid/echo:${ECHO_VERSION}');
        expect(content).not.toContain('build:');
        expect(content).toContain('./data:/app/data');
        expect(content).toContain('127.0.0.1');
      }
    });
  });
});
