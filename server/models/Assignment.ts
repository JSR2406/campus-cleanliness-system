import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Assignment extends Model {
  public id!: number;
  public complaint_id!: number;
  public staff_id!: number;
  public assigned_by!: number | null;
  public status!: 'Assigned' | 'In Progress' | 'Completed';
  public assigned_at!: Date;
  public started_at!: Date | null;
  public completed_at!: Date | null;
}

Assignment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  complaint_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Assigned', 'In Progress', 'Completed'),
    allowNull: false,
    defaultValue: 'Assigned',
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Assignment',
  createdAt: 'assigned_at',
  updatedAt: false,
});
