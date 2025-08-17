import Factura from '../models/Factura.js';

export async function registrarVenta(req, res) {
  try {
    const nuevaFactura = await Factura.create(req.body);
    res.status(201).json(nuevaFactura);
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar venta', error: err.message });
  }
}

export async function consultarVentas(req, res) {
  try {
    const ventas = await Factura.findAll();
    res.json(ventas);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar ventas', error: err.message });
  }
}
