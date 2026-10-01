import React, { useEffect, useState } from 'react';
import { Utensils, CheckCircle2, AlertCircle, Sparkles, BookOpen, X, Flame } from 'lucide-react';
import { api } from '../services/api';
import { Recipe, FoodItem } from '../types';

export const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userFoods, setUserFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const fetchRecipesAndFoods = async () => {
    try {
      setIsLoading(true);
      const [recipeData, foodData] = await Promise.all([
        api.getRecipeSuggestions(),
        api.getFoods()
      ]);
      setRecipes(recipeData);
      setUserFoods(foodData);
    } catch (err) {
      console.error('Failed to load recipe suggestions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesAndFoods();
  }, []);

  // Check if any matching ingredient in a recipe matches a pantry item that is EXPIRING_SOON or EXPIRED
  const usesExpiringIngredient = (recipe: Recipe): boolean => {
    if (!recipe.matchingIngredients) return false;
    const expiringPantryNames = userFoods
      .filter(f => f.status === 'EXPIRING_SOON' || f.status === 'EXPIRED')
      .map(f => f.name.toLowerCase().trim());

    return recipe.matchingIngredients.some(ing => {
      const clean = ing.toLowerCase().trim();
      return expiringPantryNames.some(p => p.includes(clean) || clean.includes(p));
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Utensils className="w-6 h-6 text-emerald-600" />
          <span>Smart Pantry Recipes</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Recipes matched directly against food you currently have in stock.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const matching = recipe.matchingIngredients || [];
            const missing = recipe.missingIngredients || [];
            const matchScore = recipe.matchScore !== undefined ? recipe.matchScore : 0;
            const hasExpiring = usesExpiringIngredient(recipe);

            return (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image banner with match score badge */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Match % score badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                      <span className="text-xs font-black text-emerald-700 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{matchScore}% Match</span>
                      </span>
                    </div>

                    {/* Expiring soon callout badge */}
                    {hasExpiring && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-sm">
                        <Flame className="w-3 h-3 fill-white" />
                        <span>Uses expiring food!</span>
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {recipe.category}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                      {recipe.name}
                    </h3>

                    {/* Matching Ingredients */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        In Pantry ({matching.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {matching.map((ing) => (
                          <span
                            key={ing}
                            className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{ing}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Ingredients */}
                    {missing.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Missing ({missing.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {missing.map((ing) => (
                            <span
                              key={ing}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md"
                            >
                              + {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>View Recipe Steps</span>
                  </span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No recipe matches yet. Add more ingredients to your pantry!
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="relative h-48 bg-slate-100">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                aria-label="Close modal"
                className="absolute top-3 right-3 p-1.5 bg-white/90 text-slate-700 rounded-full shadow hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">{selectedRecipe.name}</h2>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ingredients</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {selectedRecipe.ingredients.map((ing) => {
                    const isMatch = selectedRecipe.matchingIngredients?.includes(ing);
                    return (
                      <div
                        key={ing}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 ${
                          isMatch ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isMatch ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span>{ing}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Instructions</h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedRecipe.instructions}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
