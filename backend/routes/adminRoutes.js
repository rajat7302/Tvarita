import express from 'express';
import { 
  getPendingArtForms, 
  approveArtForm, 
  deleteCommunityPost,
  getPendingArtists,   // <-- 1. Import getPendingArtists
  verifyArtist         // <-- 2. Import verifyArtist
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/pending-artforms', protect, adminOnly, getPendingArtForms);
router.put('/approve-artform/:id', protect, adminOnly, approveArtForm);
router.delete('/post/:id', protect, adminOnly, deleteCommunityPost);

router.get('/pending-artists', protect, adminOnly, getPendingArtists);
router.patch('/verify-artist/:id', protect, adminOnly, verifyArtist);

export default router;