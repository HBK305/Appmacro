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
    <div className="min-h-screen">
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="brand-container">
            <h1 className="brand-title">Glowbit</h1>
            <p className="brand-slogan">Eat like you mean it</p>
          </div>
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="miami-button max-w-xs"
          >
            {showProgress ? 'Show Meal Plan' : 'Show Progress'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-6">
        <div className="glass-container">
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
