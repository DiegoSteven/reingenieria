import Cliente from '../models/Cliente.js';

export async function agregarCliente(req, res) {
  try {
    const { nombres, apellidos, dni, telefono, email, direccion } = req.body;
    
    // Mapear los campos del frontend a los campos del modelo
    const clienteData = {
      Nombre_Cliente: nombres,
      Apellido_Cliente: apellidos,
      ruc_Cliente: dni,
      telefono_Cliente: telefono,
      correo_Cliente: email,
      direccion_Cliente: direccion,
    };
    
    const nuevoCliente = await Cliente.create(clienteData);
    res.status(201).json({ 
      success: true, 
      data: nuevoCliente, 
      message: 'Cliente creado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al agregar cliente', 
      error: err.message 
    });
  }
}

export async function modificarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nombres, apellidos, dni, telefono, email, direccion } = req.body;
    
    // Mapear los campos del frontend a los campos del modelo
    const clienteData = {
      Nombre_Cliente: nombres,
      Apellido_Cliente: apellidos,
      ruc_Cliente: dni,
      telefono_Cliente: telefono,
      correo_Cliente: email,
      direccion_Cliente: direccion,
    };
    
    await Cliente.update(clienteData, { where: { idCliente: id } });
    res.json({ 
      success: true, 
      message: 'Cliente modificado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al modificar cliente', 
      error: err.message 
    });
  }
}

export async function consultarClientes(req, res) {
  try {
    const clientes = await Cliente.findAll();
    res.json({ 
      success: true, 
      data: clientes, 
      message: 'Clientes consultados exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al consultar clientes', 
      error: err.message 
    });
  }
}

export async function obtenerCliente(req, res) {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      data: cliente, 
      message: 'Cliente encontrado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener cliente', 
      error: err.message 
    });
  }
}

export async function eliminarCliente(req, res) {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }
    
    await Cliente.destroy({ where: { idCliente: id } });
    res.json({ 
      success: true, 
      message: 'Cliente eliminado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar cliente', 
      error: err.message 
    });
  }
}
