import { Router } from 'express';
import { acercaDelPrograma } from '../controllers/aboutController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Información del programa
 *     tags: [About]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del sistema
 *       401:
 *         description: No autorizado - Token inválido
 */
router.get('/', authenticateToken, acercaDelPrograma);

export default router;
