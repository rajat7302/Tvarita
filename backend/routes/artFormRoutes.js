import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { getArtForms, getArtFormById, requestArtForm } from '../controllers/artFormController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure Cloudinary explicitly with process.env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tvarita_art_forms',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage });

router.get('/', getArtForms);
router.get('/:id', getArtFormById);

router.post('/request', protect, upload.single('image'), requestArtForm);

export default router;