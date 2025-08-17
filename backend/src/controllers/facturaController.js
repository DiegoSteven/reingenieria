import { Op } from 'sequelize';
import Factura from '../models/Factura.js';
import Cliente from '../models/Cliente.js';
import Caja from '../models/Caja.js';

export async function registrarVenta(req, res) {
  try {
    // Validar que el cliente existe
    const clienteExiste = await Cliente.findByPk(req.body.cliente);
    if (!clienteExiste) {
      return res.status(400).json({
        success: false,
        message: 'El cliente especificado no existe'
      });
    }

    // Verificar si la caja está abierta
    const cajaAbierta = await Caja.findOne({
      where: {
        fecha: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        },
        estado: 'abierta'
      }
    });

    if (!cajaAbierta) {
      return res.status(400).json({
        success: false,
        message: 'La caja debe estar abierta para registrar ventas'
      });
    }

    // Obtener el último número de boleta
    const ultimaFactura = await Factura.findOne({
      order: [['nro_boleta', 'DESC']]
    });
    const nuevoNroBoleta = ultimaFactura ? ultimaFactura.nro_boleta + 1 : 1;

    // Crear la factura con los datos recibidos
    const nuevaFactura = await Factura.create({
      ...req.body,
      fecha: req.body.fecha || new Date(),
      nro_boleta: nuevoNroBoleta,
      factura_boleta: 'F'
    });
    
    // Buscar la factura con los datos del cliente
    const facturaConCliente = await Factura.findOne({
      where: { No_Facturas: nuevaFactura.No_Facturas },
      include: [{
        model: Cliente,
        as: 'Cliente',
        attributes: ['idCliente', 'Nombre_Cliente', 'Apellido_Cliente', 'razon_s_Cliente', 'ruc_Cliente']
      }]
    });

    if (!facturaConCliente) {
      return res.status(404).json({
        success: false,
        message: 'Error al recuperar la factura creada'
      });
    }

    // Registrar el movimiento en caja
    await Caja.create({
      fecha: nuevaFactura.fecha,
      monto: nuevaFactura.totals,
      estado: 'ingreso',
      referencia: `Factura #${nuevaFactura.No_Facturas}`
    });

    res.status(201).json({ 
      success: true, 
      data: facturaConCliente,
      message: 'Venta registrada exitosamente'
    });
  } catch (err) {
    console.error('Error al registrar venta:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar venta', 
      error: err.message 
    });
  }
}

export async function consultarVentas(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    let where = {};
    if (startDate && endDate) {
      where.fecha = {
        [Op.between]: [startDate, endDate]
      };
    }

    const ventas = await Factura.findAll({
      where,
      include: [{
        model: Cliente,
        as: 'Cliente',
        attributes: ['idCliente', 'Nombre_Cliente', 'Apellido_Cliente', 'razon_s_Cliente', 'ruc_Cliente']
      }],
      order: [['fecha', 'DESC']]
    });

    if (!ventas) {
      return res.json({
        success: true,
        data: [],
        message: 'No se encontraron ventas'
      });
    }

    const ventasFormateadas = ventas.map(venta => {
      const ventaPlana = venta.get({ plain: true });
      if (!ventaPlana.Cliente) {
        ventaPlana.Cliente = {
          Nombre_Cliente: 'Cliente no encontrado',
          Apellido_Cliente: ''
        };
      }
      return ventaPlana;
    });

    res.json({ 
      success: true, 
      data: ventasFormateadas,
      message: 'Ventas consultadas exitosamente'
    });
  } catch (err) {
    console.error('Error al consultar ventas:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error al consultar ventas', 
      error: err.message 
    });
  }
}
