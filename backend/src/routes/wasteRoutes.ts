import { Router } from 'express';
import { getWaste, createWaste } from '../controllers/wasteController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getWaste);
router.post('/', createWaste);

export default router;
