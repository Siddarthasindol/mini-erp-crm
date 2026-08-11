import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate } from '../middleware/authMiddleware';
import { authorize } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateMiddleware';
import { validateProduct } from '../validators/productValidators';

const router = Router();

router.use(authenticate);

// All roles can view products & low stock list
router.get('/low-stock', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), productController.getLowStockProducts);
router.get('/', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), productController.getProducts);
router.get('/:id', authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), productController.getProductById);
router.get('/:id/stock-movements', authorize('ADMIN', 'WAREHOUSE'), productController.getProductStockMovements);

// ADMIN & WAREHOUSE can create, edit, delete products
router.post('/', authorize('ADMIN', 'WAREHOUSE'), validateBody(validateProduct), productController.createProduct);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), validateBody(validateProduct), productController.updateProduct);
router.delete('/:id', authorize('ADMIN', 'WAREHOUSE'), productController.deleteProduct);

export default router;
