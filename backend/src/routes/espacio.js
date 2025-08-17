import { Router } from 'express';
import { agregarEspacio, modificarEspacio, liberarEspacio, consultarEspacios, obtenerEspacio, eliminarEspacio } from '../controllers/espacioController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/espacios:
 *   post:
 *     summary: Agregar espacio
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Espacio agregado
 */
router.post('/', authenticateToken, agregarEspacio);

/**
 * @swagger
 * /api/espacios/{id}:
 *   put:
 *     summary: Modificar espacio
 *     tags: [Espacios]
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
 *         description: Espacio modificado
 */
router.put('/:id', authenticateToken, modificarEspacio);

/**
 * @swagger
 * /api/espacios/{id}/liberar:
 *   put:
 *     summary: Liberar espacio
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Espacio liberado
 */
router.put('/:id/liberar', authenticateToken, liberarEspacio);

/**
 * @swagger
 * /api/espacios:
 *   get:
 *     summary: Consultar espacios
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de espacios
 */
router.get('/', authenticateToken, consultarEspacios);

/**
 * @swagger
 * /api/espacios/{id}:
 *   get:
 *     summary: Obtener espacio por ID
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Espacio encontrado
 *       404:
 *         description: Espacio no encontrado
 */
router.get('/:id', authenticateToken, obtenerEspacio);

/**
 * @swagger
 * /api/espacios/{id}:
 *   delete:
 *     summary: Eliminar espacio
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Espacio eliminado
 *       404:
 *         description: Espacio no encontrado
 */
router.delete('/:id', authenticateToken, eliminarEspacio);

export default router;
