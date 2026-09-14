import express from 'express';
import { createShow, bookShowTickets, addShowReview } from '../controllers/showController.js';
import { verifyToken, requireVerifiedArtist } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, requireVerifiedArtist, createShow);
router.post('/:id/book', verifyToken, bookShowTickets);
router.post('/:id/reviews', verifyToken, addShowReview);

export default router;