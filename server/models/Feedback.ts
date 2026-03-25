import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Feedback extends Model {
  public id!: number;
  public complaint_id!: number;
  public staff_id!: number;
  public rating!: number;
  public comment!: string;
  public created_at!: Date;
}

Feedback.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  complaint_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Feedback',
  createdAt: 'created_at',
  updatedAt: false,
});
