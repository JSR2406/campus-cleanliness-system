import { User } from './User.js';
import { Complaint } from './Complaint.js';
import { Assignment } from './Assignment.js';
import { Proof } from './Proof.js';
import { Feedback } from './Feedback.js';

// User has many Complaints
User.hasMany(Complaint, { foreignKey: 'user_id' });
Complaint.belongsTo(User, { foreignKey: 'user_id' });

// Complaint has one Assignment
Complaint.hasOne(Assignment, { foreignKey: 'complaint_id' });
Assignment.belongsTo(Complaint, { foreignKey: 'complaint_id' });

// Assignment belongs to Staff (User)
User.hasMany(Assignment, { foreignKey: 'staff_id' });
Assignment.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

// Complaint has many Proofs
Complaint.hasMany(Proof, { foreignKey: 'complaint_id' });
Proof.belongsTo(Complaint, { foreignKey: 'complaint_id' });

// Feedback relationships
Complaint.hasOne(Feedback, { foreignKey: 'complaint_id' });
Feedback.belongsTo(Complaint, { foreignKey: 'complaint_id' });

User.hasMany(Feedback, { foreignKey: 'staff_id', as: 'staffFeedback' });
Feedback.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

export { User, Complaint, Assignment, Proof, Feedback };
