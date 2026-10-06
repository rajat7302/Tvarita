import express from 'express';
import { 
  getPendingArtForms, 
  approveArtForm, 
  rejectArtForm,
  deleteCommunityPost,
  getPendingArtists,
  verifyArtist,
  rejectArtist
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { getOpenContentReports, reviewContentReport } from '../controllers/reportController.js';
import { verifyTicketAtDoor } from '../controllers/paymentController.js';

const router = express.Router();


router.use(protect);
router.use(adminOnly);

router.get('/pending-artforms', getPendingArtForms);
router.put('/approve-artform/:id', approveArtForm);
router.put('/reject-artform/:id', rejectArtForm);
router.delete('/post/:id', deleteCommunityPost);
router.get('/pending-artists', getPendingArtists);
router.patch('/verify-artist/:id', verifyArtist);
router.patch('/reject-artist/:id', rejectArtist);
router.get('/reports', getOpenContentReports);
router.patch('/reports/:id', reviewContentReport);
router.post('/verify-ticket', verifyTicketAtDoor);

export default router;