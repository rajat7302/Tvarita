import express from 'express';
import {
  getCommunityComments,
  createCommunityComment,
  toggleCommunityLike,
  createCommunityReply
} from '../controllers/communityCommentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:targetType/:targetId', getCommunityComments);
router.post('/:targetType/:targetId', protect, createCommunityComment);
router.post('/:targetType/:commentId/replies', protect, createCommunityReply);
router.put('/:targetType/:commentId/like', protect, toggleCommunityLike);
router.put('/:targetType/:commentId/replies/:replyId/like', protect, toggleCommunityLike);

export default router;
