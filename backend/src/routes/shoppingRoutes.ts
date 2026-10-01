import { Router } from 'express';
import { getShopping, createShopping, updateShopping, deleteShopping } from '../controllers/shoppingController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getShopping);
router.post('/', createShopping);
router.put('/:id', updateShopping);
router.delete('/:id', deleteShopping);

export default router;
