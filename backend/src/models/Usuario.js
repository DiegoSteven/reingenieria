import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'El nombre de usuario ya está en uso'
    },
    validate: {
      notNull: {
        msg: 'El nombre de usuario es requerido'
      },
      notEmpty: {
        msg: 'El nombre de usuario no puede estar vacío'
      }
    }
  },
  pasword: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM('Administrador', 'Empleado'),
    allowNull: false,
  },
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
  },
}, {
  tableName: 'usuario',
  timestamps: false,
});

export default Usuario;
