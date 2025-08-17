import { Router } from 'express';
import { consultarCaja } from '../controllers/cajaController.js';
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
 *     responses:
 *       200:
 *         description: Estado de caja
 */
router.get('/', authenticateToken, consultarCaja);

export default router;
