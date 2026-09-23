import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../server/app';
import { initSchema } from '../server/db/connection';

describe('Search and Filtering API', () => {
  let db: Database.Database;
  let app: ReturnType<typeof createApp>['app'];

  beforeEach(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    const created = createApp(db);
    app = created.app;

    // Seed test collections
    const col1 = await request(app).post('/api/collections').send({ name: 'Development' });
    const col2 = await request(app).post('/api/collections').send({ name: 'Design' });

    // Seed test prompts with distinct metadata
    await request(app).post('/api/prompts').send({
      title: 'React Component Architect',
      prompt_text: 'Generate React 19 component with typescript',
      description: 'Creates modern accessible UI component boilerplate',
      usage_description: 'Pass component requirements and props',
      collection_id: col1.body.id,
      category_id: 'code',
      tags: ['react', 'frontend', 'typescript'],
    });

    await request(app).post('/api/prompts').send({
      title: 'Database Schema Optimizer',
      prompt_text: 'Analyze SQLite indexing and queries',
      description: 'Optimizes SQL tables and queries',
      usage_description: 'Paste SQL schema',
      collection_id: col1.body.id,
      category_id: 'code',
      tags: ['sql', 'sqlite', 'backend'],
    });

    await request(app).post('/api/prompts').send({
      title: 'Glassmorphism Icon Prompt',
      prompt_text: 'Generate 3D glassmorphism isometric icon of database server',
      description: 'Midjourney prompt for sleek tech icons',
      usage_description: 'Use with Midjourney v6',
      collection_id: col2.body.id,
      category_id: 'image',
      tags: ['midjourney', 'icon', '3d'],
    });

    await request(app).post('/api/prompts').send({
      title: 'Uncollected Story Prompt',
      prompt_text: 'Write a sci-fi mystery',
      description: 'Creative short story starter',
      category_id: 'text',
      tags: ['creative', 'story'],
    });
  });

  afterEach(() => {
    db.close();
  });

  it('searches prompts by matching title', async () => {
    const res = await request(app).get('/api/prompts?search=React');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('React Component Architect');
  });

  it('searches prompts by matching description', async () => {
    const res = await request(app).get('/api/prompts?search=boilerplate');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('React Component Architect');
  });

  it('searches prompts by matching tag', async () => {
    const res = await request(app).get('/api/prompts?search=midjourney');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Glassmorphism Icon Prompt');
  });

  it('filters prompts by category', async () => {
    const resCode = await request(app).get('/api/prompts?category_id=code');
    expect(resCode.status).toBe(200);
    expect(resCode.body).toHaveLength(2);

    const resImage = await request(app).get('/api/prompts?category_id=image');
    expect(resImage.status).toBe(200);
    expect(resImage.body).toHaveLength(1);
    expect(resImage.body[0].title).toBe('Glassmorphism Icon Prompt');
  });

  it('filters prompts by tag', async () => {
    const res = await request(app).get('/api/prompts?tag=typescript');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('React Component Architect');
  });

  it('filters uncollected prompts', async () => {
    const res = await request(app).get('/api/prompts?collection_id=uncollected');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Uncollected Story Prompt');
  });

  it('combines search, category, and tag filters', async () => {
    const resMatch = await request(app).get('/api/prompts?search=React&category_id=code&tag=frontend');
    expect(resMatch.status).toBe(200);
    expect(resMatch.body).toHaveLength(1);

    const resNoMatch = await request(app).get('/api/prompts?search=React&category_id=image');
    expect(resNoMatch.status).toBe(200);
    expect(resNoMatch.body).toHaveLength(0);
  });
});
