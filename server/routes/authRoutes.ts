import express from 'express';
import { register, login, googleAuth, getProfile, updateProfile } from '../controllers/authController.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleAuth);

// Profile routes — authenticated
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);

export default router;
