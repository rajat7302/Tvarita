import express from 'express';
import { createShow, bookShowTickets, addShowReview, getShows } from '../controllers/showController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route: Fetch all upcoming shows
router.get('/', getShows);

// Protected routes for creation, booking, and reviews
router.post('/', protect, createShow);
router.post('/:id/book', protect, bookShowTickets);
router.post('/:id/reviews', protect, addShowReview);

export default router;