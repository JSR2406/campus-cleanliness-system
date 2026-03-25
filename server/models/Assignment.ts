import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Assignment extends Model {
  public id!: number;
  public complaint_id!: number;
  public staff_id!: number;
  public assigned_at!: Date;
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
}, {
  sequelize,
  modelName: 'Assignment',
  createdAt: 'assigned_at',
  updatedAt: false,
});
