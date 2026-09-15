import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();
import { updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

// const router = express.Router();

// Put endpoint secured with JWT auth middleware
router.put('/profile', protect, updateProfile);
router.post('/register', register);
router.post('/login', login);

export default router;