import { Router } from 'express';
import { getRecipes, getRecipeSuggestions } from '../controllers/recipeController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', getRecipes);
router.get('/suggestions', authenticateJWT, getRecipeSuggestions);

export default router;
