import express from 'express';
import { getArtForms, getArtFormById, requestArtForm } from '../controllers/artFormController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getArtForms);
router.get('/:id', getArtFormById);
router.post('/request', protect, requestArtForm);

export default router;