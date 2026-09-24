import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import { initSchema } from '../src/db/connection';

describe('Prompt CRUD & Soft-Deletion API', () => {
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

  it('creates prompt with required fields only', async () => {
    const res = await request(app).post('/api/prompts').send({
      title: 'Minimal Prompt',
      prompt_text: 'You are a helpful assistant.',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Minimal Prompt');
    expect(res.body.prompt_text).toBe('You are a helpful assistant.');
    expect(res.body.description).toBeNull();
    expect(res.body.usage_description).toBeNull();
    expect(res.body.collection_id).toBeNull();
    expect(res.body.category_id).toBeNull();
    expect(res.body.tags).toEqual([]);
  });

  it('rejects prompt creation missing title or prompt_text', async () => {
    const missingTitle = await request(app).post('/api/prompts').send({
      prompt_text: 'Text only',
    });
    expect(missingTitle.status).toBe(400);

    const missingText = await request(app).post('/api/prompts').send({
      title: 'Title only',
      prompt_text: '   ',
    });
    expect(missingText.status).toBe(400);
  });

  it('creates prompt with full metadata and tags', async () => {
    // Create collection
    const colRes = await request(app).post('/api/collections').send({ name: 'Engineering' });
    const colId = colRes.body.id;

    const res = await request(app).post('/api/prompts').send({
      title: 'Git Commit Generator',
      prompt_text: 'Generate conventional commit message from git diff:\n{{diff}}',
      description: 'Formats git diffs into conventional commit format',
      usage_description: 'Paste diff output from git diff --staged',
      collection_id: colId,
      category_id: 'code',
      tags: ['git', 'developer-tools', 'cli'],
    });

    expect(res.status).toBe(201);
    expect(res.body.collection_id).toBe(colId);
    expect(res.body.category_id).toBe('code');
    expect(res.body.tags).toEqual(['git', 'developer-tools', 'cli']);
  });

  it('allows duplicate prompts', async () => {
    const promptData = {
      title: 'Duplicate Test',
      prompt_text: 'Exact same text',
    };

    const res1 = await request(app).post('/api/prompts').send(promptData);
    const res2 = await request(app).post('/api/prompts').send(promptData);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res1.body.id).not.toBe(res2.body.id);
  });

  it('returns prompts ordered newest created first by default', async () => {
    await request(app).post('/api/prompts').send({ title: 'First', prompt_text: '1' });
    await request(app).post('/api/prompts').send({ title: 'Second', prompt_text: '2' });
    await request(app).post('/api/prompts').send({ title: 'Third', prompt_text: '3' });

    const res = await request(app).get('/api/prompts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].title).toBe('Third');
    expect(res.body[1].title).toBe('Second');
    expect(res.body[2].title).toBe('First');
  });

  it('updates prompt fields and syncs tags', async () => {
    const created = await request(app).post('/api/prompts').send({
      title: 'Original Title',
      prompt_text: 'Original Text',
      tags: ['old-tag'],
    });
    const promptId = created.body.id;

    const updateRes = await request(app).put(`/api/prompts/${promptId}`).send({
      title: 'Updated Title',
      prompt_text: 'Updated Text',
      description: 'Added description',
      tags: ['new-tag-1', 'new-tag-2'],
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Title');
    expect(updateRes.body.description).toBe('Added description');
    expect(updateRes.body.tags).toEqual(['new-tag-1', 'new-tag-2']);

    const getRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe('Updated Title');
    expect(getRes.body.tags).toEqual(['new-tag-1', 'new-tag-2']);
  });

  it('soft-deletes prompt and excludes it from all regular API queries', async () => {
    const p1 = await request(app).post('/api/prompts').send({ title: 'To Delete', prompt_text: 'Del' });
    const p2 = await request(app).post('/api/prompts').send({ title: 'Keep', prompt_text: 'Keep' });

    const deleteRes = await request(app).delete(`/api/prompts/${p1.body.id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Excluded from list
    const listRes = await request(app).get('/api/prompts');
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].id).toBe(p2.body.id);

    // Excluded from direct get (returns 404)
    const getRes = await request(app).get(`/api/prompts/${p1.body.id}`);
    expect(getRes.status).toBe(404);

    // Exists in DB with deleted_at timestamp (manual database recovery possible)
    const dbRow = db.prepare('SELECT deleted_at FROM prompts WHERE id = ?').get(p1.body.id) as { deleted_at: string };
    expect(dbRow.deleted_at).not.toBeNull();
  });

  it('lists categories and active tags', async () => {
    const catsRes = await request(app).get('/api/categories');
    expect(catsRes.status).toBe(200);
    expect(catsRes.body.map((c: { id: string }) => c.id)).toEqual(['code', 'image', 'text', 'video']);

    await request(app).post('/api/prompts').send({
      title: 'Tagged',
      prompt_text: 'Text',
      tags: ['react', 'frontend'],
    });

    const tagsRes = await request(app).get('/api/tags');
    expect(tagsRes.status).toBe(200);
    expect(tagsRes.body).toEqual(['frontend', 'react']);
  });

  it('retrieves full prompt details including category and collection names', async () => {
    const colRes = await request(app).post('/api/collections').send({ name: 'Productivity' });
    const colId = colRes.body.id;

    const created = await request(app).post('/api/prompts').send({
      title: 'Daily Standup Summary',
      prompt_text: 'Summarize today\'s accomplishments, blockers, and next steps.',
      description: 'Format daily updates for team syncs',
      usage_description: 'Run at the end of each working day',
      collection_id: colId,
      category_id: 'text',
      tags: ['agile', 'standup'],
    });

    const getRes = await request(app).get(`/api/prompts/${created.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.title).toBe('Daily Standup Summary');
    expect(getRes.body.prompt_text).toBe('Summarize today\'s accomplishments, blockers, and next steps.');
    expect(getRes.body.description).toBe('Format daily updates for team syncs');
    expect(getRes.body.usage_description).toBe('Run at the end of each working day');
    expect(getRes.body.collection_name).toBe('Productivity');
    expect(getRes.body.category_name).toBe('Text');
    expect(getRes.body.tags).toEqual(['agile', 'standup']);
  });
});
