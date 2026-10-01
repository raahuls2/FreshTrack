import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { name: 'asc' }
    });

    const parsedRecipes = recipes.map(r => ({
      ...r,
      ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients
    }));

    return res.json(parsedRecipes);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch recipes', error: error.message });
  }
};

export const getRecipeSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Fetch user's pantry ingredients
    const userFoods = await prisma.foodItem.findMany({
      where: { userId },
      select: { name: true, category: true, quantity: true, unit: true, expiryDate: true }
    });

    const userPantryItemNames = userFoods.map(f => f.name.toLowerCase().trim());

    // Fetch all available recipes
    const recipes = await prisma.recipe.findMany();

    const suggestions = recipes.map(recipe => {
      let rawIngredients: string[] = [];
      try {
        rawIngredients = JSON.parse(recipe.ingredients);
      } catch (e) {
        rawIngredients = [recipe.ingredients];
      }

      const matchingIngredients: string[] = [];
      const missingIngredients: string[] = [];

      rawIngredients.forEach(ing => {
        const cleanIng = ing.toLowerCase().trim();
        // Check if any user pantry item name matches or contains the ingredient keyword
        const isMatch = userPantryItemNames.some(pantryName => 
          pantryName.includes(cleanIng) || cleanIng.includes(pantryName)
        );

        if (isMatch) {
          matchingIngredients.push(ing);
        } else {
          missingIngredients.push(ing);
        }
      });

      const total = rawIngredients.length;
      const matchCount = matchingIngredients.length;
      const matchScore = total > 0 ? (matchCount / total) * 100 : 0;

      return {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        image: recipe.image,
        instructions: recipe.instructions,
        ingredients: rawIngredients,
        matchingIngredients,
        missingIngredients,
        matchScore: Math.round(matchScore)
      };
    });

    // Sort by highest match count, then match score
    suggestions.sort((a, b) => b.matchingIngredients.length - a.matchingIngredients.length || b.matchScore - a.matchScore);

    return res.json(suggestions);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to get recipe suggestions', error: error.message });
  }
};
