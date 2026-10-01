import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getDashboard);

export default router;
