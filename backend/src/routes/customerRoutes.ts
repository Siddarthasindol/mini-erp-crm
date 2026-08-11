import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { validateCustomer, validateFollowUp } from '../validators/customerValidators';

const router = Router();

router.use(authenticate);

// All roles can view customer lists and details
router.get('/', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), customerController.getCustomers);
router.get('/:id', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), customerController.getCustomerById);

// ADMIN, SALES, ACCOUNTS can create/edit customers
router.post('/', authorize('ADMIN', 'SALES', 'ACCOUNTS'), validateBody(validateCustomer), customerController.createCustomer);
router.put('/:id', authorize('ADMIN', 'SALES', 'ACCOUNTS'), validateBody(validateCustomer), customerController.updateCustomer);

// ADMIN only can delete customer
router.delete('/:id', authorize('ADMIN'), customerController.deleteCustomer);

// Follow-ups: ADMIN, SALES, ACCOUNTS
router.post('/:id/followups', authorize('ADMIN', 'SALES', 'ACCOUNTS'), validateBody(validateFollowUp), customerController.addFollowUp);
router.get('/:id/followups', authorize('ADMIN', 'SALES', 'ACCOUNTS'), customerController.getFollowUps);

export default router;
