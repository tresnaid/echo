import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../server/app';
import { initSchema } from '../server/db/connection';

describe('Echo Backend & Storage Foundation', () => {
  let db: Database.Database;
  let app: ReturnType<typeof createApp>['app'];

  beforeEach(() => {
    // In-memory SQLite database for isolated testing
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    const created = createApp(db);
    app = created.app;
  });

  afterEach(() => {
    db.close();
  });

  it('initializes schema tables properly', () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('collections');
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('prompts');
    expect(tableNames).toContain('tags');
    expect(tableNames).toContain('prompt_tags');
  });

  it('seeds default categories (Text, Code, Image, Video)', () => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all() as {
      id: string;
      name: string;
    }[];

    expect(categories).toHaveLength(4);
    const ids = categories.map((c) => c.id);
    expect(ids).toEqual(['code', 'image', 'text', 'video']);
  });

  it('supports inserting and retrieving collections and prompts with soft-delete field', () => {
    const now = new Date().toISOString();
    
    // Insert collection
    const colStmt = db.prepare('INSERT INTO collections (name, created_at, updated_at) VALUES (?, ?, ?)');
    const colInfo = colStmt.run('My Prompts', now, now);
    const colId = colInfo.lastInsertRowid;

    // Insert prompt
    const promptStmt = db.prepare(`
      INSERT INTO prompts (title, prompt_text, description, collection_id, category_id, created_at, updated_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `);
    const promptInfo = promptStmt.run('Code Reviewer', 'Review this code: ...', 'A helper prompt', colId, 'code', now, now);
    const promptId = promptInfo.lastInsertRowid;

    const fetched = db.prepare('SELECT * FROM prompts WHERE id = ?').get(promptId) as {
      title: string;
      prompt_text: string;
      collection_id: number;
      category_id: string;
      deleted_at: string | null;
    };

    expect(fetched.title).toBe('Code Reviewer');
    expect(fetched.prompt_text).toBe('Review this code: ...');
    expect(fetched.collection_id).toBe(Number(colId));
    expect(fetched.category_id).toBe('code');
    expect(fetched.deleted_at).toBeNull();
  });

  it('GET /api/health returns healthy status and connected database', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
  });
});
