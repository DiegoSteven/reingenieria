import Configuracion from '../models/Configuracion.js';

export async function consultarConfiguracion(req, res) {
  try {
    const config = await Configuracion.findAll();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar configuración', error: err.message });
  }
}

export async function modificarConfiguracion(req, res) {
  try {
    const { id } = req.params;
    await Configuracion.update(req.body, { where: { id_configuracion: id } });
    res.json({ message: 'Configuración modificada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al modificar configuración', error: err.message });
  }
}
