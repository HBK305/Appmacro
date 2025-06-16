import React, { useState } from 'react';
import { calculateCalories, calculateMacros, calculateMealTiming, MacroDistribution, MealTiming } from '../utils/nutritionCalculations';
import { generateDailyMealPlan, MealRecommendation } from '../utils/foodRecommendations';
// Miami Vice styled form - no external UI components needed

interface UserProfileData {
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  trainingSessions: number;
  goal: string;
  dietaryRestrictions: string[];
  mealCount: number;
  wakeTime: string;
  sleepTime: string;
}

interface UserProfileFormProps {
  onMealPlanGenerated?: (plan: MealRecommendation[], timing: MealTiming[]) => void;
}

// Helper functions for mapping
function getActivityLevel(sessions: number): number {
  if (sessions <= 2) return 1.2;
  if (sessions <= 4) return 1.375;
  if (sessions <= 5) return 1.55;
  if (sessions <= 6) return 1.725;
  return 1.9;
}

function getGoal(goal: string): 'muscle_gain' | 'fat_loss' | 'maintenance' {
  if (goal.toLowerCase().includes('muscle')) return 'muscle_gain';
  if (goal.toLowerCase().includes('fat')) return 'fat_loss';
  return 'maintenance';
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ onMealPlanGenerated }) => {
  const [formData, setFormData] = useState<UserProfileData>({
    age: 0,
    gender: 'male',
    weight: 0,
    height: 0,
    trainingSessions: 3,
    goal: '',
    dietaryRestrictions: [],
    mealCount: 3,
    wakeTime: '08:00',
    sleepTime: '22:00',
  });

  const [calories, setCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ protein: number; carbs: number; fat: number } | null>(null);
  const [mealTiming, setMealTiming] = useState<MealTiming | null>(null);
  const [mealPlan, setMealPlan] = useState<MealRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'height' || name === 'trainingSessions' || name === 'mealCount'
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form data
    if (!formData.age || !formData.weight || !formData.height) {
      setError('Please fill in all required fields (age, weight, height)');
      return;
    }

    if (formData.age < 15 || formData.age > 100) {
      setError('Age must be between 15 and 100');
      return;
    }

    if (formData.weight < 30 || formData.weight > 300) {
      setError('Weight must be between 30 and 300 kg');
      return;
    }

    if (formData.height < 100 || formData.height > 250) {
      setError('Height must be between 100 and 250 cm');
      return;
    }

    try {
      console.log('Form Data:', formData); // Debug log

      // Map values
      const activityLevel = getActivityLevel(Number(formData.trainingSessions));
      const goal = getGoal(formData.goal);

      // Calculate calories
      const dailyCalories = calculateCalories(
        formData.weight,
        formData.height,
        formData.age,
        formData.gender,
        activityLevel
      );
      console.log('Daily Calories:', dailyCalories); // Debug log

      if (isNaN(dailyCalories)) {
        throw new Error('Invalid calorie calculation');
      }

      setCalories(dailyCalories);

      // Calculate macros
      const macroDistribution = calculateMacros(
        dailyCalories,
        formData.weight,
        goal,
        activityLevel
      );
      console.log('Macro Distribution:', macroDistribution); // Debug log

      if (isNaN(macroDistribution.protein) || isNaN(macroDistribution.carbs) || isNaN(macroDistribution.fats)) {
        throw new Error('Invalid macro calculation');
      }

      setMacros({
        protein: macroDistribution.protein,
        carbs: macroDistribution.carbs,
        fat: macroDistribution.fats
      });

      // Calculate meal timing
      const timing = calculateMealTiming(
        dailyCalories,
        macroDistribution,
        {
          days: ['monday', 'wednesday', 'friday'],
          time: '18:00'
        },
        formData.wakeTime,
        formData.sleepTime
      );
      console.log('Meal Timing:', timing); // Debug log

      if (!timing || !timing[0]) {
        throw new Error('Invalid meal timing calculation');
      }

      setMealTiming(timing[0]);

      // Generate meal recommendations
      const recommendations = generateDailyMealPlan(
        dailyCalories,
        macroDistribution,
        formData.mealCount,
        formData.dietaryRestrictions
      );
      console.log('Meal Recommendations:', recommendations); // Debug log

      if (!recommendations || recommendations.length === 0) {
        throw new Error('Failed to generate meal recommendations');
      }

      setMealPlan(recommendations);
      setSuccess('Meal plan generated successfully!');
      if (onMealPlanGenerated) {
        onMealPlanGenerated(recommendations, timing);
      }
    } catch (err) {
      console.error('Error details:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred while calculating your nutrition plan');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="miami-grid">
              <div className="space-y-2">
                <label className="miami-label" htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="miami-input w-full"
                  placeholder="Enter your age"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="miami-label" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                  className="miami-select w-full"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="miami-label" htmlFor="weight">Weight (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={handleChange}
                  className="miami-input w-full"
                  placeholder="Enter your weight"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="miami-label" htmlFor="height">Height (cm)</label>
                <input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height || ''}
                  onChange={handleChange}
                  className="miami-input w-full"
                  placeholder="Enter your height"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Activity & Goals</h2>
            
            <div className="miami-grid">
              <div className="space-y-2 mb-12">
                <label className="miami-label" htmlFor="trainingSessions">Training Sessions per Week</label>
                <select
                  id="trainingSessions"
                  name="trainingSessions"
                  value={formData.trainingSessions.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, trainingSessions: parseInt(e.target.value) }))}
                  className="miami-select w-full"
                  required
                >
                  <option value="">Select sessions</option>
                  <option value="0">0 sessions</option>
                  <option value="1">1 session</option>
                  <option value="2">2 sessions</option>
                  <option value="3">3 sessions</option>
                  <option value="4">4 sessions</option>
                  <option value="5">5 sessions</option>
                  <option value="6">6 sessions</option>
                </select>
              </div>

              <div className="space-y-2 mb-12">
                <label className="miami-label" htmlFor="goal">Fitness Goal</label>
                <select
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  className="miami-select w-full"
                  required
                >
                  <option value="">Select goal</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section mt-12">
            <h2 className="section-title">Daily Schedule</h2>
            
            <div className="miami-grid">
              <div className="space-y-2">
                <label className="miami-label" htmlFor="wakeTime">Wake Time</label>
                <input
                  id="wakeTime"
                  name="wakeTime"
                  type="time"
                  value={formData.wakeTime}
                  onChange={handleChange}
                  className="miami-input w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="miami-label" htmlFor="sleepTime">Sleep Time</label>
                <input
                  id="sleepTime"
                  name="sleepTime"
                  type="time"
                  value={formData.sleepTime}
                  onChange={handleChange}
                  className="miami-input w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="miami-label" htmlFor="mealCount">Number of Meals</label>
                <select
                  id="mealCount"
                  name="mealCount"
                  value={formData.mealCount.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, mealCount: parseInt(e.target.value) }))}
                  className="miami-select w-full"
                  required
                >
                  <option value="">Select number of meals</option>
                  <option value="3">3 Meals</option>
                  <option value="4">4 Meals</option>
                  <option value="5">5 Meals</option>
                  <option value="6">6 Meals</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button type="submit" className="miami-button w-full">
            Generate Meal Plan
          </button>
        </form>

        {calories && macros && mealTiming && mealPlan.length > 0 && (
          <div className="results-section">
            <h2 className="section-title">Your Meal Plan</h2>
            
            <div className="results-card">
              <h3 className="text-lg font-semibold mb-4 text-miami-blue">Daily Targets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-miami-pink">{calories}</div>
                  <div className="text-sm opacity-80">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-miami-blue">{macros.protein}g</div>
                  <div className="text-sm opacity-80">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-miami-purple">{macros.carbs}g</div>
                  <div className="text-sm opacity-80">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-miami-orange">{macros.fat}g</div>
                  <div className="text-sm opacity-80">Fat</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-miami-blue">Meal Schedule</h3>
              {mealTiming.meals.map((meal, index) => (
                <div key={index} className="results-card">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-miami-pink">{meal.name}</p>
                      <p className="text-miami-blue">{meal.time}</p>
                    </div>
                    <p className="text-sm opacity-80">{meal.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-miami-blue">Recommended Foods</h3>
              {mealPlan.map((meal, index) => (
                <div key={index} className="results-card">
                  <h4 className="font-medium mb-4 text-miami-pink">Meal {index + 1}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-miami-orange">{meal.totalCalories}</div>
                      <div className="text-xs opacity-80">kcal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-miami-blue">{meal.totalMacros.protein}g</div>
                      <div className="text-xs opacity-80">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-miami-purple">{meal.totalMacros.carbs}g</div>
                      <div className="text-xs opacity-80">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-miami-pink">{meal.totalMacros.fats}g</div>
                      <div className="text-xs opacity-80">Fats</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {meal.foods.map((food, foodIndex) => (
                      <li key={foodIndex} className="flex justify-between items-center py-2 border-b border-white border-opacity-10">
                        <span className="text-miami-light">{food.food.name}</span>
                        <span className="text-miami-blue font-medium">{food.servings} servings</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 