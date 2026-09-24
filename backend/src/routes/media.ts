import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import Database from 'better-sqlite3';
import { z } from 'zod';
import path from 'node:path';
import crypto from 'node:crypto';
import { processUploadedFile, getUploadsDir } from '../services/mediaService.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadsDir = getUploadsDir();
    const tempDir = path.join(uploadsDir, 'temp');
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-matroska',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

export const attachMediaSchema = z.object({
  media_type: z.enum(['image', 'video']),
  url: z.string().min(1, 'URL is required'),
  thumbnail_url: z.string().nullable().optional(),
  medium_url: z.string().nullable().optional(),
  file_path: z.string().nullable().optional(),
  file_name: z.string().nullable().optional(),
  file_size: z.number().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  aspect_ratio: z.number().nullable().optional(),
  caption: z.string().nullable().optional(),
});

export function createMediaRouter(_db: Database.Database): Router {
  const router = Router();

  // POST /api/media/upload - Upload file(s) and generate multi-size thumbnails
  router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
          return res.status(400).json({ error: 'No files provided' });
        }

        const results = await Promise.all(files.map((file) => processUploadedFile(file)));
        return res.status(201).json({
          media: results,
        });
      } catch (uploadError) {
        return next(uploadError);
      }
    });
  });

  return router;
}

export function createPromptMediaRouter(db: Database.Database): Router {
  const router = Router({ mergeParams: true });

  const getPrompt = db.prepare(`
    SELECT id, deleted_at FROM prompts WHERE id = ?
  `);

  const getMediaByPrompt = db.prepare(`
    SELECT id, prompt_id, media_type, url, thumbnail_url, medium_url,
           file_path, file_name, file_size, mime_type, width, height,
           aspect_ratio, caption, created_at
    FROM prompt_media
    WHERE prompt_id = ?
    ORDER BY id ASC
  `);

  const insertMedia = db.prepare(`
    INSERT INTO prompt_media (
      prompt_id, media_type, url, thumbnail_url, medium_url,
      file_path, file_name, file_size, mime_type, width, height,
      aspect_ratio, caption, created_at
    )
    VALUES (
      @prompt_id, @media_type, @url, @thumbnail_url, @medium_url,
      @file_path, @file_name, @file_size, @mime_type, @width, @height,
      @aspect_ratio, @caption, @created_at
    )
  `);

  const deleteMedia = db.prepare(`
    DELETE FROM prompt_media WHERE id = ? AND prompt_id = ?
  `);

  // GET /api/prompts/:id/media - List media items for a prompt
  router.get('/', (req: Request<{ id: string }>, res: Response) => {
    const promptId = parseInt(req.params.id, 10);
    if (isNaN(promptId)) {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }

    const prompt = getPrompt.get(promptId) as { id: number; deleted_at: string | null } | undefined;
    if (!prompt || prompt.deleted_at !== null) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const mediaList = getMediaByPrompt.all(promptId);
    return res.json(mediaList);
  });

  // POST /api/prompts/:id/media - Attach a media item to a prompt
  router.post('/', (req: Request<{ id: string }>, res: Response) => {
    const promptId = parseInt(req.params.id, 10);
    if (isNaN(promptId)) {
      return res.status(400).json({ error: 'Invalid prompt ID' });
    }

    const prompt = getPrompt.get(promptId) as { id: number; deleted_at: string | null } | undefined;
    if (!prompt || prompt.deleted_at !== null) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const parsed = attachMediaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const now = new Date().toISOString();
    const result = insertMedia.run({
      prompt_id: promptId,
      media_type: parsed.data.media_type,
      url: parsed.data.url,
      thumbnail_url: parsed.data.thumbnail_url || null,
      medium_url: parsed.data.medium_url || null,
      file_path: parsed.data.file_path || null,
      file_name: parsed.data.file_name || null,
      file_size: parsed.data.file_size || null,
      mime_type: parsed.data.mime_type || null,
      width: parsed.data.width || null,
      height: parsed.data.height || null,
      aspect_ratio: parsed.data.aspect_ratio || null,
      caption: parsed.data.caption || null,
      created_at: now,
    });

    const newMedia = db.prepare('SELECT * FROM prompt_media WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(newMedia);
  });

  // DELETE /api/prompts/:id/media/:mediaId - Detach media from prompt
  router.delete('/:mediaId', (req: Request<{ id: string; mediaId: string }>, res: Response) => {
    const promptId = parseInt(req.params.id, 10);
    const mediaId = parseInt(req.params.mediaId, 10);
    if (isNaN(promptId) || isNaN(mediaId)) {
      return res.status(400).json({ error: 'Invalid prompt or media ID' });
    }

    const result = deleteMedia.run(mediaId, promptId);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Media attachment not found' });
    }

    return res.status(204).send();
  });

  return router;
}
