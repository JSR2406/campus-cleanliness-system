import { sequelize } from './config/database.js';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Complaint } from './models/Complaint.js';
import { Assignment } from './models/Assignment.js';
import { Proof } from './models/Proof.js';
import { Feedback } from './models/Feedback.js';

const REGIONS = ['Main Building', 'Hostel Block A', 'Hostel Block B', 'Library', 'Cafeteria', 'Sports Complex', 'Labs Block', 'Parking Lot'];
const CATEGORIES = ['Cleaning', 'Electrical', 'Structural', 'Plumbing', 'IT/Network', 'Safety Hazard', 'Pest Control', 'Gardening', 'Fire Safety', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

async function seed() {
  try {
    console.log('Connecting to database and syncing...');
    await sequelize.sync({ alter: true });

    console.log('Clearing existing data (except users)...');
    await Feedback.destroy({ where: {} });
    await Proof.destroy({ where: {} });
    await Assignment.destroy({ where: {} });
    await Complaint.destroy({ where: {} });

    console.log('Ensuring default users exist...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const staffPassword = await bcrypt.hash('staff123', salt);
    const studentPassword = await bcrypt.hash('password123', salt);

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@campus.com' },
      defaults: { name: 'System Admin', email: 'admin@campus.com', password: adminPassword, role: 'admin' }
    });

    const [staff] = await User.findOrCreate({
      where: { email: 'staff@campus.com' },
      defaults: { name: 'Maintenance Staff', email: 'staff@campus.com', password: staffPassword, role: 'staff' }
    });

    const [student] = await User.findOrCreate({
      where: { email: 'student@test.com' },
      defaults: { name: 'Test Student', email: 'student@test.com', password: studentPassword, role: 'student' }
    });

    console.log('Generating 20 diverse complaints...');
    
    // Unsplash placeholders
    const images = [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1595814436270-348981f421f9?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1580228800543-0cb860bf5486?auto=format&fit=crop&q=80&w=400',
    ];

    const generateComplaintData = (index: number) => {
      const region = REGIONS[index % REGIONS.length];
      const category = CATEGORIES[index % CATEGORIES.length];
      const priority = PRIORITIES[index % PRIORITIES.length];
      
      const daysAgo = Math.floor(Math.random() * 14);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      return {
        user_id: student.id,
        description: `This is a sample ${category} issue reported at ${region}. Please address this as soon as possible.`,
        location: `${region}, Room ${100 + index}`,
        region,
        category,
        image_url: images[index % images.length],
        priority,
        status: 'Pending',
        is_sos: priority === 'CRITICAL',
        is_safety_hazard: ['Electrical', 'Safety Hazard', 'Fire Safety'].includes(category),
        ai_urgency_score: Math.floor(Math.random() * 10) + 1,
        ai_suggested_action: `Dispatch appropriate team to handle ${category} issue.`,
        created_at: createdAt
      };
    };

    const complaintsToCreate = Array.from({ length: 20 }, (_, i) => generateComplaintData(i));
    
    // Statuses: 4 Pending, 4 Assigned, 4 In Progress, 4 Resolved, 4 Completed
    for (let i = 0; i < complaintsToCreate.length; i++) {
      const c = complaintsToCreate[i];
      let status: 'Pending'|'Assigned'|'In Progress'|'Resolved'|'Completed' = 'Pending';
      if (i >= 4 && i < 8) status = 'Assigned';
      else if (i >= 8 && i < 12) status = 'In Progress';
      else if (i >= 12 && i < 16) status = 'Resolved';
      else if (i >= 16) status = 'Completed';

      // @ts-ignore
      c.status = status;
      if (status === 'Completed') {
        // @ts-ignore
        c.completed_at = new Date();
      }

      const complaint = await Complaint.create(c as any);

      if (status !== 'Pending') {
        const assignment = await Assignment.create({
          complaint_id: complaint.id,
          staff_id: staff.id,
          assigned_by: admin.id,
          status: status === 'Assigned' ? 'Assigned' : 'In Progress'
        });

        if (status === 'In Progress' || status === 'Resolved' || status === 'Completed') {
          assignment.started_at = new Date();
          if (status === 'Resolved' || status === 'Completed') {
            assignment.completed_at = new Date();
            assignment.status = 'Completed';
            
            await Proof.create({
              complaint_id: complaint.id,
              staff_id: staff.id,
              image_url: images[i % images.length],
              notes: `Resolved the ${c.category} issue successfully.`
            });

            if (status === 'Completed') {
              await Feedback.create({
                complaint_id: complaint.id,
                user_id: student.id,
                staff_id: staff.id,
                rating: Math.floor(Math.random() * 3) + 3, // 3 to 5
                comment: 'Good job, issue resolved quickly.'
              });
            }
          }
          await assignment.save();
        }
      }
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
