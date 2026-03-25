import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Complaint, User, Assignment, Proof, Feedback } from '../models/index.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { description, location } = req.body;
    const user_id = req.user!.id;

    let image_url = '';
    if (req.file) {
      // In a real app, we'd upload to Cloudinary here
      // For this environment, if no keys are provided, we'll use a placeholder
      if (process.env.CLOUDINARY_API_KEY) {
        const result = await cloudinary.uploader.upload(req.file.path);
        image_url = result.secure_url;
      } else {
        image_url = `https://picsum.photos/seed/${Date.now()}/800/600`;
      }
    }

    let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    const loc = location.toLowerCase();
    if (loc.includes('washroom') || loc.includes('toilet')) {
      priority = 'HIGH';
    } else if (loc.includes('hostel') || loc.includes('dorm')) {
      priority = 'MEDIUM';
    }

    const complaint = await Complaint.create({
      user_id,
      description,
      location,
      image_url,
      status: 'Pending',
      priority
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.findAll({
      where: { user_id: req.user!.id },
      order: [['created_at', 'DESC']]
    });
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Assignment, include: [{ model: User, as: 'staff', attributes: ['name'] }] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const assignStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { complaint_id, staff_id } = req.body;

    const complaint = await Complaint.findByPk(complaint_id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    await Assignment.create({ complaint_id, staff_id });
    await complaint.update({ status: 'Assigned' });

    res.json({ message: 'Staff assigned successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffTasks = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await Assignment.findAll({
      where: { staff_id: req.user!.id },
      include: [{ model: Complaint }]
    });
    res.json(assignments.map((a: any) => a.Complaint));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const updateData: any = { status };
    if (status === 'Completed') {
      updateData.completed_at = new Date();
    }

    await complaint.update(updateData);
    res.json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadProof = async (req: AuthRequest, res: Response) => {
  try {
    const { complaint_id } = req.body;

    let image_url = '';
    if (req.file) {
      if (process.env.CLOUDINARY_API_KEY) {
        const result = await cloudinary.uploader.upload(req.file.path);
        image_url = result.secure_url;
      } else {
        image_url = `https://picsum.photos/seed/proof-${Date.now()}/800/600`;
      }
    }

    await Proof.create({ complaint_id, image_url });
    const complaint = await Complaint.findByPk(complaint_id);
    if (complaint) {
      await complaint.update({ status: 'Completed', completed_at: new Date() });
    }

    res.json({ message: 'Proof uploaded and status updated to Completed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { complaint_id, rating, comment } = req.body;
    const user_id = req.user!.id;

    const complaint: any = await Complaint.findOne({
      where: { id: complaint_id, user_id, status: 'Closed' },
      include: [{ model: Assignment }]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found or not eligible for feedback' });
    }

    if (!complaint.Assignment) {
      return res.status(400).json({ message: 'No staff member was assigned to this complaint' });
    }

    const feedback = await Feedback.create({
      complaint_id,
      staff_id: complaint.Assignment.staff_id,
      rating,
      comment
    });

    res.status(201).json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { staff_id } = req.params;
    const feedback = await Feedback.findAll({
      where: { staff_id },
      include: [{ model: Complaint, attributes: ['description', 'location'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const complaints = await Complaint.findAll();
    const feedbacks = await Feedback.findAll();
    
    const byLocation: any = {};
    const byStatus: any = {};
    let totalSLA = 0;
    let completedCount = 0;

    complaints.forEach(c => {
      byLocation[c.location] = (byLocation[c.location] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      
      if (c.completed_at && c.created_at) {
        const sla = new Date(c.completed_at).getTime() - new Date(c.created_at).getTime();
        totalSLA += sla;
        completedCount++;
      }
    });

    const avgSLA = completedCount > 0 ? (totalSLA / completedCount / (1000 * 60 * 60)).toFixed(2) : 0;
    
    const totalRating = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

    const heatmapData = Object.keys(byLocation).map(loc => ({
      location: loc,
      count: byLocation[loc]
    }));

    res.json({
      total: complaints.length,
      completed: completedCount,
      byLocation,
      byStatus,
      avgSLA_hours: avgSLA,
      avgRating,
      totalFeedback: feedbacks.length,
      heatmapData
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStaffList = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await User.findAll({
      where: { role: 'staff' },
      attributes: ['id', 'name', 'email']
    });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
