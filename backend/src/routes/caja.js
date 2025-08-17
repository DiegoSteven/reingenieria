import { Router } from 'express';
import { 
  consultarCaja, 
  registrarMovimiento,
  abrirCaja,
  cerrarCaja,
  obtenerEstadoCaja
} from '../controllers/cajaController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/caja:
 *   get:
 *     summary: Consultar caja
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *         description: Fecha para filtrar movimientos (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estado de caja y movimientos
 *   post:
 *     summary: Registrar movimiento en caja
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - estado
 *             properties:
 *               monto:
 *                 type: number
 *               estado:
 *                 type: string
 *                 enum: [ingreso, egreso]
 *               referencia:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movimiento registrado exitosamente
 */
router.get('/', authenticateToken, consultarCaja);
router.post('/', authenticateToken, registrarMovimiento);

/**
 * @swagger
 * /api/caja/abrir:
 *   post:
 *     summary: Abrir caja
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - montoInicial
 *             properties:
 *               montoInicial:
 *                 type: number
 *     responses:
 *       200:
 *         description: Caja abierta exitosamente
 */
router.post('/abrir', authenticateToken, abrirCaja);

/**
 * @swagger
 * /api/caja/cerrar:
 *   post:
 *     summary: Cerrar caja
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caja cerrada exitosamente
 */
router.post('/cerrar', authenticateToken, cerrarCaja);

/**
 * @swagger
 * /api/caja/estado:
 *   get:
 *     summary: Obtener estado actual de la caja
 *     tags: [Caja]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado actual de la caja
 */
router.get('/estado', authenticateToken, obtenerEstadoCaja);

export default router;
