import express from 'express';
import { register, login, loginWithGoogle, getProfile, requestPasswordReset, resetPassword } from '../controllers/authController.js';

const router = express.Router();
import { updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';


router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);
router.post('/register', register);
router.post('/login', login);
router.post('/google', loginWithGoogle);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
