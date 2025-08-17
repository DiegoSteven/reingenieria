import Usuario from '../models/Usuario.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Función auxiliar para crear un usuario de prueba
export async function register(req, res) {
  try {
    const { usuario, pasword, tipo = 'Empleado', nombres, apellidos, dni, telefono } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ where: { usuario } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pasword, salt);

    // Crear el usuario
    const user = await Usuario.create({
      usuario,
      pasword: hashedPassword,
      tipo,
      nombres,
      apellidos,
      dni,
      telefono
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: user.id,
        usuario: user.usuario,
        tipo: user.tipo
      }
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function login(req, res) {
  const { usuario, pasword } = req.body;
  try {
    console.log('Intento de login para usuario:', usuario);
    const user = await Usuario.findOne({ where: { usuario: usuario } });
    
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    console.log('Usuario encontrado, verificando contraseña');
    // Añadimos logs para debuggear el proceso de comparación
    console.log('Password recibido:', pasword);
    console.log('Password almacenado (hash):', user.pasword);
    
    const valid = await bcrypt.compare(pasword, user.pasword);
    console.log('Resultado de validación:', valid);
    
    if (!valid) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña incorrecta' 
      });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está configurado');
      throw new Error('JWT_SECRET no está configurado');
    }
    
    console.log('Generando token para usuario:', user.id);
    const token = jwt.sign(
      { 
        id: user.id, 
        tipo: user.tipo,
        usuario: user.usuario 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '8h' }
    );
    
    return res.json({ 
      success: true,
      token, 
      user: { 
        id: user.id, 
        username: user.usuario, 
        role: user.tipo 
      } 
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function logout(req, res) {
  // El logout en JWT es del lado del cliente (basta con borrar el token)
  res.json({ message: 'Sesión cerrada' });
}
