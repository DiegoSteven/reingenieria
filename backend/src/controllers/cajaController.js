import Caja from '../models/Caja.js';
import { Op } from 'sequelize';

export async function consultarCaja(req, res) {
  try {
    const { fecha } = req.query;
    let where = {};
    
    if (fecha) {
      where.fecha = fecha;
    }

    const movimientos = await Caja.findAll({
      where,
      order: [['fecha', 'DESC'], ['id_table_cajas', 'DESC']]
    });

    // Calcular saldo actual
    const saldoActual = movimientos.reduce((acc, mov) => {
      return acc + (mov.estado === 'ingreso' ? mov.monto : -mov.monto);
    }, 0);

    res.json({
      success: true,
      data: movimientos,
      saldoActual,
      message: 'Caja consultada exitosamente'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error al consultar caja', 
      error: err.message 
    });
  }
}

export async function registrarMovimiento(req, res) {
  try {
    const { monto, estado, referencia } = req.body;
    
    const movimientoData = {
      monto: monto,
      estado: estado,
      fecha: new Date(),
      referencia: referencia || null
    };
    
    const nuevoMovimiento = await Caja.create(movimientoData);
    res.status(201).json({ 
      success: true, 
      data: nuevoMovimiento, 
      message: 'Movimiento registrado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar movimiento', 
      error: err.message 
    });
  }
}

export async function abrirCaja(req, res) {
  try {
    const { montoInicial } = req.body;

    // Validar monto inicial
    if (!montoInicial || montoInicial <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto inicial debe ser mayor a 0'
      });
    }

    // Verificar si ya hay una caja abierta
    const cajaAbierta = await Caja.findOne({
      where: {
        fecha: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        },
        estado: 'apertura'
      }
    });

    if (cajaAbierta) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una caja abierta para hoy'
      });
    }

    // Verificar si hay una caja sin cerrar del día anterior
    const ultimaCaja = await Caja.findOne({
      where: {
        fecha: {
          [Op.lt]: new Date().toISOString().split('T')[0]
        },
        estado: 'apertura'
      },
      order: [['fecha', 'DESC']]
    });

    if (ultimaCaja) {
      return res.status(400).json({
        success: false,
        message: 'Existe una caja sin cerrar del día anterior. Por favor, cierre la caja anterior antes de abrir una nueva.'
      });
    }

    const apertura = await Caja.create({
      monto: montoInicial,
      estado: 'apertura',
      fecha: new Date(),
      referencia: 'Apertura de caja'
    });

    res.status(201).json({
      success: true,
      data: apertura,
      message: 'Caja abierta exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al abrir caja',
      error: err.message
    });
  }
}

export async function cerrarCaja(req, res) {
  try {
    const { fecha } = req.query;
    const fechaCierre = fecha || new Date();

    // Obtener todos los movimientos del día
    const movimientos = await Caja.findAll({
      where: {
        fecha: fechaCierre
      }
    });

    // Calcular saldo final
    const saldoFinal = movimientos.reduce((acc, mov) => {
      return acc + (mov.estado === 'ingreso' ? mov.monto : -mov.monto);
    }, 0);

    // Registrar cierre
    const cierre = await Caja.create({
      monto: saldoFinal,
      estado: 'cierre',
      fecha: fechaCierre,
      referencia: 'Cierre de caja'
    });

    res.status(200).json({
      success: true,
      data: {
        cierre,
        saldoFinal,
        movimientos
      },
      message: 'Caja cerrada exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar caja',
      error: err.message
    });
  }
}

export async function obtenerEstadoCaja(req, res) {
  try {
    const fecha = new Date();
    
    // Buscar apertura del día
    const apertura = await Caja.findOne({
      where: {
        fecha,
        estado: 'apertura'
      }
    });

    // Buscar cierre del día
    const cierre = await Caja.findOne({
      where: {
        fecha,
        estado: 'cierre'
      }
    });

    // Calcular saldo actual
    const movimientos = await Caja.findAll({
      where: {
        fecha,
        estado: {
          [Op.ne]: 'cierre'
        }
      }
    });

    const saldoActual = movimientos.reduce((acc, mov) => {
      return acc + (mov.estado === 'ingreso' || mov.estado === 'apertura' ? mov.monto : -mov.monto);
    }, 0);

    res.json({
      success: true,
      data: {
        estaAbierta: !!apertura && !cierre,
        apertura,
        saldoActual,
        movimientos
      },
      message: 'Estado de caja consultado exitosamente'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al consultar estado de caja',
      error: err.message
    });
  }
}
