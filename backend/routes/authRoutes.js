import express from 'express';
import { register, login, loginWithGoogle, getProfile, requestPasswordReset, resetPassword } from '../controllers/authController.js';

const router = express.Router();
import { updateProfile, updateProfilePhoto } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { getMyBookings } from '../controllers/paymentController.js';
import { mediaUpload } from '../middlewares/mediaUpload.js';


router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, mediaUpload.single('avatar'), updateProfilePhoto);
router.get('/profile', protect, getProfile);
router.get('/bookings', protect, getMyBookings);
router.post('/register', register);
router.post('/login', login);
router.post('/google', loginWithGoogle);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
