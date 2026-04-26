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
    // Guest users cannot create complaints
    if (req.user!.id === 999) {
      return res.status(403).json({ message: 'Guest users cannot submit reports. Please create an account first.' });
    }

    const {
      description, location,
      region = 'General', category = 'Other',
      is_sos, ai_urgency_score, ai_suggested_action, is_safety_hazard
    } = req.body;
    const user_id = req.user!.id;
    const isSOS = is_sos === 'true' || is_sos === true;
    const aiScore = parseInt(ai_urgency_score || '0', 10);

    let image_url = '';
    if (req.file) {
      if (process.env.CLOUDINARY_API_KEY) {
        const result = await cloudinary.uploader.upload(req.file.path);
        image_url = result.secure_url;
      } else {
        const categoryImages: Record<string, string> = {
          'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
          'Structural': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop',
          'Plumbing':   'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?q=80&w=800&auto=format&fit=crop',
          'IT/Network': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
          'Pest Control':'https://images.unsplash.com/photo-1592921870789-04563d55041c?q=80&w=800&auto=format&fit=crop',
          'Fire Safety':'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=800&auto=format&fit=crop',
          'Gardening':  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800&auto=format&fit=crop',
          'Cleaning':   'https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=800&auto=format&fit=crop',
          'Academic Block': 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop',
        };
        image_url = categoryImages[category] || categoryImages[region] || `https://picsum.photos/seed/${Date.now()}/800/600`;
      }
    }

    // Priority logic: SOS > AI score > location heuristic
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (isSOS || ['Safety Hazard','Fire Safety'].includes(category)) {
      priority = 'CRITICAL';
    } else if (aiScore >= 8 || ['Electrical'].includes(category)) {
      priority = 'HIGH';
    } else if (aiScore >= 5 || ['Plumbing','Structural','Pest Control'].includes(category)) {
      priority = 'MEDIUM';
    } else {
      const loc = location.toLowerCase();
      if (loc.includes('washroom') || loc.includes('toilet')) priority = 'HIGH';
      else if (loc.includes('hostel') || loc.includes('dorm')) priority = 'MEDIUM';
    }

    const complaint = await Complaint.create({
      user_id,
      description,
      location,
      region,
      category,
      image_url,
      status: 'Pending',
      priority,
      is_sos: isSOS,
      ai_urgency_score: aiScore || null,
      ai_suggested_action: ai_suggested_action || null,
      is_safety_hazard: is_safety_hazard === 'true' || false,
    });

    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyComplaints = async (req: AuthRequest, res: Response) => {
  try {
    // Return empty array for guest users — no DB lookup needed
    if (req.user!.id === 999) {
      return res.json([]);
    }
    const complaints = await Complaint.findAll({
      where: { user_id: req.user!.id },
      include: [
        { model: Assignment, include: [{ model: User, as: 'staff', attributes: ['name'] }] }
      ],
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

    // Remove existing assignment if present (re-assign flow)
    await Assignment.destroy({ where: { complaint_id } });

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
      include: [{ 
        model: Complaint,
        include: [{ model: User, attributes: ['name', 'email'] }]
      }]
    });
    // Return complaint objects with assignment id, filtering out fully Completed/Closed tasks
    const tasks = assignments
      .filter((a: any) => a.Complaint && !['Completed', 'Closed'].includes(a.Complaint.status))
      .map((a: any) => ({
        ...a.Complaint.dataValues,
        assignmentId: a.id,
      }));
    res.json(tasks);
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
      await complaint.update({ status: 'Resolved' });
    }

    res.json({ message: 'Proof uploaded and status updated to Resolved' });
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
    
    const byRegion: any = {};
    const byCategory: any = {};
    const byStatus: any = {};
    const byLocation: any = {};
    let totalSLA = 0;
    let completedCount = 0;

    complaints.forEach((c: any) => {
      // Group by region
      byRegion[c.region || 'General'] = (byRegion[c.region || 'General'] || 0) + 1;
      // Group by category
      byCategory[c.category || 'Other'] = (byCategory[c.category || 'Other'] || 0) + 1;
      // Group by status
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      // Group by location (legacy)
      byLocation[c.location] = (byLocation[c.location] || 0) + 1;
      
      if (c.completed_at && c.created_at) {
        const sla = new Date(c.completed_at).getTime() - new Date(c.created_at).getTime();
        totalSLA += sla;
        completedCount++;
      }
    });

    const avgSLA = completedCount > 0 ? (totalSLA / completedCount / (1000 * 60 * 60)).toFixed(2) : 0;
    
    const totalRating = feedbacks.reduce((acc: number, f: any) => acc + f.rating, 0);
    const avgRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

    const heatmapData = Object.keys(byLocation).map(loc => ({
      location: loc,
      count: byLocation[loc]
    }));

    const regionData = Object.keys(byRegion).map(r => ({
      name: r,
      value: byRegion[r]
    }));

    const categoryData = Object.keys(byCategory).map(cat => ({
      name: cat,
      value: byCategory[cat]
    }));

    res.json({
      total: complaints.length,
      completed: completedCount,
      byLocation,
      byStatus,
      byRegion,
      byCategory,
      regionData,
      categoryData,
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
    const { Op } = await import('sequelize');
    const staff = await User.findAll({
      where: { role: { [Op.in]: ['staff', 'teacher'] } },
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
