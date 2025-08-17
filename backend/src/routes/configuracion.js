import { Router } from 'express';
import { consultarConfiguracion, modificarConfiguracion } from '../controllers/configuracionController.js';
import { authenticateToken } from '../middlewares/auth.js';

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
 * /api/configuracion/{id}:
 *   put:
 *     summary: Modificar configuración
 *     tags: [Configuracion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
router.put('/:id', authenticateToken, modificarConfiguracion);

export default router;
