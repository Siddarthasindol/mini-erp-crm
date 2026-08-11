import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateBody } from '../middleware/validateMiddleware';
import { validateLogin } from '../validators/authValidators';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', validateBody(validateLogin), authController.login);
router.get('/me', authenticate, authController.getMe);

export default router;
