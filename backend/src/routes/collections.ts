import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { z } from 'zod';

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Collection name is required').max(100, 'Collection name is too long'),
});

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, 'Collection name is required').max(100, 'Collection name is too long'),
});

function parseId(param: string | string[] | undefined): number {
  const val = Array.isArray(param) ? param[0] : param;
  return parseInt(val || '', 10);
}

export function createCollectionsRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/collections - List all collections with active prompt counts
  router.get('/', (_req: Request, res: Response) => {
    try {
      const collections = db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.created_at,
          c.updated_at,
          COUNT(p.id) as prompt_count
        FROM collections c
        LEFT JOIN prompts p ON p.collection_id = c.id AND p.deleted_at IS NULL
        GROUP BY c.id
        ORDER BY c.name COLLATE NOCASE ASC
      `).all() as { id: number; name: string; created_at: string; updated_at: string; prompt_count: number }[];

      // Global counts for "All Prompts" and "Uncollected"
      const totalCountRow = db.prepare(`
        SELECT COUNT(*) as total FROM prompts WHERE deleted_at IS NULL
      `).get() as { total: number };

      const uncollectedCountRow = db.prepare(`
        SELECT COUNT(*) as uncollected FROM prompts WHERE collection_id IS NULL AND deleted_at IS NULL
      `).get() as { uncollected: number };

      res.json({
        collections,
        counts: {
          all: totalCountRow.total,
          uncollected: uncollectedCountRow.uncollected,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch collections';
      res.status(500).json({ error: message });
    }
  });

  // GET /api/collections/:id - Get a single collection
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid collection ID' });
        return;
      }

      const collection = db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.created_at,
          c.updated_at,
          COUNT(p.id) as prompt_count
        FROM collections c
        LEFT JOIN prompts p ON p.collection_id = c.id AND p.deleted_at IS NULL
        WHERE c.id = ?
        GROUP BY c.id
      `).get(id);

      if (!collection) {
        res.status(404).json({ error: 'Collection not found' });
        return;
      }

      res.json(collection);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch collection';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/collections - Create new collection
  router.post('/', (req: Request, res: Response) => {
    try {
      const parseResult = createCollectionSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { name } = parseResult.data;
      const now = new Date().toISOString();

      const insert = db.prepare(`
        INSERT INTO collections (name, created_at, updated_at)
        VALUES (?, ?, ?)
      `);
      const info = insert.run(name, now, now);

      const created = db.prepare(`
        SELECT id, name, created_at, updated_at, 0 as prompt_count
        FROM collections WHERE id = ?
      `).get(info.lastInsertRowid);

      res.status(201).json(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create collection';
      res.status(500).json({ error: message });
    }
  });

  // PUT /api/collections/:id - Rename collection
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid collection ID' });
        return;
      }

      const parseResult = updateCollectionSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { name } = parseResult.data;
      const now = new Date().toISOString();

      const existing = db.prepare('SELECT id FROM collections WHERE id = ?').get(id);
      if (!existing) {
        res.status(404).json({ error: 'Collection not found' });
        return;
      }

      db.prepare(`
        UPDATE collections
        SET name = ?, updated_at = ?
        WHERE id = ?
      `).run(name, now, id);

      const updated = db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.created_at,
          c.updated_at,
          COUNT(p.id) as prompt_count
        FROM collections c
        LEFT JOIN prompts p ON p.collection_id = c.id AND p.deleted_at IS NULL
        WHERE c.id = ?
        GROUP BY c.id
      `).get(id);

      res.json(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update collection';
      res.status(500).json({ error: message });
    }
  });

  // DELETE /api/collections/:id - Delete collection and uncollect all prompts (non-destructive)
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid collection ID' });
        return;
      }

      const existing = db.prepare('SELECT id, name FROM collections WHERE id = ?').get(id) as { id: number; name: string } | undefined;
      if (!existing) {
        res.status(404).json({ error: 'Collection not found' });
        return;
      }

      // Execute uncollect cascade in a single transaction
      const deleteTx = db.transaction((colId: number) => {
        // Uncollect prompts (set collection_id to null)
        db.prepare(`
          UPDATE prompts
          SET collection_id = NULL, updated_at = ?
          WHERE collection_id = ?
        `).run(new Date().toISOString(), colId);

        // Delete the collection record
        db.prepare('DELETE FROM collections WHERE id = ?').run(colId);
      });

      deleteTx(id);

      res.json({
        success: true,
        message: `Collection "${existing.name}" deleted. Its prompts are now uncollected.`,
        deleted_id: id,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete collection';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
