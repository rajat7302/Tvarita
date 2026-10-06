import express from 'express';
import { 
  createShow, 
  addShowReview, 
  getShows, 
  getShowReviews,
  toggleLikeReview, // 1. Import like controller
  addNestedReply, // 2. Import reply controller
  getShowsByArtForm
} from '../controllers/showController.js';
import { updateShowReview, deleteShowReview, updateNestedReviewReply, deleteNestedReviewReply } from '../controllers/showController.js';
import { protect, requireVerifiedArtist } from '../middlewares/authMiddleware.js';
import { mediaUpload } from '../middlewares/mediaUpload.js';

const router = express.Router();

// Public routes
router.get('/', getShows);
router.get('/artform/:artFormId', getShowsByArtForm);
router.get('/:id/reviews', getShowReviews);

// Protected routes
router.post('/', protect, requireVerifiedArtist, mediaUpload.single('media'), createShow);
router.post('/:id/reviews', protect, mediaUpload.single('media'), addShowReview);
router.patch('/reviews/:reviewId', protect, updateShowReview);
router.delete('/reviews/:reviewId', protect, deleteShowReview);
router.patch('/reviews/:reviewId/replies/:replyId', protect, updateNestedReviewReply);
router.delete('/reviews/:reviewId/replies/:replyId', protect, deleteNestedReviewReply);

// 3. Add routes for Liking and Replying to reviews/nested replies
router.put('/reviews/:reviewId/like', protect, toggleLikeReview);
router.put('/reviews/:reviewId/replies/:replyId/like', protect, toggleLikeReview);
router.post('/reviews/:reviewId/replies', protect, addNestedReply);

export default router;