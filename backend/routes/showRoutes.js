import express from 'express';
import { 
  createShow, 
  bookShowTickets, 
  addShowReview, 
  getShows, 
  getShowReviews,
  toggleLikeReview, // 1. Import like controller
  addNestedReply   // 2. Import reply controller
} from '../controllers/showController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getShows);
router.get('/:id/reviews', getShowReviews);

// Protected routes
router.post('/', protect, createShow);
router.post('/:id/book', protect, bookShowTickets);
router.post('/:id/reviews', protect, addShowReview);

// 3. Add routes for Liking and Replying to reviews/nested replies
router.put('/reviews/:reviewId/like', protect, toggleLikeReview);
router.put('/reviews/:reviewId/replies/:replyId/like', protect, toggleLikeReview);
router.post('/reviews/:reviewId/replies', protect, addNestedReply);

export default router;