import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Complaint extends Model {
  public id!: number;
  public user_id!: number;
  public description!: string;
  public location!: string;
  public region!: string;
  public category!: string;
  public image_url!: string;
  public status!: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Completed' | 'Closed';
  public priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  public is_sos!: boolean;
  public is_safety_hazard!: boolean;
  public ai_urgency_score!: number | null;
  public ai_suggested_action!: string | null;
  public created_at!: Date;
  public completed_at!: Date | null;
}

Complaint.init({
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id:      { type: DataTypes.INTEGER, allowNull: false },
  description:  { type: DataTypes.TEXT, allowNull: false },
  location:     { type: DataTypes.STRING, allowNull: false },
  region:       { type: DataTypes.STRING, allowNull: false, defaultValue: 'General' },
  category:     { type: DataTypes.STRING, allowNull: false, defaultValue: 'Other' },
  image_url:    { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('Pending','Assigned','In Progress','Resolved','Completed','Closed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  priority: {
    type: DataTypes.ENUM('LOW','MEDIUM','HIGH','CRITICAL'),
    allowNull: false,
    defaultValue: 'LOW',
  },
  is_sos:              { type: DataTypes.BOOLEAN, defaultValue: false },
  is_safety_hazard:    { type: DataTypes.BOOLEAN, defaultValue: false },
  ai_urgency_score:    { type: DataTypes.INTEGER, allowNull: true },
  ai_suggested_action: { type: DataTypes.TEXT, allowNull: true },
  completed_at:        { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  modelName: 'Complaint',
  createdAt: 'created_at',
  updatedAt: false,
});
