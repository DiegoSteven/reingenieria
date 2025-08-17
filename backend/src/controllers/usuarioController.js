import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

export async function crearUsuario(req, res) {
  try {
    const { usuario, pasword, tipo, nombres, apellidos, dni, telefono } = req.body;
    const hashedPassword = await bcrypt.hash(pasword, 10);
    const nuevoUsuario = await Usuario.create({
      usuario,
      pasword: hashedPassword,
      tipo,
      nombres,
      apellidos,
      dni,
      telefono,
    });
    res.status(201).json({ success: true, data: nuevoUsuario, message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear usuario', error: err.message });
  }
}

export async function modificarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { usuario, tipo, nombres, apellidos, dni, telefono } = req.body;
    const usuarioModificado = await Usuario.update({ usuario, tipo, nombres, apellidos, dni, telefono }, { where: { id } });
    res.json({ success: true, data: usuarioModificado, message: 'Usuario modificado exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al modificar usuario', error: err.message });
  }
}

export async function cambiarPassword(req, res) {
  try {
    const { id } = req.params;
    const { pasword } = req.body;
    const hashedPassword = await bcrypt.hash(pasword, 10);
    await Usuario.update({ pasword: hashedPassword }, { where: { id } });
    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al cambiar contraseña', error: err.message });
  }
}

export async function consultarUsuarios(req, res) {
  try {
    const usuarios = await Usuario.findAll();
    res.json({ success: true, data: usuarios, message: 'Usuarios consultados exitosamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al consultar usuarios', error: err.message });
  }
}
