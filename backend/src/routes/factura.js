import { Router } from 'express';
import { registrarVenta, consultarVentas, obtenerPDF, imprimirFactura } from '../controllers/facturaController.js';
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

/**
 * @swagger
 * /api/facturas/{id}/pdf:
 *   get:
 *     summary: Obtener PDF de la factura
 *     tags: [Facturas]
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
 *         description: PDF de la factura
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/pdf', authenticateToken, obtenerPDF);

/**
 * @swagger
 * /api/facturas/{id}/print:
 *   post:
 *     summary: Imprimir factura
 *     tags: [Facturas]
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
 *         description: Factura enviada a imprimir
 */
router.post('/:id/print', authenticateToken, imprimirFactura);

export default router;
