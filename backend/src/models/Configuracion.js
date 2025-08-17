import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Configuracion = sequelize.define('Configuracion', {
  id_configuracion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre_empresa: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  impuesto: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  moneda: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  simbolo_moneda: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  ruc: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  celular: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  dimension_x: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  dimension_y: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  cantidad_ceros_boleta: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  cantidad_ceros_factura: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'table_configuracion',
  timestamps: false,
});

export default Configuracion;
