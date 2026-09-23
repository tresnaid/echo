import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../server/app';
import { initSchema } from '../server/db/connection';

describe('Prompt Detail Modal & Context Preservation API', () => {
  let db: Database.Database;
  let app: ReturnType<typeof createApp>['app'];

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    const created = createApp(db);
    app = created.app;
  });

  afterEach(() => {
    db.close();
  });

  it('retrieves complete prompt detail for modal inspection', async () => {
    const colRes = await request(app).post('/api/collections').send({ name: 'Architecture' });
    const colId = colRes.body.id;

    const createRes = await request(app).post('/api/prompts').send({
      title: 'Domain-Driven Design Guidelines',
      prompt_text: 'Act as a software architect and review this domain model:\n\n```ts\ninterface AggregateRoot {}\n```',
      description: 'Comprehensive guidelines for DDD architecture',
      usage_description: 'Paste your entity models into the designated typescript block.',
      collection_id: colId,
      category_id: 'code',
      tags: ['ddd', 'typescript', 'architecture'],
    });

    const promptId = createRes.body.id;

    // Fetch individual prompt details
    const detailRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.id).toBe(promptId);
    expect(detailRes.body.title).toBe('Domain-Driven Design Guidelines');
    expect(detailRes.body.prompt_text).toBe('Act as a software architect and review this domain model:\n\n```ts\ninterface AggregateRoot {}\n```');
    expect(detailRes.body.description).toBe('Comprehensive guidelines for DDD architecture');
    expect(detailRes.body.usage_description).toBe('Paste your entity models into the designated typescript block.');
    expect(detailRes.body.collection_id).toBe(colId);
    expect(detailRes.body.collection_name).toBe('Architecture');
    expect(detailRes.body.category_id).toBe('code');
    expect(detailRes.body.category_name).toBe('Code');
    expect(detailRes.body.tags).toEqual(['ddd', 'typescript', 'architecture']);
    expect(detailRes.body.created_at).toBeDefined();
    expect(detailRes.body.updated_at).toBeDefined();
  });

  it('returns 404 when opening details for a soft-deleted prompt', async () => {
    const createRes = await request(app).post('/api/prompts').send({
      title: 'Prompt to be deleted',
      prompt_text: 'Some raw prompt content',
    });
    const promptId = createRes.body.id;

    // Soft-delete
    await request(app).delete(`/api/prompts/${promptId}`);

    // Details request should 404
    const detailRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(detailRes.status).toBe(404);
  });

  it('preserves unmodified raw prompt text across edit and detail flows', async () => {
    const rawMultilinePrompt = `Line 1: # Title\nLine 2: {{param}}\n\tIndented line\n\nTrailing space test `;

    const createRes = await request(app).post('/api/prompts').send({
      title: 'Exact Raw Format Test',
      prompt_text: rawMultilinePrompt,
    });
    const promptId = createRes.body.id;

    const detailRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(detailRes.body.prompt_text).toBe(rawMultilinePrompt);
  });
});
