import { Router } from 'express';
import * as stockController from '../controllers/stockController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { validateStockMovement } from '../validators/stockValidators';

const router = Router();

router.use(authenticate);

// ADMIN & WAREHOUSE can view and create stock movements
router.get('/', authorize('ADMIN', 'WAREHOUSE'), stockController.getStockMovements);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), validateBody(validateStockMovement), stockController.createStockMovement);

export default router;
