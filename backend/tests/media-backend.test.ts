import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { initSchema } from '../src/db/connection.js';
import sharp from 'sharp';

describe('Media Storage, Multi-Size Thumbnail Generation & API', () => {
  let db: Database.Database;
  let app: any;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
    const serverInstance = createApp(db);
    app = serverInstance.app;
  });

  it('POST /api/media/upload uploads an image and generates multi-size WebP thumbnails with dimensions', async () => {
    // Generate a test 800x600 PNG in memory using sharp
    const testImageBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 59, g: 130, b: 246, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const res = await request(app)
      .post('/api/media/upload')
      .attach('files', testImageBuffer, 'test_scenery.png');

    expect(res.status).toBe(201);
    expect(res.body.media).toHaveLength(1);

    const media = res.body.media[0];
    expect(media.media_type).toBe('image');
    expect(media.file_name).toBe('test_scenery.png');
    expect(media.width).toBe(800);
    expect(media.height).toBe(600);
    expect(media.aspect_ratio).toBeCloseTo(1.3333, 2);
    expect(media.url).toMatch(/^\/uploads\/originals\/.*_original\.png$/);
    expect(media.medium_url).toMatch(/^\/uploads\/medium\/.*_medium\.webp$/);
    expect(media.thumbnail_url).toMatch(/^\/uploads\/thumbnails\/.*_thumb\.webp$/);
  });

  it('POST /api/media/upload handles video files', async () => {
    const fakeVideoBuffer = Buffer.from('FAKE_VIDEO_STREAM_BYTES');

    const res = await request(app)
      .post('/api/media/upload')
      .attach('files', fakeVideoBuffer, { filename: 'demo_clip.mp4', contentType: 'video/mp4' });

    expect(res.status).toBe(201);
    expect(res.body.media).toHaveLength(1);

    const media = res.body.media[0];
    expect(media.media_type).toBe('video');
    expect(media.file_name).toBe('demo_clip.mp4');
    expect(media.url).toMatch(/^\/uploads\/videos\/.*demo_clip\.mp4$/);
  });

  it('POST /api/media/upload rejects disallowed file types', async () => {
    const textBuffer = Buffer.from('console.log("hello")');

    const res = await request(app)
      .post('/api/media/upload')
      .attach('files', textBuffer, { filename: 'malicious.exe', contentType: 'application/x-msdownload' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('is not allowed');
  });

  it('POST /api/prompts creates a prompt with attached media', async () => {
    const promptData = {
      title: 'Cinematic Concept Art',
      prompt_text: 'Futuristic floating city in clouds --ar 16:9',
      category_id: 'image',
      tags: ['concept-art', 'clouds'],
      media: [
        {
          media_type: 'image',
          url: '/uploads/originals/floating_city.png',
          thumbnail_url: '/uploads/thumbnails/floating_city_thumb.webp',
          medium_url: '/uploads/medium/floating_city_medium.webp',
          file_name: 'floating_city.png',
          width: 1920,
          height: 1080,
          aspect_ratio: 1.7778,
          caption: 'Reference shot 1',
        },
      ],
    };

    const res = await request(app).post('/api/prompts').send(promptData);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Cinematic Concept Art');
    expect(res.body.media).toHaveLength(1);
    expect(res.body.media[0].thumbnail_url).toBe('/uploads/thumbnails/floating_city_thumb.webp');
    expect(res.body.media[0].width).toBe(1920);

    const promptId = res.body.id;

    // Verify GET /api/prompts includes media
    const listRes = await request(app).get('/api/prompts');
    expect(listRes.status).toBe(200);
    const fetched = listRes.body.find((p: any) => p.id === promptId);
    expect(fetched.media).toHaveLength(1);
    expect(fetched.media[0].caption).toBe('Reference shot 1');

    // Verify GET /api/prompts/:id includes media
    const detailRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.media).toHaveLength(1);
  });

  it('POST /api/prompts/:id/media and DELETE /api/prompts/:id/media/:mediaId manage media attachments', async () => {
    // Create base prompt
    const promptRes = await request(app).post('/api/prompts').send({
      title: 'Video Animation Test',
      prompt_text: 'Smooth 3D character spin',
      category_id: 'video',
    });
    const promptId = promptRes.body.id;

    // Attach media via /api/prompts/:id/media
    const attachRes = await request(app).post(`/api/prompts/${promptId}/media`).send({
      media_type: 'video',
      url: 'https://example.com/videos/spin.mp4',
      caption: 'Example character render',
    });
    expect(attachRes.status).toBe(201);
    expect(attachRes.body.url).toBe('https://example.com/videos/spin.mp4');
    const mediaId = attachRes.body.id;

    // List media
    const listMediaRes = await request(app).get(`/api/prompts/${promptId}/media`);
    expect(listMediaRes.status).toBe(200);
    expect(listMediaRes.body).toHaveLength(1);
    expect(listMediaRes.body[0].id).toBe(mediaId);

    // Delete media
    const delRes = await request(app).delete(`/api/prompts/${promptId}/media/${mediaId}`);
    expect(delRes.status).toBe(204);

    // Verify list is empty
    const listAfterDel = await request(app).get(`/api/prompts/${promptId}/media`);
    expect(listAfterDel.body).toHaveLength(0);
  });

  it('cascades media deletion when prompt is permanently deleted and excludes media on soft-deleted prompts', async () => {
    // Create prompt with media
    const res = await request(app).post('/api/prompts').send({
      title: 'Temporary Media Prompt',
      prompt_text: 'To be soft deleted',
      media: [
        {
          media_type: 'image',
          url: 'https://example.com/image.jpg',
        },
      ],
    });
    const promptId = res.body.id;

    // Soft delete prompt
    await request(app).delete(`/api/prompts/${promptId}`);

    // GET /api/prompts/:id should return 404
    const getRes = await request(app).get(`/api/prompts/${promptId}`);
    expect(getRes.status).toBe(404);

    // GET /api/prompts/:id/media should return 404 for soft-deleted prompt
    const getMediaRes = await request(app).get(`/api/prompts/${promptId}/media`);
    expect(getMediaRes.status).toBe(404);
  });
});
