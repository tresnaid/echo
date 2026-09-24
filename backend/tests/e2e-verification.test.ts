import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import { initSchema } from '../src/db/connection';

describe('Comprehensive MVP Verification Suite (PROJECT.md Checklist)', () => {
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

  // 1. Create and persist a prompt
  it('1. Verifies prompt creation and database persistence', async () => {
    const res = await request(app).post('/api/prompts').send({
      title: 'Prompt Engineering Blueprint',
      prompt_text: 'Act as a Senior AI Architect.',
      description: 'System prompt template',
      usage_description: 'Insert target model parameters',
      category_id: 'text',
      tags: ['ai', 'system-prompt'],
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Prompt Engineering Blueprint');

    // Verify persisted directly in SQLite DB
    const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(res.body.id) as { title: string; prompt_text: string };
    expect(row).toBeDefined();
    expect(row.title).toBe('Prompt Engineering Blueprint');
    expect(row.prompt_text).toBe('Act as a Senior AI Architect.');
  });

  // 2. New prompts appear newest-first
  it('2. Verifies default prompt ordering is newest created first', async () => {
    await request(app).post('/api/prompts').send({ title: 'Oldest Prompt', prompt_text: '1' });
    await request(app).post('/api/prompts').send({ title: 'Middle Prompt', prompt_text: '2' });
    await request(app).post('/api/prompts').send({ title: 'Newest Prompt', prompt_text: '3' });

    const listRes = await request(app).get('/api/prompts');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(3);
    expect(listRes.body[0].title).toBe('Newest Prompt');
    expect(listRes.body[1].title).toBe('Middle Prompt');
    expect(listRes.body[2].title).toBe('Oldest Prompt');
  });

  // 3. Search title, description, and tags (prompt text and usage description excluded)
  it('3. Verifies search matches title, description, and tags, but excludes prompt text and usage description', async () => {
    await request(app).post('/api/prompts').send({
      title: 'Kubernetes Cluster Setup',
      prompt_text: 'internal_secret_text_123',
      description: 'DevOps cloud cluster initialization',
      usage_description: 'internal_secret_usage_456',
      tags: ['devops', 'infrastructure'],
    });

    await request(app).post('/api/prompts').send({
      title: 'Python Performance Profiler',
      prompt_text: 'import cProfile',
      description: 'Asyncio event loop profiling',
      tags: ['python', 'asyncio'],
    });

    // Search by title match
    const titleRes = await request(app).get('/api/prompts?search=Kubernetes');
    expect(titleRes.body).toHaveLength(1);
    expect(titleRes.body[0].title).toBe('Kubernetes Cluster Setup');

    // Search by description match
    const descRes = await request(app).get('/api/prompts?search=cloud');
    expect(descRes.body).toHaveLength(1);
    expect(descRes.body[0].title).toBe('Kubernetes Cluster Setup');

    // Search by tag match
    const tagRes = await request(app).get('/api/prompts?search=asyncio');
    expect(tagRes.body).toHaveLength(1);
    expect(tagRes.body[0].title).toBe('Python Performance Profiler');

    // Search must NOT match prompt_text per spec
    const promptTextSearch = await request(app).get('/api/prompts?search=internal_secret_text_123');
    expect(promptTextSearch.body).toHaveLength(0);

    // Search must NOT match usage_description per spec
    const usageSearch = await request(app).get('/api/prompts?search=internal_secret_usage_456');
    expect(usageSearch.body).toHaveLength(0);
  });

  // 4. Filter by collection, category, and tags
  it('4. Verifies filtering by collection, category, and tags independently and combined', async () => {
    const colA = await request(app).post('/api/collections').send({ name: 'Work' });
    const colB = await request(app).post('/api/collections').send({ name: 'Personal' });

    await request(app).post('/api/prompts').send({
      title: 'Code Reviewer',
      prompt_text: 'Review this PR',
      collection_id: colA.body.id,
      category_id: 'code',
      tags: ['review', 'github'],
    });

    await request(app).post('/api/prompts').send({
      title: 'Image Generator',
      prompt_text: 'A photorealistic sunset',
      collection_id: colB.body.id,
      category_id: 'image',
      tags: ['art'],
    });

    // Filter by collection
    const colRes = await request(app).get(`/api/prompts?collection_id=${colA.body.id}`);
    expect(colRes.body).toHaveLength(1);
    expect(colRes.body[0].title).toBe('Code Reviewer');

    // Filter by category
    const catRes = await request(app).get('/api/prompts?category_id=image');
    expect(catRes.body).toHaveLength(1);
    expect(catRes.body[0].title).toBe('Image Generator');

    // Filter by tag
    const tagRes = await request(app).get('/api/prompts?tag=review');
    expect(tagRes.body).toHaveLength(1);
    expect(tagRes.body[0].title).toBe('Code Reviewer');

    // Combined filter matching nothing
    const noMatch = await request(app).get(`/api/prompts?collection_id=${colA.body.id}&category_id=image`);
    expect(noMatch.body).toHaveLength(0);
  });

  // 5. Open and close prompt details without losing browsing context
  it('5. Verifies individual prompt detail retrieval for modal inspection', async () => {
    const created = await request(app).post('/api/prompts').send({
      title: 'Modal Inspection Prompt',
      prompt_text: 'Exact prompt text for modal',
      description: 'Modal description test',
      usage_description: 'Modal usage instructions test',
      category_id: 'code',
      tags: ['modal-test'],
    });

    const detailRes = await request(app).get(`/api/prompts/${created.body.id}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.title).toBe('Modal Inspection Prompt');
    expect(detailRes.body.description).toBe('Modal description test');
    expect(detailRes.body.usage_description).toBe('Modal usage instructions test');
    expect(detailRes.body.prompt_text).toBe('Exact prompt text for modal');
    expect(detailRes.body.category_name).toBe('Code');
  });

  // 6. Copy exact raw prompt text
  it('6. Verifies exact raw prompt text fidelity without modification', async () => {
    const rawContent = "Line 1: Special chars !@#$%^&*() \n\nLine 3: \tTab indented \n\n  Spaces preserved";

    const created = await request(app).post('/api/prompts').send({
      title: 'Raw Text Fidelity Prompt',
      prompt_text: rawContent,
    });

    const detail = await request(app).get(`/api/prompts/${created.body.id}`);
    expect(detail.body.prompt_text).toBe(rawContent);
  });

  // 7. Edit and persist changes
  it('7. Verifies editing prompts and persisting changes across all fields', async () => {
    const col = await request(app).post('/api/collections').send({ name: 'Initial Collection' });
    const created = await request(app).post('/api/prompts').send({
      title: 'Original Title',
      prompt_text: 'Original Text',
      collection_id: col.body.id,
      category_id: 'text',
      tags: ['v1'],
    });

    const updateRes = await request(app).put(`/api/prompts/${created.body.id}`).send({
      title: 'Updated Title',
      prompt_text: 'Updated Text Content',
      description: 'Now has description',
      usage_description: 'Now has usage',
      category_id: 'code',
      tags: ['v2', 'edited'],
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe('Updated Title');
    expect(updateRes.body.prompt_text).toBe('Updated Text Content');
    expect(updateRes.body.category_id).toBe('code');
    expect(updateRes.body.tags).toEqual(['v2', 'edited']);

    // Check in database
    const dbRow = db.prepare('SELECT title, prompt_text, category_id FROM prompts WHERE id = ?').get(created.body.id) as { title: string; prompt_text: string; category_id: string };
    expect(dbRow.title).toBe('Updated Title');
    expect(dbRow.prompt_text).toBe('Updated Text Content');
    expect(dbRow.category_id).toBe('code');
  });

  // 8. Delete and hide soft-deleted prompts
  it('8. Verifies soft-deletion: excluded from lists and queries but retained in DB', async () => {
    const created = await request(app).post('/api/prompts').send({
      title: 'Soft Delete Target',
      prompt_text: 'To be soft deleted',
    });
    const promptId = created.body.id;

    // Delete
    const deleteRes = await request(app).delete(`/api/prompts/${promptId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // List excludes it
    const listRes = await request(app).get('/api/prompts');
    expect(listRes.body.find((p: { id: number }) => p.id === promptId)).toBeUndefined();

    // Get by id returns 404
    const getRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(getRes.status).toBe(404);

    // Retained in SQLite DB with deleted_at timestamp
    const dbRow = db.prepare('SELECT deleted_at FROM prompts WHERE id = ?').get(promptId) as { deleted_at: string };
    expect(dbRow.deleted_at).not.toBeNull();
  });

  // 9. Create, rename, and delete collections
  it('9. Verifies collection lifecycle: create, rename, and delete', async () => {
    // Create
    const createRes = await request(app).post('/api/collections').send({ name: 'Original Name' });
    expect(createRes.status).toBe(201);
    const colId = createRes.body.id;

    // Rename
    const renameRes = await request(app).put(`/api/collections/${colId}`).send({ name: 'Renamed Name' });
    expect(renameRes.status).toBe(200);
    expect(renameRes.body.name).toBe('Renamed Name');

    // Delete
    const deleteRes = await request(app).delete(`/api/collections/${colId}`);
    expect(deleteRes.status).toBe(200);

    const listRes = await request(app).get('/api/collections');
    expect(listRes.body.collections.find((c: { id: number }) => c.id === colId)).toBeUndefined();
  });

  // 10. Deleting a collection moves its prompts to Uncollected
  it('10. Verifies deleting a collection moves its prompts to Uncollected without deleting them', async () => {
    const colRes = await request(app).post('/api/collections').send({ name: 'Project Alpha' });
    const colId = colRes.body.id;

    const p1 = await request(app).post('/api/prompts').send({
      title: 'Alpha Prompt 1',
      prompt_text: 'Text 1',
      collection_id: colId,
    });
    const p2 = await request(app).post('/api/prompts').send({
      title: 'Alpha Prompt 2',
      prompt_text: 'Text 2',
      collection_id: colId,
    });

    // Delete collection
    await request(app).delete(`/api/collections/${colId}`);

    // Prompts must still exist
    const p1Check = await request(app).get(`/api/prompts/${p1.body.id}`);
    expect(p1Check.status).toBe(200);
    expect(p1Check.body.collection_id).toBeNull();
    expect(p1Check.body.collection_name).toBeNull();

    const p2Check = await request(app).get(`/api/prompts/${p2.body.id}`);
    expect(p2Check.status).toBe(200);
    expect(p2Check.body.collection_id).toBeNull();

    // Query uncollected prompts
    const uncollectedRes = await request(app).get('/api/prompts?collection_id=uncollected');
    expect(uncollectedRes.body).toHaveLength(2);
    expect(uncollectedRes.body.map((p: { title: string }) => p.title)).toContain('Alpha Prompt 1');
    expect(uncollectedRes.body.map((p: { title: string }) => p.title)).toContain('Alpha Prompt 2');

    // Collection counts check
    const countsRes = await request(app).get('/api/collections');
    expect(countsRes.body.counts.all).toBe(2);
    expect(countsRes.body.counts.uncollected).toBe(2);
  });
});
