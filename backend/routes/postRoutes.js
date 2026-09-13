import express from 'express';
import { getPostsByArtForm, createPost } from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { moderateContent } from '../middlewares/moderationMiddleware.js';

const router = express.Router();

router.get('/artform/:artFormId', getPostsByArtForm);
router.post('/', protect, moderateContent, createPost);

export default router;