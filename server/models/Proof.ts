import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Proof extends Model {
  public id!: number;
  public complaint_id!: number;
  public image_url!: string;
  public uploaded_at!: Date;
}

Proof.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  complaint_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Proof',
  createdAt: 'uploaded_at',
  updatedAt: false,
});
