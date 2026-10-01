import { Router } from 'express';
import { getFoods, createFood, getFoodById, updateFood, deleteFood } from '../controllers/foodController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getFoods);
router.post('/', createFood);
router.get('/:id', getFoodById);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

export default router;
