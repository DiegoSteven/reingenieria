import { Router } from 'express';
import { consultarConfiguracion, modificarConfiguracion, actualizarLogo, obtenerLogo } from '../controllers/configuracionController.js';
import { authenticateToken } from '../middlewares/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Crear ruta absoluta al directorio temporal
    const dir = path.join(__dirname, '..', '..', 'tmp');
    // Asegurarse de que el directorio existe
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, 'logo' + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB límite
  },
  fileFilter: (req, file, cb) => {
    // Validar tipo de archivo
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Solo se permiten archivos de imagen JPG o PNG'), false);
    }
    cb(null, true);
  }
}).single('logo');

// Middleware para manejar errores de multer
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Error de multer
      return res.status(400).json({
        success: false,
        message: 'Error al subir el archivo',
        error: err.message
      });
    } else if (err) {
      // Otro tipo de error
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

const router = Router();

/**
 * @swagger
 * /api/configuracion:
 *   get:
 *     summary: Consultar configuración
 *     tags: [Configuracion]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración actual
 */
router.get('/', authenticateToken, consultarConfiguracion);

/**
 * @swagger
 * /api/configuracion:
 *   put:
 *     summary: Modificar configuración
 *     tags: [Configuracion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuración modificada
 */
router.put('/', authenticateToken, modificarConfiguracion);

/**
 * @swagger
 * /api/configuracion/logo:
 *   get:
 *     summary: Obtener el logo actual
 *     tags: [Configuracion]
 *     responses:
 *       200:
 *         description: Logo de la empresa
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/logo', obtenerLogo);

/**
 * @swagger
 * /api/configuracion/logo:
 *   post:
 *     summary: Actualizar el logo
 *     tags: [Configuracion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado
 */
router.post('/logo', authenticateToken, uploadMiddleware, actualizarLogo);

export default router;
