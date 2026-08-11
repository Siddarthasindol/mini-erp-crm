import { Router } from 'express';
import * as challanController from '../controllers/challanController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { validateCreateChallan } from '../validators/challanValidators';

const router = Router();

router.use(authenticate);

// List & get: ADMIN, SALES, WAREHOUSE, ACCOUNTS
router.get('/', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), challanController.getChallans);
router.get('/:id', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), challanController.getChallanById);

// Create DRAFT: ADMIN, SALES
router.post('/', authorize('ADMIN', 'SALES'), validateBody(validateCreateChallan), challanController.createChallan);

// Update DRAFT: ADMIN, SALES
router.put('/:id', authorize('ADMIN', 'SALES'), challanController.updateChallan);

// Confirm: ADMIN, SALES, ACCOUNTS, WAREHOUSE
router.post('/:id/confirm', authorize('ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'), challanController.confirmChallan);

// Cancel: ADMIN, SALES
router.post('/:id/cancel', authorize('ADMIN', 'SALES'), challanController.cancelChallan);

export default router;
