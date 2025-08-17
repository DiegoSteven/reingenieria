import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Caja = sequelize.define('Caja', {
  id_table_cajas: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  referencia: {
    type: DataTypes.STRING(200),
    allowNull: true,
  }
}, {
  tableName: 'table_cajas',
  timestamps: false,
});

export default Caja;
