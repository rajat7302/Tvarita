import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { getCloudinaryResourceType, isSupportedMedia } from '../utils/media.js';
import { randomUUID } from 'crypto';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tvarita_media',
    resource_type: (req, file) => getCloudinaryResourceType(file),
    public_id: (req, file) => {
      const resourceType = getCloudinaryResourceType(file);
      const extension = String(file.originalname || '').match(/\.[^.]+$/)?.[0]?.toLowerCase() || '';
      const name = String(file.originalname || 'upload')
        .replace(/\.[^.]+$/, '')
        .normalize('NFKD')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .slice(0, 60);
      return `${name || 'upload'}_${randomUUID()}${resourceType === 'raw' ? extension : ''}`;
    }
  }
});

export const mediaUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!isSupportedMedia(file)) {
      const error = new Error('Choose an image, video, audio file, or supported document (PDF, DOCX, XLSX, PPTX, TXT, CSV).');
      error.statusCode = 415;
      return callback(error);
    }
    callback(null, true);
  }
});
