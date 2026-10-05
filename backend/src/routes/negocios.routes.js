import { Router } from 'express';
import * as negociosController from '../controllers/negocios.controller.js';

const router = Router();

router.get('/', negociosController.listar);
router.get('/:id', negociosController.obtener);
router.post('/', negociosController.crear);
router.patch('/:id', negociosController.actualizar);
router.delete('/:id', negociosController.desactivar);

export default router;
