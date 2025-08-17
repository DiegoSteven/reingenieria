import { Router } from 'express';
import { acercaDelPrograma } from '../controllers/aboutController.js';

const router = Router();

/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Información del programa
 *     tags: [About]
 *     responses:
 *       200:
 *         description: Información del sistema
 */
router.get('/', acercaDelPrograma);

export default router;
