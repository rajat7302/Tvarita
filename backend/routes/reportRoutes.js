import express from 'express';
import { createContentReport } from '../controllers/reportController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:targetType/:targetId', protect, createContentReport);

export default router;
