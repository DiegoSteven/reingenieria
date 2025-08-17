import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cliente = sequelize.define('Cliente', {
  idCliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Nombre_Cliente: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  Apellido_Cliente: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  razon_s_Cliente: {
    type: DataTypes.STRING(200),
  },
  ruc_Cliente: {
    type: DataTypes.STRING(20),
  },
  direccion_Cliente: {
    type: DataTypes.STRING(100),
  },
  telefono_Cliente: {
    type: DataTypes.STRING(20),
  },
  correo_Cliente: {
    type: DataTypes.STRING(50),
  },
}, {
  tableName: 'table_cliente',
  timestamps: false,
});

export default Cliente;
