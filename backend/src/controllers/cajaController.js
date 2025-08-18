import Caja from '../models/Caja.js';
import Configuracion from '../models/Configuracion.js';
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
      order: [['id_table_cajas', 'ASC']]  // Ordenar por ID ascendente para mantener el orden cronológico
    });

    // Filtrar los movimientos válidos (no mostrar registros cerrados ni de cierre)
    const movimientosValidos = movimientos.filter(mov => mov.estado !== 'cerrada' && mov.estado !== 'cierre');

    // Calcular saldo actual solo con movimientos válidos
    const saldoActual = movimientosValidos.reduce((acc, mov) => {
      const monto = Number(mov.monto);
      if (isNaN(monto)) return acc;
      
      switch(mov.estado) {
        case 'apertura':
        case 'ingreso':
          return acc + monto;
        case 'egreso':
          return acc - monto;
        default:
          return acc;
      }
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
    const fecha = new Date().toISOString().split('T')[0];
    
    // Verificar si hay una caja abierta
    const cajaAbierta = await Caja.findOne({
      where: {
        fecha: fecha,
        estado: 'apertura'
      }
    });

    if (!cajaAbierta) {
      return res.status(400).json({
        success: false,
        message: 'La caja debe estar abierta para registrar movimientos'
      });
    }
    
    const movimientoData = {
      monto: monto,
      estado: estado,
      fecha: fecha,
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
    const fechaCierre = fecha || new Date().toISOString().split('T')[0];

    // Buscar la apertura del día
    const apertura = await Caja.findOne({
      where: {
        fecha: fechaCierre,
        estado: 'apertura'
      }
    });

    if (!apertura) {
      return res.status(400).json({
        success: false,
        message: 'No hay una caja abierta para cerrar'
      });
    }

    // Obtener todos los movimientos del día
    const movimientos = await Caja.findAll({
      where: {
        fecha: fechaCierre
      }
    });

    // Calcular saldo final
    const saldoFinal = movimientos.reduce((acc, mov) => {
      switch(mov.estado) {
        case 'apertura':
        case 'ingreso':
          return acc + Number(mov.monto);
        case 'egreso':
          return acc - Number(mov.monto);
        default:
          return acc;
      }
    }, 0);

    // Actualizar el estado de la apertura a 'cerrada'
    await Caja.update(
      { estado: 'cerrada' },
      {
        where: {
          id_table_cajas: apertura.id_table_cajas
        }
      }
    );

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
    const fecha = new Date().toISOString().split('T')[0];
    
    // Obtener la configuración
    const configuracion = await Configuracion.findOne();
    const simbolo_moneda = configuracion?.simbolo_moneda || 'S/';
    
    // Verificar si hay una configuración válida
    if (!configuracion) {
      console.warn('No se encontró configuración del sistema');
    }
    
    // Buscar apertura del día que no esté cerrada
    const apertura = await Caja.findOne({
      where: {
        fecha: fecha,
        estado: 'apertura'
      }
    });

    // Buscar cierre del día
    const cierre = await Caja.findOne({
      where: {
        fecha: fecha,
        estado: 'cierre'
      }
    });

    // Calcular saldo actual si la caja está abierta
    let saldoActual = 0;
    let movimientos = [];
    
    if (apertura) {
      movimientos = await Caja.findAll({
        where: {
          fecha: fecha,
          estado: {
            [Op.notIn]: ['cerrada', 'cierre']
          }
        },
        order: [['id_table_cajas', 'ASC']]
      });

      // Calculamos el saldo según los movimientos
      saldoActual = movimientos.reduce((acc, mov) => {
        const monto = Number(mov.monto);
        if (isNaN(monto)) return acc;
        
        switch(mov.estado) {
          case 'apertura':
          case 'ingreso':
            return acc + monto;
          case 'egreso':
            return acc - monto;
          default:
            return acc;
        }
      }, 0);
    }

    const estaAbierta = !!apertura && !cierre;

    res.json({
      success: true,
      data: {
        estaAbierta: estaAbierta,
        apertura: apertura ? {
          fecha: apertura.fecha,
          monto: Number(apertura.monto)
        } : null,
        saldoActual: Number(saldoActual),
        simbolo_moneda: simbolo_moneda,
        movimientos: movimientos.map(m => ({
          id: m.id_table_cajas,
          fecha: m.fecha,
          monto: Number(m.monto),
          estado: m.estado,
          referencia: m.referencia
        }))
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
