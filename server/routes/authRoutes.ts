import express from 'express';
import { register, login, googleAuth } from '../controllers/authController.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);

export default router;
