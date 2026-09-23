import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { z } from 'zod';

const promptSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  prompt_text: z.string().refine((val) => val.trim().length > 0, 'Prompt text is required'),
  description: z.string().trim().max(1000).optional().nullable(),
  usage_description: z.string().trim().max(2000).optional().nullable(),
  collection_id: z.number().int().positive().optional().nullable(),
  category_id: z.string().trim().max(50).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
});

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return parseInt(val || '', 10);
}

export function createPromptsRouter(db: Database.Database): Router {
  const router = Router();

  // Helper to sync tags for a prompt
  function syncPromptTags(promptId: number, tags: string[] = []) {
    // 1. Delete existing prompt_tags links
    db.prepare('DELETE FROM prompt_tags WHERE prompt_id = ?').run(promptId);

    if (tags.length === 0) return;

    const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name, created_at) VALUES (?, ?)');
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkPromptTag = db.prepare('INSERT OR IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (?, ?)');

    const now = new Date().toISOString();
    for (const rawTag of tags) {
      const tag = rawTag.trim();
      if (!tag) continue;
      insertTag.run(tag, now);
      const tagRow = getTag.get(tag) as { id: number };
      if (tagRow) {
        linkPromptTag.run(promptId, tagRow.id);
      }
    }
  }

  // GET /api/prompts - List prompts (newest first, soft-deleted excluded)
  router.get('/', (req: Request, res: Response) => {
    try {
      const { collection_id, category_id, tag, search } = req.query;

      let query = `
        SELECT 
          p.id,
          p.title,
          p.prompt_text,
          p.description,
          p.usage_description,
          p.collection_id,
          p.category_id,
          p.created_at,
          p.updated_at,
          c.name as collection_name,
          cat.name as category_name,
          (
            SELECT GROUP_CONCAT(t.name, '|||')
            FROM prompt_tags pt
            JOIN tags t ON t.id = pt.tag_id
            WHERE pt.prompt_id = p.id
          ) as tags_concat
        FROM prompts p
        LEFT JOIN collections c ON c.id = p.collection_id
        LEFT JOIN categories cat ON cat.id = p.category_id
        WHERE p.deleted_at IS NULL
      `;

      const params: (string | number)[] = [];

      // Collection filter
      if (collection_id !== undefined) {
        if (collection_id === 'uncollected' || collection_id === 'null' || collection_id === '') {
          query += ' AND p.collection_id IS NULL';
        } else {
          const colId = parseInt(collection_id as string, 10);
          if (!isNaN(colId)) {
            query += ' AND p.collection_id = ?';
            params.push(colId);
          }
        }
      }

      // Category filter
      if (category_id && typeof category_id === 'string' && category_id.trim() !== '') {
        query += ' AND p.category_id = ?';
        params.push(category_id.trim());
      }

      // Tag filter
      if (tag && typeof tag === 'string' && tag.trim() !== '') {
        query += `
          AND p.id IN (
            SELECT pt.prompt_id
            FROM prompt_tags pt
            JOIN tags t ON t.id = pt.tag_id
            WHERE t.name = ? COLLATE NOCASE
          )
        `;
        params.push(tag.trim());
      }

      // Search filter (matches title, description, and tags)
      if (search && typeof search === 'string' && search.trim() !== '') {
        const term = `%${search.trim()}%`;
        query += `
          AND (
            p.title LIKE ? COLLATE NOCASE
            OR p.description LIKE ? COLLATE NOCASE
            OR p.id IN (
              SELECT pt.prompt_id
              FROM prompt_tags pt
              JOIN tags t ON t.id = pt.tag_id
              WHERE t.name LIKE ? COLLATE NOCASE
            )
          )
        `;
        params.push(term, term, term);
      }

      // Default ordering: newest created first
      query += ' ORDER BY p.created_at DESC, p.id DESC';

      const rows = db.prepare(query).all(...params) as {
        id: number;
        title: string;
        prompt_text: string;
        description: string | null;
        usage_description: string | null;
        collection_id: number | null;
        category_id: string | null;
        created_at: string;
        updated_at: string;
        collection_name: string | null;
        category_name: string | null;
        tags_concat: string | null;
      }[];

      const prompts = rows.map((r) => ({
        id: r.id,
        title: r.title,
        prompt_text: r.prompt_text,
        description: r.description,
        usage_description: r.usage_description,
        collection_id: r.collection_id,
        category_id: r.category_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        collection_name: r.collection_name,
        category_name: r.category_name,
        tags: r.tags_concat ? r.tags_concat.split('|||').filter(Boolean) : [],
      }));

      res.json(prompts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prompts';
      res.status(500).json({ error: message });
    }
  });

  // GET /api/prompts/:id - Get single prompt details
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid prompt ID' });
        return;
      }

      const row = db.prepare(`
        SELECT 
          p.id,
          p.title,
          p.prompt_text,
          p.description,
          p.usage_description,
          p.collection_id,
          p.category_id,
          p.created_at,
          p.updated_at,
          c.name as collection_name,
          cat.name as category_name,
          (
            SELECT GROUP_CONCAT(t.name, '|||')
            FROM prompt_tags pt
            JOIN tags t ON t.id = pt.tag_id
            WHERE pt.prompt_id = p.id
          ) as tags_concat
        FROM prompts p
        LEFT JOIN collections c ON c.id = p.collection_id
        LEFT JOIN categories cat ON cat.id = p.category_id
        WHERE p.id = ? AND p.deleted_at IS NULL
      `).get(id) as {
        id: number;
        title: string;
        prompt_text: string;
        description: string | null;
        usage_description: string | null;
        collection_id: number | null;
        category_id: string | null;
        created_at: string;
        updated_at: string;
        collection_name: string | null;
        category_name: string | null;
        tags_concat: string | null;
      } | undefined;

      if (!row) {
        res.status(404).json({ error: 'Prompt not found' });
        return;
      }

      const prompt = {
        id: row.id,
        title: row.title,
        prompt_text: row.prompt_text,
        description: row.description,
        usage_description: row.usage_description,
        collection_id: row.collection_id,
        category_id: row.category_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        collection_name: row.collection_name,
        category_name: row.category_name,
        tags: row.tags_concat ? row.tags_concat.split('|||').filter(Boolean) : [],
      };

      res.json(prompt);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch prompt';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/prompts - Create prompt
  router.post('/', (req: Request, res: Response) => {
    try {
      const parseResult = promptSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const data = parseResult.data;
      const now = new Date().toISOString();

      const insertTx = db.transaction(() => {
        const stmt = db.prepare(`
          INSERT INTO prompts (
            title, prompt_text, description, usage_description,
            collection_id, category_id, created_at, updated_at, deleted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
        `);

        const info = stmt.run(
          data.title,
          data.prompt_text,
          data.description || null,
          data.usage_description || null,
          data.collection_id || null,
          data.category_id || null,
          now,
          now
        );

        const promptId = Number(info.lastInsertRowid);
        if (data.tags) {
          syncPromptTags(promptId, data.tags);
        }

        return promptId;
      });

      const promptId = insertTx();

      // Return created prompt
      const created = db.prepare(`
        SELECT 
          p.id, p.title, p.prompt_text, p.description, p.usage_description,
          p.collection_id, p.category_id, p.created_at, p.updated_at,
          c.name as collection_name, cat.name as category_name
        FROM prompts p
        LEFT JOIN collections c ON c.id = p.collection_id
        LEFT JOIN categories cat ON cat.id = p.category_id
        WHERE p.id = ?
      `).get(promptId) as Record<string, unknown>;

      res.status(201).json({
        ...created,
        tags: data.tags || [],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create prompt';
      res.status(500).json({ error: message });
    }
  });

  // PUT /api/prompts/:id - Update prompt
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid prompt ID' });
        return;
      }

      const parseResult = promptSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const existing = db.prepare('SELECT id FROM prompts WHERE id = ? AND deleted_at IS NULL').get(id);
      if (!existing) {
        res.status(404).json({ error: 'Prompt not found' });
        return;
      }

      const data = parseResult.data;
      const now = new Date().toISOString();

      const updateTx = db.transaction(() => {
        db.prepare(`
          UPDATE prompts
          SET title = ?, prompt_text = ?, description = ?, usage_description = ?,
              collection_id = ?, category_id = ?, updated_at = ?
          WHERE id = ? AND deleted_at IS NULL
        `).run(
          data.title,
          data.prompt_text,
          data.description || null,
          data.usage_description || null,
          data.collection_id || null,
          data.category_id || null,
          now,
          id
        );

        if (data.tags !== undefined) {
          syncPromptTags(id, data.tags);
        }
      });

      updateTx();

      const updated = db.prepare(`
        SELECT 
          p.id, p.title, p.prompt_text, p.description, p.usage_description,
          p.collection_id, p.category_id, p.created_at, p.updated_at,
          c.name as collection_name, cat.name as category_name
        FROM prompts p
        LEFT JOIN collections c ON c.id = p.collection_id
        LEFT JOIN categories cat ON cat.id = p.category_id
        WHERE p.id = ?
      `).get(id) as Record<string, unknown>;

      res.json({
        ...updated,
        tags: data.tags || [],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update prompt';
      res.status(500).json({ error: message });
    }
  });

  // DELETE /api/prompts/:id - Soft-delete prompt
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid prompt ID' });
        return;
      }

      const existing = db.prepare('SELECT id, title FROM prompts WHERE id = ? AND deleted_at IS NULL').get(id) as { id: number; title: string } | undefined;
      if (!existing) {
        res.status(404).json({ error: 'Prompt not found' });
        return;
      }

      const now = new Date().toISOString();
      db.prepare(`
        UPDATE prompts
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
      `).run(now, now, id);

      res.json({
        success: true,
        message: `Prompt "${existing.title}" deleted.`,
        deleted_id: id,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete prompt';
      res.status(500).json({ error: message });
    }
  });

  return router;
}

// Router for Categories
export function createCategoriesRouter(db: Database.Database): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    try {
      const categories = db.prepare('SELECT id, name, description, created_at FROM categories ORDER BY id ASC').all();
      res.json(categories);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      res.status(500).json({ error: message });
    }
  });

  return router;
}

// Router for Tags
export function createTagsRouter(db: Database.Database): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    try {
      // Return distinct tags currently used on active prompts
      const tags = db.prepare(`
        SELECT DISTINCT t.name
        FROM tags t
        JOIN prompt_tags pt ON pt.tag_id = t.id
        JOIN prompts p ON p.id = pt.prompt_id
        WHERE p.deleted_at IS NULL
        ORDER BY t.name COLLATE NOCASE ASC
      `).all() as { name: string }[];

      res.json(tags.map((t) => t.name));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tags';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
