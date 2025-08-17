import Configuracion from '../models/Configuracion.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function consultarConfiguracion(req, res) {
  try {
    let config = await Configuracion.findOne();
    
    if (!config) {
      // Si no existe configuración, crear una por defecto
      config = await Configuracion.create({
        nombre_empresa: 'Mi Empresa',
        impuesto: '18',
        moneda: 'Soles',
        simbolo_moneda: 'S/',
        direccion: 'Dirección por defecto',
        ruc: '00000000000',
        celular: '000000000',
        dimension_x: '100',
        dimension_y: '100',
        cantidad_ceros_boleta: '6',
        cantidad_ceros_factura: '6'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (err) {
    console.error('Error al consultar configuración:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al consultar configuración',
      error: err.message 
    });
  }
}

export async function modificarConfiguracion(req, res) {
  try {
    let config = await Configuracion.findOne();
    
    if (!config) {
      config = await Configuracion.create(req.body);
    } else {
      await config.update(req.body);
    }

    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: config
    });
  } catch (err) {
    console.error('Error al modificar configuración:', err);
    res.status(500).json({
      success: false,
      message: 'Error al modificar configuración',
      error: err.message
    });
  }
}

export async function actualizarLogo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha enviado ninguna imagen'
      });
    }

    const logoDir = path.join(__dirname, '..', '..', 'logo');
    
    // Crear directorio de logos si no existe
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    
    // Construir rutas
    const sourceFile = req.file.path;
    const targetFile = path.join(logoDir, 'logo' + path.extname(req.file.originalname));

    try {
      // Copiar el archivo usando streams para evitar problemas con sistemas de archivos diferentes
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(sourceFile);
        const writeStream = fs.createWriteStream(targetFile);
        
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', resolve);
        
        readStream.pipe(writeStream);
      });

      // Eliminar el archivo temporal
      fs.unlinkSync(sourceFile);

      res.json({
        success: true,
        message: 'Logo actualizado correctamente'
      });
    } catch (err) {
      console.error('Error al mover el archivo:', err);
      res.status(500).json({
        success: false,
        message: 'Error al guardar el logo',
        error: err.message
      });
    }
  } catch (err) {
    console.error('Error al actualizar logo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el logo',
      error: err.message
    });
  }
}

export async function obtenerLogo(req, res) {
  try {
    // Buscar el logo con diferentes extensiones
    const extensiones = ['.jpg', '.jpeg', '.png'];
    let logoPath = null;
    
    for (const ext of extensiones) {
      const testPath = path.join(__dirname, '..', '..', 'logo', 'logo' + ext);
      if (fs.existsSync(testPath)) {
        logoPath = testPath;
        break;
      }
    }
    
    if (logoPath) {
      // Configurar headers apropiados
      const ext = path.extname(logoPath).toLowerCase();
      const mimeType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
      }[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Enviar el archivo
      res.sendFile(logoPath);
    } else {
      res.status(404).json({
        success: false,
        message: 'Logo no encontrado'
      });
    }
  } catch (err) {
    console.error('Error al obtener logo:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el logo',
      error: err.message
    });
  }
}
