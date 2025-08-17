import Espacio from '../models/Espacio.js';

export async function agregarEspacio(req, res) {
  try {
    const { zona, estado } = req.body;
    
    const espacioData = {
      zona: zona,
      estado: estado || 'libre',
    };
    
    const nuevoEspacio = await Espacio.create(espacioData);
    res.status(201).json({ 
      success: true, 
      data: nuevoEspacio, 
      message: 'Espacio creado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al agregar espacio', 
      error: err.message 
    });
  }
}

export async function modificarEspacio(req, res) {
  try {
    const { id } = req.params;
    const { zona, estado } = req.body;
    
    const espacioData = {
      zona: zona,
      estado: estado,
    };
    
    await Espacio.update(espacioData, { where: { id_espacio: id } });
    res.json({ 
      success: true, 
      message: 'Espacio modificado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al modificar espacio', 
      error: err.message 
    });
  }
}

export async function liberarEspacio(req, res) {
  try {
    const { id } = req.params;
    await Espacio.update({ estado: 'libre' }, { where: { id_espacio: id } });
    res.json({ 
      success: true, 
      message: 'Espacio liberado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al liberar espacio', 
      error: err.message 
    });
  }
}

export async function consultarEspacios(req, res) {
  try {
    const espacios = await Espacio.findAll();
    res.json({ 
      success: true, 
      data: espacios, 
      message: 'Espacios consultados exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al consultar espacios', 
      error: err.message 
    });
  }
}

export async function obtenerEspacio(req, res) {
  try {
    const { id } = req.params;
    const espacio = await Espacio.findByPk(id);
    
    if (!espacio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Espacio no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      data: espacio, 
      message: 'Espacio encontrado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener espacio', 
      error: err.message 
    });
  }
}

export async function eliminarEspacio(req, res) {
  try {
    const { id } = req.params;
    const espacio = await Espacio.findByPk(id);
    
    if (!espacio) {
      return res.status(404).json({ 
        success: false, 
        message: 'Espacio no encontrado' 
      });
    }
    
    await Espacio.destroy({ where: { id_espacio: id } });
    res.json({ 
      success: true, 
      message: 'Espacio eliminado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar espacio', 
      error: err.message 
    });
  }
}
