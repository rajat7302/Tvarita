import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tvarita_media',
    resource_type: (req, file) => file.mimetype?.startsWith('image/') ? 'image' : 'video'
  }
});

export const mediaUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});
