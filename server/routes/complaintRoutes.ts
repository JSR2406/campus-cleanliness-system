import express from 'express';
import multer from 'multer';
import { 
  createComplaint, 
  getMyComplaints, 
  getAllComplaints, 
  assignStaff, 
  getStaffTasks, 
  updateStatus, 
  uploadProof, 
  getAnalytics,
  getStaffList,
  submitFeedback,
  getStaffFeedback
} from '../controllers/complaintController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Student routes
router.post('/create', verifyToken, authorize(['student']), upload.single('image'), createComplaint);
router.get('/my', verifyToken, authorize(['student']), getMyComplaints);

// Admin routes
router.get('/all', verifyToken, authorize(['admin']), getAllComplaints);
router.post('/assign', verifyToken, authorize(['admin']), assignStaff);
router.get('/analytics', verifyToken, authorize(['admin']), getAnalytics);
router.get('/staff-list', verifyToken, authorize(['admin']), getStaffList);

// Staff routes
router.get('/staff-tasks', verifyToken, authorize(['staff']), getStaffTasks);
router.post('/upload-proof', verifyToken, authorize(['staff']), upload.single('image'), uploadProof);
router.patch('/status/:id', verifyToken, authorize(['staff', 'admin']), updateStatus);

// Feedback routes
router.post('/feedback', verifyToken, authorize(['student']), submitFeedback);
router.get('/staff/:staff_id/feedback', verifyToken, authorize(['admin']), getStaffFeedback);

export default router;
