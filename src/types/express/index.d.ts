import 'express';
import multer from 'multer';

declare global {
  namespace Express {
    interface Request {
      files?: multer.File[] | { [fieldname: string]: multer.File[] };
    }
  }
}
