import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Complaint extends Model {
  public id!: number;
  public user_id!: number;
  public description!: string;
  public location!: string;
  public image_url!: string;
  public status!: 'Pending' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed';
  public priority!: 'LOW' | 'MEDIUM' | 'HIGH';
  public created_at!: Date;
  public completed_at!: Date | null;
}

Complaint.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Assigned', 'In Progress', 'Completed', 'Closed'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: false,
    defaultValue: 'LOW',
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Complaint',
  createdAt: 'created_at',
  updatedAt: false,
});
