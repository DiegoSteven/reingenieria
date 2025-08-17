import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Espacio = sequelize.define('Espacio', {
  id_espacio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zona: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'table_espacio',
  timestamps: false,
});

export default Espacio;
