import express from 'express';
import {
  getCommunityComments,
  createCommunityComment,
  toggleCommunityLike,
  createCommunityReply,
  updateCommunityComment,
  deleteCommunityComment,
  updateCommunityReply,
  deleteCommunityReply
} from '../controllers/communityCommentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:targetType/:targetId', getCommunityComments);
router.post('/:targetType/:targetId', protect, createCommunityComment);
router.patch('/:targetType/:targetId/comments/:commentId', protect, updateCommunityComment);
router.delete('/:targetType/:targetId/comments/:commentId', protect, deleteCommunityComment);
router.post('/:targetType/:commentId/replies', protect, createCommunityReply);
router.patch('/:targetType/:commentId/replies/:replyId', protect, updateCommunityReply);
router.delete('/:targetType/:commentId/replies/:replyId', protect, deleteCommunityReply);
router.put('/:targetType/:commentId/like', protect, toggleCommunityLike);
router.put('/:targetType/:commentId/replies/:replyId/like', protect, toggleCommunityLike);

export default router;
