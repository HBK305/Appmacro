import React, { useState } from 'react';
import './App.css';
import { UserProfileForm } from './components/UserProfileForm';
import ProgressTracker from './components/ProgressTracker';
import MealPlanExport from './components/MealPlanExport';
import { type MealRecommendation } from './utils/foodRecommendations';
import { type MealTiming } from './utils/nutritionCalculations';

function App() {
  const [mealPlan, setMealPlan] = useState<MealRecommendation[]>([]);
  const [mealTiming, setMealTiming] = useState<MealTiming[]>([]);
  const [showProgress, setShowProgress] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Nutrition Planner</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {showProgress ? 'Show Meal Plan' : 'Show Progress'}
            </button>
          </div>

          {showProgress ? (
            <ProgressTracker
              targetCalories={mealPlan.reduce((sum, meal) => sum + meal.totalCalories, 0)}
              targetMacros={mealPlan.reduce(
                (sum, meal) => ({
                  protein: sum.protein + meal.totalMacros.protein,
                  carbs: sum.carbs + meal.totalMacros.carbs,
                  fats: sum.fats + meal.totalMacros.fats
                }),
                { protein: 0, carbs: 0, fats: 0 }
              )}
            />
          ) : (
            <>
              <UserProfileForm
                onMealPlanGenerated={(plan: MealRecommendation[], timing: MealTiming[]) => {
                  setMealPlan(plan);
                  setMealTiming(timing);
                }}
              />
              {mealPlan.length > 0 && (
                <MealPlanExport mealPlan={mealPlan} mealTiming={mealTiming} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
