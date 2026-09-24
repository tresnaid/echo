import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

export interface ProcessedMedia {
  media_type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  medium_url: string | null;
  file_path: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  aspect_ratio: number | null;
}

export function getUploadsDir(): string {
  const baseDir = process.env.UPLOADS_PATH || path.resolve(process.cwd(), 'data/uploads');
  const dirs = [
    baseDir,
    path.join(baseDir, 'originals'),
    path.join(baseDir, 'thumbnails'),
    path.join(baseDir, 'medium'),
    path.join(baseDir, 'videos'),
    path.join(baseDir, 'temp'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  return baseDir;
}

export async function processUploadedFile(file: Express.Multer.File): Promise<ProcessedMedia> {
  const uploadsDir = getUploadsDir();
  const fileHash = crypto.randomBytes(12).toString('hex');
  const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const isVideo = file.mimetype.startsWith('video/');
  const isImage = file.mimetype.startsWith('image/');
  const hasDiskPath = !!file.path && fs.existsSync(file.path);
  const fileSize = file.size || 0;

  if (isVideo) {
    const videoFileName = `${fileHash}_${sanitizedOriginalName}`;
    const targetPath = path.join(uploadsDir, 'videos', videoFileName);

    if (hasDiskPath) {
      // Move streamed disk file to destination
      await fs.promises.rename(file.path, targetPath).catch(async () => {
        await fs.promises.copyFile(file.path, targetPath);
        await fs.promises.unlink(file.path).catch(() => {});
      });
    } else if (file.buffer) {
      await fs.promises.writeFile(targetPath, file.buffer);
    }

    return {
      media_type: 'video',
      url: `/uploads/videos/${videoFileName}`,
      thumbnail_url: null,
      medium_url: null,
      file_path: targetPath,
      file_name: file.originalname,
      file_size: fileSize,
      mime_type: file.mimetype,
      width: null,
      height: null,
      aspect_ratio: null,
    };
  }

  if (isImage) {
    // Check if SVG
    if (file.mimetype === 'image/svg+xml') {
      const svgFileName = `${fileHash}_${sanitizedOriginalName}`;
      const targetPath = path.join(uploadsDir, 'originals', svgFileName);

      if (hasDiskPath) {
        await fs.promises.rename(file.path, targetPath).catch(async () => {
          await fs.promises.copyFile(file.path, targetPath);
          await fs.promises.unlink(file.path).catch(() => {});
        });
      } else if (file.buffer) {
        await fs.promises.writeFile(targetPath, file.buffer);
      }

      return {
        media_type: 'image',
        url: `/uploads/originals/${svgFileName}`,
        thumbnail_url: `/uploads/originals/${svgFileName}`,
        medium_url: `/uploads/originals/${svgFileName}`,
        file_path: targetPath,
        file_name: file.originalname,
        file_size: fileSize,
        mime_type: file.mimetype,
        width: null,
        height: null,
        aspect_ratio: null,
      };
    }

    // Process raster image with sharp using file path (or buffer fallback)
    try {
      const imageInput = hasDiskPath ? file.path : file.buffer;
      const imageInstance = sharp(imageInput);
      const metadata = await imageInstance.metadata();
      const width = metadata.width || null;
      const height = metadata.height || null;
      const aspect_ratio = width && height ? Number((width / height).toFixed(4)) : null;

      // Save original file
      const ext = path.extname(file.originalname) || `.${metadata.format || 'jpg'}`;
      const originalFileName = `${fileHash}_original${ext}`;
      const originalPath = path.join(uploadsDir, 'originals', originalFileName);

      if (hasDiskPath) {
        await fs.promises.copyFile(file.path, originalPath);
      } else if (file.buffer) {
        await fs.promises.writeFile(originalPath, file.buffer);
      }

      // Generate medium WebP (max width 640px)
      const mediumFileName = `${fileHash}_medium.webp`;
      const mediumPath = path.join(uploadsDir, 'medium', mediumFileName);
      await sharp(imageInput)
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(mediumPath);

      // Generate thumbnail WebP (max width 320px)
      const thumbFileName = `${fileHash}_thumb.webp`;
      const thumbPath = path.join(uploadsDir, 'thumbnails', thumbFileName);
      await sharp(imageInput)
        .resize({ width: 320, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(thumbPath);

      return {
        media_type: 'image',
        url: `/uploads/originals/${originalFileName}`,
        thumbnail_url: `/uploads/thumbnails/${thumbFileName}`,
        medium_url: `/uploads/medium/${mediumFileName}`,
        file_path: originalPath,
        file_name: file.originalname,
        file_size: fileSize,
        mime_type: file.mimetype,
        width,
        height,
        aspect_ratio,
      };
    } finally {
      // Guaranteed cleanup of temp file even if sharp/fs throws an error
      if (hasDiskPath) {
        await fs.promises.unlink(file.path).catch(() => {});
      }
    }
  }

  // Cleanup temp file on unsupported type
  if (hasDiskPath) {
    await fs.promises.unlink(file.path).catch(() => {});
  }

  throw new Error(`Unsupported media MIME type: ${file.mimetype}`);
}
