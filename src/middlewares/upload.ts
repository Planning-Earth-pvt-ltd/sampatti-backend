import express, { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import cloudinary from './cloudinary';
import { Readable } from 'stream';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
    files: 10,
  },
});

const streamUpload = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      return reject(new Error("Empty file buffer"));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'properties' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

export const handleMultipartData = (req: Request, res: Response, next: NextFunction): void => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.includes('multipart/form-data')) {
    upload.array('images', 10)(req, res, async (err?: any) => {
      if (err instanceof MulterError || err instanceof Error) {
        console.error('Multer error:', err);
        res.status(400).json({ error: 'File upload error: ' + err.message });
        return;
      }

      try {
        const files = (req.files || []) as Express.Multer.File[];

        if (!Array.isArray(files) || files.length === 0) {
          return res.status(400).json({ error: 'No image files uploaded' });
        }

        const uploadedUrls = await Promise.all(
          files.map((file) => streamUpload(file.buffer))
        );

        (req as any).cloudinaryImageUrls = uploadedUrls;

        next();
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        res.status(500).json({ error: 'Cloudinary upload failed' });
      }
    });
  } else {
    next();
  }
};

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

export const errorHandlerMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Unhandled error:', err);

  if (err instanceof MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({ error: 'File too large. Max size is 1MB.' });
        return;
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({ error: 'Too many files. Max allowed is 10.' });
        return;
      default:
        res.status(400).json({ error: `Multer error: ${err.message}` });
        return;
    }
  }

  res.status(500).json({ error: 'Internal server error' });
};
