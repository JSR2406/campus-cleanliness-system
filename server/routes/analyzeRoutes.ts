import { Router } from 'express';
import { analyzeComplaint, analyzeHealth } from '../controllers/analyzeController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/analyze', verifyToken, analyzeComplaint);
router.post('/health', verifyToken, authorize(['admin']), analyzeHealth);

export default router;
