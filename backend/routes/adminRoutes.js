import express from 'express';
import { 
  getPendingArtForms, 
  approveArtForm, 
  deleteCommunityPost,
  getPendingArtists,
  verifyArtist 
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Enforce authentication & authorization globally on all admin routes
router.use(protect);
router.use(adminOnly);

router.get('/pending-artforms', getPendingArtForms);
router.put('/approve-artform/:id', approveArtForm);
router.delete('/post/:id', deleteCommunityPost);
router.get('/pending-artists', getPendingArtists);
router.patch('/verify-artist/:id', verifyArtist);

export default router;