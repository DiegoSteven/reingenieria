import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Cliente from './Cliente.js';

const Factura = sequelize.define('Factura', {
  No_Facturas: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'idCliente',
    },
  },
  id_mesas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  totals: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
  nro_boleta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  factura_boleta: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'table_facturas',
  timestamps: false,
});

Factura.belongsTo(Cliente, { 
  foreignKey: 'cliente',
  as: 'Cliente'
});
Cliente.hasMany(Factura, { 
  foreignKey: 'cliente',
  as: 'Facturas'
});

export default Factura;
