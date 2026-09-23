import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../server/app';
import { initSchema } from '../server/db/connection';

describe('Collection Management API', () => {
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

  it('GET /api/collections returns empty collection list and 0 counts initially', async () => {
    const res = await request(app).get('/api/collections');
    expect(res.status).toBe(200);
    expect(res.body.collections).toEqual([]);
    expect(res.body.counts).toEqual({ all: 0, uncollected: 0 });
  });

  it('POST /api/collections creates a new collection and rejects empty names', async () => {
    // Empty name rejection
    const invalidRes = await request(app).post('/api/collections').send({ name: '   ' });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error).toBe('Collection name is required');

    // Valid creation
    const validRes = await request(app).post('/api/collections').send({ name: 'Work Prompts' });
    expect(validRes.status).toBe(201);
    expect(validRes.body.name).toBe('Work Prompts');
    expect(validRes.body.id).toBeDefined();
    expect(validRes.body.prompt_count).toBe(0);
  });

  it('PUT /api/collections/:id renames a collection', async () => {
    const created = await request(app).post('/api/collections').send({ name: 'Old Name' });
    const colId = created.body.id;

    const updateRes = await request(app).put(`/api/collections/${colId}`).send({ name: 'New Name' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe('New Name');

    const getRes = await request(app).get(`/api/collections/${colId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('New Name');
  });

  it('DELETE /api/collections/:id deletes collection and moves its prompts to Uncollected without deleting them', async () => {
    const now = new Date().toISOString();

    // 1. Create a collection
    const colRes = await request(app).post('/api/collections').send({ name: 'To Be Deleted' });
    const colId = colRes.body.id;

    // 2. Insert two prompts in this collection and one uncollected prompt
    db.prepare(`
      INSERT INTO prompts (title, prompt_text, collection_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Prompt 1', 'Content 1', colId, now, now);

    db.prepare(`
      INSERT INTO prompts (title, prompt_text, collection_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Prompt 2', 'Content 2', colId, now, now);

    db.prepare(`
      INSERT INTO prompts (title, prompt_text, collection_id, created_at, updated_at)
      VALUES (?, ?, NULL, ?, ?)
    `).run('Prompt 3', 'Content 3', now, now);

    // Verify initial counts
    const initialList = await request(app).get('/api/collections');
    expect(initialList.body.counts.all).toBe(3);
    expect(initialList.body.counts.uncollected).toBe(1);
    expect(initialList.body.collections[0].prompt_count).toBe(2);

    // 3. Delete the collection
    const deleteRes = await request(app).delete(`/api/collections/${colId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // 4. Verify collection is gone
    const afterList = await request(app).get('/api/collections');
    expect(afterList.body.collections).toHaveLength(0);

    // 5. Verify all 3 prompts still exist in database and now all are uncollected
    const allPrompts = db.prepare('SELECT id, title, collection_id FROM prompts WHERE deleted_at IS NULL').all() as {
      id: number;
      title: string;
      collection_id: number | null;
    }[];
    expect(allPrompts).toHaveLength(3);
    expect(allPrompts.every((p) => p.collection_id === null)).toBe(true);

    // Verify counts
    expect(afterList.body.counts.all).toBe(3);
    expect(afterList.body.counts.uncollected).toBe(3);
  });

  it('excludes soft-deleted prompts from collection counts', async () => {
    const now = new Date().toISOString();
    const colRes = await request(app).post('/api/collections').send({ name: 'Active Col' });
    const colId = colRes.body.id;

    // Active prompt
    db.prepare(`
      INSERT INTO prompts (title, prompt_text, collection_id, created_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, NULL)
    `).run('Active Prompt', 'Content', colId, now, now);

    // Soft-deleted prompt in same collection
    db.prepare(`
      INSERT INTO prompts (title, prompt_text, collection_id, created_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Deleted Prompt', 'Content', colId, now, now, now);

    const listRes = await request(app).get('/api/collections');
    expect(listRes.body.collections[0].prompt_count).toBe(1);
    expect(listRes.body.counts.all).toBe(1);
  });
});
