import { Router } from 'express';
import * as negociosController from '../controllers/negocios.controller.js';
import { autenticar, autorizar } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas de este archivo requieren sesión y rol superadmin
router.use(autenticar, autorizar('superadmin'));

router.get('/', negociosController.listar);
router.get('/:id', negociosController.obtener);
router.post('/', negociosController.crear);
router.patch('/:id', negociosController.actualizar);
router.delete('/:id', negociosController.desactivar);

export default router;
