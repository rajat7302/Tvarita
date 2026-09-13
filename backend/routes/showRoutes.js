import express from 'express';
import { getShowsByArtForm, getShowById, createBooking } from '../controllers/showController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/artform/:artFormId', getShowsByArtForm);
router.get('/:id', getShowById);
router.post('/book', protect, createBooking);

export default router;