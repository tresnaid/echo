import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

export function getDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data/echo.db');
  
  // Ensure parent directory exists
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return db;
}

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      prompt_text TEXT NOT NULL,
      description TEXT,
      usage_description TEXT,
      collection_id INTEGER REFERENCES collections(id) ON DELETE SET NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prompt_tags (
      prompt_id INTEGER NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (prompt_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_prompts_deleted_at ON prompts(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_prompts_collection_id ON prompts(collection_id);
    CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
    CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
  `);

  // Seed initial categories if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare(`
      INSERT INTO categories (id, name, description, created_at)
      VALUES (@id, @name, @description, @created_at)
    `);

    const now = new Date().toISOString();
    const categories = [
      { id: 'text', name: 'Text', description: 'General text generation and writing prompts', created_at: now },
      { id: 'code', name: 'Code', description: 'Software engineering, scripts, and debugging prompts', created_at: now },
      { id: 'image', name: 'Image', description: 'Image generation and visual prompt descriptions', created_at: now },
      { id: 'video', name: 'Video', description: 'Video generation and animation prompts', created_at: now },
    ];

    const seedMany = db.transaction((cats: typeof categories) => {
      for (const cat of cats) {
        insert.run(cat);
      }
    });

    seedMany(categories);
  }
}
