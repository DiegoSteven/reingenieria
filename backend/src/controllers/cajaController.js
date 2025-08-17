import Caja from '../models/Caja.js';

export async function consultarCaja(req, res) {
  try {
    const caja = await Caja.findAll();
    res.json(caja);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar caja', error: err.message });
  }
}
