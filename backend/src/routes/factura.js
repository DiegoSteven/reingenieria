import { Router } from 'express';
import { registrarVenta, consultarVentas } from '../controllers/facturaController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/facturas:
 *   post:
 *     summary: Registrar venta
 *     tags: [Facturas]
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
 *         description: Venta registrada
 */
router.post('/', authenticateToken, registrarVenta);

/**
 * @swagger
 * /api/facturas:
 *   get:
 *     summary: Consultar ventas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get('/', authenticateToken, consultarVentas);

export default router;
