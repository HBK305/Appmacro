import React, { useState, useEffect } from 'react';
import { calculateCalories, calculateMacros, calculateMealTiming, MealTiming } from '../utils/nutritionCalculations';
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
  sport: string;
  bodyFatPercentage: number;
  trainingExperienceMonths: number;
}

interface UserProfileFormProps {
  onMealPlanGenerated?: (plan: MealRecommendation[], timing: MealTiming[]) => void;
}

// Loading Animation Component
const GlowbitLoader: React.FC<{ isVisible: boolean; onComplete: () => void }> = ({ isVisible, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    "Initializing Glowbit Engine...",
    "Analyzing biometric data...",
    "Calculating optimal macros...",
    "Generating meal recommendations...",
    "Finalizing nutrition plan..."
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentMessage(0);
      return;
    }

    const duration = 2500; // 2.5 seconds total
    const steps = 100;
    const stepDuration = duration / steps;

    let currentStep = 0;
    let messageIndex = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      setProgress(currentStep);

      // Update message based on progress
      const newMessageIndex = Math.floor((currentStep / steps) * messages.length);
      if (newMessageIndex !== messageIndex && newMessageIndex < messages.length) {
        messageIndex = newMessageIndex;
        setCurrentMessage(messageIndex);
      }

      if (currentStep >= steps) {
        clearInterval(progressInterval);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, stepDuration);

    return () => clearInterval(progressInterval);
  }, [isVisible, onComplete, messages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glowbit-loader">
        <div className="loader-container">
          {/* Retro Grid Background */}
          <div className="loader-grid"></div>
          
          {/* Main Loading Content */}
          <div className="loader-content">
            <div className="loader-title">
              <span className="glitch-text">GLOWBIT</span>
            </div>
            
            <div className="loader-message">
              <span className="flickering-text">{messages[currentMessage]}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="progress-glow"></div>
              </div>
              <div className="progress-text">{progress}%</div>
            </div>
            
            {/* Decorative Elements */}
            <div className="loader-decorations">
              <div className="decoration-line decoration-line-1"></div>
              <div className="decoration-line decoration-line-2"></div>
              <div className="decoration-dot decoration-dot-1"></div>
              <div className="decoration-dot decoration-dot-2"></div>
              <div className="decoration-dot decoration-dot-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for mapping
function getActivityLevel(sessions: number, sport: string = '', experienceMonths: number = 0): number {
  let baseLevel = 1.2;
  
  // Base activity level from training sessions
  if (sessions <= 2) baseLevel = 1.2;
  else if (sessions <= 4) baseLevel = 1.375;
  else if (sessions <= 5) baseLevel = 1.55;
  else if (sessions <= 6) baseLevel = 1.725;
  else baseLevel = 1.9;
  
  // Sport-specific adjustments
  const highIntensitySports = ['boxing', 'mma', 'crossfit', 'swimming', 'cycling', 'running', 'triathlon'];
  const moderateIntensitySports = ['basketball', 'soccer', 'tennis', 'volleyball', 'martial arts'];
  const lowIntensitySports = ['yoga', 'pilates', 'walking', 'golf'];
  
  const sportLower = sport.toLowerCase();
  let sportMultiplier = 1.0;
  
  if (highIntensitySports.some(s => sportLower.includes(s))) {
    sportMultiplier = 1.1;
  } else if (moderateIntensitySports.some(s => sportLower.includes(s))) {
    sportMultiplier = 1.05;
  } else if (lowIntensitySports.some(s => sportLower.includes(s))) {
    sportMultiplier = 0.95;
  }
  
  // Experience adjustment (more experienced athletes tend to have higher metabolic efficiency)
  let experienceMultiplier = 1.0;
  if (experienceMonths > 24) { // 2+ years
    experienceMultiplier = 1.05;
  } else if (experienceMonths > 12) { // 1+ years
    experienceMultiplier = 1.02;
  }
  
  return Math.min(baseLevel * sportMultiplier * experienceMultiplier, 2.2); // Cap at 2.2
}

function getGoal(goal: string): 'muscle_gain' | 'fat_loss' | 'maintenance' {
  if (goal.toLowerCase().includes('muscle')) return 'muscle_gain';
  if (goal.toLowerCase().includes('fat')) return 'fat_loss';
  return 'maintenance';
}



// Helper function to add emojis to ingredient names
function addFoodEmoji(foodName: string): string {
  const name = foodName.toLowerCase();
  
  // Proteins
  if (name.includes('chicken')) return '🐔 ' + foodName;
  if (name.includes('beef') || name.includes('steak')) return '🥩 ' + foodName;
  if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) return '🐟 ' + foodName;
  if (name.includes('egg')) return '🥚 ' + foodName;
  if (name.includes('turkey')) return '🦃 ' + foodName;
  if (name.includes('pork')) return '🐷 ' + foodName;
  if (name.includes('shrimp') || name.includes('prawn')) return '🦐 ' + foodName;
  
  // Vegetables
  if (name.includes('broccoli')) return '🥦 ' + foodName;
  if (name.includes('spinach') || name.includes('lettuce') || name.includes('kale')) return '🥬 ' + foodName;
  if (name.includes('carrot')) return '🥕 ' + foodName;
  if (name.includes('tomato')) return '🍅 ' + foodName;
  if (name.includes('pepper') || name.includes('bell')) return '🫑 ' + foodName;
  if (name.includes('onion')) return '🧅 ' + foodName;
  if (name.includes('garlic')) return '🧄 ' + foodName;
  if (name.includes('cucumber')) return '🥒 ' + foodName;
  if (name.includes('corn')) return '🌽 ' + foodName;
  if (name.includes('mushroom')) return '🍄 ' + foodName;
  
  // Fruits
  if (name.includes('apple')) return '🍎 ' + foodName;
  if (name.includes('banana')) return '🍌 ' + foodName;
  if (name.includes('orange')) return '🍊 ' + foodName;
  if (name.includes('berry') || name.includes('strawberry') || name.includes('blueberry')) return '🫐 ' + foodName;
  if (name.includes('avocado')) return '🥑 ' + foodName;
  if (name.includes('lemon') || name.includes('lime')) return '🍋 ' + foodName;
  if (name.includes('grape')) return '🍇 ' + foodName;
  if (name.includes('peach')) return '🍑 ' + foodName;
  
  // Grains & Starches
  if (name.includes('rice')) return '🍚 ' + foodName;
  if (name.includes('bread') || name.includes('toast')) return '🍞 ' + foodName;
  if (name.includes('pasta')) return '🍝 ' + foodName;
  if (name.includes('potato') && name.includes('sweet')) return '🍠 ' + foodName;
  if (name.includes('potato')) return '🥔 ' + foodName;
  if (name.includes('oats') || name.includes('oatmeal')) return '🥣 ' + foodName;
  if (name.includes('quinoa')) return '🌾 ' + foodName;
  
  // Nuts & Seeds
  if (name.includes('almond')) return '🌰 ' + foodName;
  if (name.includes('walnut') || name.includes('pecan')) return '🥜 ' + foodName;
  if (name.includes('peanut')) return '🥜 ' + foodName;
  if (name.includes('seed')) return '🌱 ' + foodName;
  
  // Dairy & Alternatives
  if (name.includes('milk')) return '🥛 ' + foodName;
  if (name.includes('cheese')) return '🧀 ' + foodName;
  if (name.includes('yogurt') || name.includes('yoghurt')) return '🥛 ' + foodName;
  
  // Oils & Fats
  if (name.includes('oil') || name.includes('olive')) return '🫒 ' + foodName;
  if (name.includes('butter')) return '🧈 ' + foodName;
  
  // Beverages
  if (name.includes('water')) return '💧 ' + foodName;
  if (name.includes('coffee')) return '☕ ' + foodName;
  if (name.includes('tea')) return '🍵 ' + foodName;
  
  // Default - use a generic food emoji
  return '🍽️ ' + foodName;
}

// Activity Selector Component
const ActivitySelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const activityCategories = [
    {
      name: 'Cardio',
      icon: '🏃',
      activities: ['Running', 'Cycling', 'Swimming', 'Walking']
    },
    {
      name: 'Strength / Muscu',
      icon: '💪',
      activities: ['Weight Training', 'CrossFit', 'Powerlifting']
    },
    {
      name: 'Individual Sports',
      icon: '🥋',
      activities: ['Tennis', 'Golf', 'Martial Arts', 'Yoga', 'MMA', 'Pilates', 'Boxing']
    },
    {
      name: 'Team Sports',
      icon: '⚽',
      activities: ['Soccer', 'Basketball', 'Volleyball', 'Rugby']
    },
    {
      name: 'Endurance / Hybrid',
      icon: '🏊‍♂️',
      activities: ['Triathlon']
    }
  ];

  const handleActivitySelect = (activity: string) => {
    onChange(activity);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.activity-selector')) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="activity-selector">
      <button
        type="button"
        className={`activity-selector-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || 'Select your primary activity'}</span>
        <span className="activity-selector-arrow">▼</span>
      </button>
      
      <div className={`activity-menu ${isOpen ? 'open' : ''}`}>
        {activityCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="activity-category">
            <div className="activity-category-button">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="activity-category-icon">{category.icon}</span>
                <span>{category.name}</span>
              </div>
              <span className="activity-category-arrow">▶</span>
            </div>
            
            <div className="activity-submenu">
              {category.activities.map((activity, activityIndex) => (
                <button
                  key={activityIndex}
                  type="button"
                  className={`activity-option ${value === activity ? 'selected' : ''}`}
                  onClick={() => handleActivitySelect(activity)}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



// AI Insight Generation Function
async function generateAIInsight(
  formData: UserProfileData,
  calories: number,
  macros: { protein: number; carbs: number; fat: number },
  mealPlan: MealRecommendation[]
): Promise<string> {
  // Simulate AI analysis with realistic insights based on the data
  const { age, gender, goal, trainingSessions, sport, bodyFatPercentage, trainingExperienceMonths } = formData;
  
  // Create a realistic AI insight based on the user's profile
  const insights = [];
  
  // Goal-based insights
  if (goal.toLowerCase().includes('muscle')) {
    insights.push(`This meal plan prioritizes high protein intake (${macros.protein}g) to support muscle growth and recovery`);
  } else if (goal.toLowerCase().includes('fat')) {
    insights.push(`This plan creates a moderate caloric deficit while maintaining adequate protein (${macros.protein}g) to preserve muscle mass during fat loss`);
  } else {
    insights.push(`This balanced meal plan maintains your current weight while optimizing nutrient distribution for overall health`);
  }
  
  // Activity-based insights
  if (trainingSessions >= 5) {
    insights.push(`complex carbohydrates (${macros.carbs}g) are strategically distributed to fuel your intensive training schedule`);
  } else if (trainingSessions >= 3) {
    insights.push(`moderate carbohydrate intake (${macros.carbs}g) provides sustained energy for your regular workout routine`);
  } else {
    insights.push(`lower carbohydrate content (${macros.carbs}g) aligns with your moderate activity level`);
  }
  
  // Age and gender considerations
  if (age > 40) {
    insights.push(`nutrient timing is optimized for enhanced recovery and metabolism support`);
  }
  
  if (gender === 'female' && goal.toLowerCase().includes('muscle')) {
    insights.push(`protein distribution across meals supports lean muscle development while accounting for hormonal considerations`);
  }
  
  // Sport-specific insights
  if (sport) {
    const sportLower = sport.toLowerCase();
    if (['boxing', 'mma', 'crossfit'].some(s => sportLower.includes(s))) {
      insights.push(`meal timing is optimized for high-intensity ${sport} training with emphasis on post-workout recovery`);
    } else if (['running', 'cycling', 'swimming'].some(s => sportLower.includes(s))) {
      insights.push(`carbohydrate distribution supports endurance demands of ${sport} while maintaining lean body mass`);
    } else if (['yoga', 'pilates'].some(s => sportLower.includes(s))) {
      insights.push(`balanced nutrition complements your ${sport} practice with focus on flexibility and recovery`);
    }
  }
  
  // Body composition insights
  if (bodyFatPercentage <= 12 && gender === 'male') {
    insights.push(`your lean physique (${bodyFatPercentage}% body fat) requires precise nutrition timing to maintain muscle mass`);
  } else if (bodyFatPercentage <= 18 && gender === 'female') {
    insights.push(`your athletic body composition (${bodyFatPercentage}% body fat) benefits from strategic nutrient timing`);
  } else if (bodyFatPercentage >= 25) {
    insights.push(`nutrition plan includes moderate caloric adjustments to support healthy body composition changes`);
  }
  
  // Training experience insights
  if (trainingExperienceMonths >= 24) {
    insights.push(`your ${Math.floor(trainingExperienceMonths/12)} years of training experience allows for advanced nutrition periodization`);
  } else if (trainingExperienceMonths >= 6) {
    insights.push(`nutrition plan accounts for your developing training adaptation over ${trainingExperienceMonths} months`);
  } else if (trainingExperienceMonths < 6) {
    insights.push(`beginner-friendly approach focuses on establishing consistent nutrition habits alongside your new training routine`);
  }
  
  // Food variety insight
  const uniqueFoods = new Set(mealPlan.flatMap(meal => meal.foods.map(f => f.food.category))).size;
  if (uniqueFoods >= 4) {
    insights.push(`diverse food sources ensure comprehensive micronutrient coverage`);
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  return insights.join(', and ') + '.';
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
    sport: '',
    bodyFatPercentage: 0,
    trainingExperienceMonths: 0,
  });

  const [calories, setCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ protein: number; carbs: number; fat: number } | null>(null);
  const [mealTiming, setMealTiming] = useState<MealTiming | null>(null);
  const [mealPlan, setMealPlan] = useState<MealRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canAutoCalculate, setCanAutoCalculate] = useState<boolean>(false);
  const [pendingResults, setPendingResults] = useState<{
    calories: number;
    macros: { protein: number; carbs: number; fat: number };
    timing: MealTiming;
    plan: MealRecommendation[];
  } | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false);

  // Ref for the results section to enable smooth scrolling
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Check if all required fields are filled for auto-calculation
  const checkFormCompletion = (data: UserProfileData): boolean => {
    return !!(
      data.age > 0 &&
      data.weight > 0 &&
      data.height > 0 &&
      data.goal &&
      data.wakeTime &&
      data.sleepTime &&
      data.sport &&
      data.bodyFatPercentage > 0 &&
      data.trainingExperienceMonths >= 0 &&
      data.age >= 15 && data.age <= 100 &&
      data.weight >= 30 && data.weight <= 300 &&
      data.height >= 100 && data.height <= 250 &&
      data.bodyFatPercentage >= 5 && data.bodyFatPercentage <= 50
    );
  };

  // Form completion check (for UI feedback only, no auto-calculation)
  useEffect(() => {
    const isComplete = checkFormCompletion(formData);
    setCanAutoCalculate(isComplete);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'height' || name === 'trainingSessions' || name === 'mealCount' || name === 'bodyFatPercentage' || name === 'trainingExperienceMonths'
        ? parseFloat(value)
        : value
    }));
    
    // Clear previous results when form changes
    if (calories || pendingResults) {
      setCalories(null);
      setMacros(null);
      setMealTiming(null);
      setMealPlan([]);
      setSuccess(null);
      setPendingResults(null);
      setShowResults(false);
      setAiInsight(null);
      setIsGeneratingInsight(false);
    }
  };

  const handleCalculation = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Clear previous results immediately when starting new calculation
    setCalories(null);
    setMacros(null);
    setMealTiming(null);
    setMealPlan([]);
    setShowResults(false);
    setAiInsight(null);
    setIsGeneratingInsight(false);

    // Validate form data
    if (!formData.age || !formData.weight || !formData.height || !formData.sport || !formData.bodyFatPercentage) {
      setError('Please fill in all required fields (age, weight, height, sport, body fat percentage)');
      setIsLoading(false);
      return;
    }

    if (formData.age < 15 || formData.age > 100) {
      setError('Age must be between 15 and 100');
      setIsLoading(false);
      return;
    }

    if (formData.weight < 30 || formData.weight > 300) {
      setError('Weight must be between 30 and 300 kg');
      setIsLoading(false);
      return;
    }

    if (formData.height < 100 || formData.height > 250) {
      setError('Height must be between 100 and 250 cm');
      setIsLoading(false);
      return;
    }

    if (formData.bodyFatPercentage < 5 || formData.bodyFatPercentage > 50) {
      setError('Body fat percentage must be between 5% and 50%');
      setIsLoading(false);
      return;
    }

    if (!formData.goal) {
      setError('Please select a fitness goal');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Form Data:', formData); // Debug log

      // Map values
      const activityLevel = getActivityLevel(Number(formData.trainingSessions), formData.sport, formData.trainingExperienceMonths);
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

      // Store the calculated results temporarily - don't set state yet
      // The loading animation completion will handle setting these
      const results = {
        calories: dailyCalories,
        macros: {
          protein: macroDistribution.protein,
          carbs: macroDistribution.carbs,
          fat: macroDistribution.fats
        },
        timing: timing[0],
        plan: recommendations
      };
      console.log('Setting pending results:', results); // Debug log
      setPendingResults(results);
      
      // Start AI insight generation in parallel
      setIsGeneratingInsight(true);
      generateAIInsight(formData, dailyCalories, results.macros, recommendations)
        .then(insight => {
          setAiInsight(insight);
          setIsGeneratingInsight(false);
        })
        .catch(error => {
          console.error('AI insight generation failed:', error);
          setAiInsight('Unable to generate AI insights at this time.');
          setIsGeneratingInsight(false);
        });
      
      if (onMealPlanGenerated) {
        onMealPlanGenerated(recommendations, timing);
      }
    } catch (err) {
      console.error('Error details:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred while calculating your nutrition plan');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCalculation();
  };

  const handleLoadingComplete = () => {
    console.log('Loading complete, pendingResults:', pendingResults); // Debug log
    setIsLoading(false);
    
    // Apply the calculated results after animation completes
    if (pendingResults) {
      console.log('Applying pending results...'); // Debug log
      setCalories(pendingResults.calories);
      setMacros(pendingResults.macros);
      setMealTiming(pendingResults.timing);
      setMealPlan(pendingResults.plan);
      setSuccess('Meal plan generated successfully!');
      setShowResults(true);
      
      // Clean up pending results
      setPendingResults(null);
      
      // Small delay to ensure the DOM is updated, then scroll
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } else {
      console.log('No pending results found'); // Debug log
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Loading Animation Overlay */}
      <GlowbitLoader isVisible={isLoading} onComplete={handleLoadingComplete} />
      
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
                <div className="option-stepper">
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      const options = ['male', 'female'];
                      const currentIndex = options.indexOf(formData.gender);
                      const newIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
                      setFormData(prev => ({ ...prev, gender: options[newIndex] as 'male' | 'female' }));
                    }}
                  >
                    ◀
                  </button>
                  <input
                    type="text"
                    className="option-display"
                    value={formData.gender ? (formData.gender === 'male' ? 'Male' : 'Female') : 'Select gender'}
                    readOnly
                  />
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      const options = ['male', 'female'];
                      const currentIndex = options.indexOf(formData.gender);
                      const newIndex = currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
                      setFormData(prev => ({ ...prev, gender: options[newIndex] as 'male' | 'female' }));
                    }}
                  >
                    ▶
                  </button>
                </div>
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
                <div className="number-stepper">
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      if (formData.trainingSessions > 0) {
                        setFormData(prev => ({ ...prev, trainingSessions: prev.trainingSessions - 1 }));
                      }
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    className="stepper-display"
                    value={formData.trainingSessions ? `${formData.trainingSessions} session${formData.trainingSessions !== 1 ? 's' : ''}` : 'Select sessions'}
                    readOnly
                  />
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      if (formData.trainingSessions < 7) {
                        setFormData(prev => ({ ...prev, trainingSessions: prev.trainingSessions + 1 }));
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-12">
                <label className="miami-label" htmlFor="goal">Fitness Goal</label>
                <div className="option-stepper">
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      const options = ['Muscle Gain', 'Fat Loss', 'Maintenance'];
                      const currentIndex = options.indexOf(formData.goal);
                      const newIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
                      setFormData(prev => ({ ...prev, goal: options[newIndex] }));
                    }}
                  >
                    ◀
                  </button>
                  <input
                    type="text"
                    className="option-display"
                    value={formData.goal || 'Select goal'}
                    readOnly
                  />
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      const options = ['Muscle Gain', 'Fat Loss', 'Maintenance'];
                      const currentIndex = options.indexOf(formData.goal);
                      const newIndex = currentIndex >= options.length - 1 ? 0 : currentIndex + 1;
                      setFormData(prev => ({ ...prev, goal: options[newIndex] }));
                    }}
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Training Profile</h2>
            
            <div className="miami-grid">
              <div className="space-y-2">
                <label className="miami-label" htmlFor="sport">Primary Sport/Activity</label>
                <ActivitySelector
                  value={formData.sport}
                  onChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="miami-label" htmlFor="bodyFatPercentage">
                  Body Fat Percentage (%)
                  <span className="text-xs text-miami-blue block mt-1">
                    Men: 10-15% (athletic), 15-20% (fit), 20%+ (average)
                    <br />
                    Women: 16-20% (athletic), 20-25% (fit), 25%+ (average)
                  </span>
                </label>
                <input
                  id="bodyFatPercentage"
                  name="bodyFatPercentage"
                  type="number"
                  min="5"
                  max="50"
                  step="0.5"
                  value={formData.bodyFatPercentage || ''}
                  onChange={handleChange}
                  className="miami-input w-full"
                  placeholder="Enter body fat %"
                  required
                />
              </div>

              <div className="space-y-2 mb-12">
                <label className="miami-label" htmlFor="trainingExperienceMonths">Training Experience</label>
                <div className="number-stepper">
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      if (formData.trainingExperienceMonths > 0) {
                        setFormData(prev => ({ ...prev, trainingExperienceMonths: prev.trainingExperienceMonths - 1 }));
                      }
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    className="stepper-display"
                    value={formData.trainingExperienceMonths >= 12 
                      ? `${Math.floor(formData.trainingExperienceMonths / 12)} year${Math.floor(formData.trainingExperienceMonths / 12) !== 1 ? 's' : ''} ${formData.trainingExperienceMonths % 12 > 0 ? `${formData.trainingExperienceMonths % 12} month${formData.trainingExperienceMonths % 12 !== 1 ? 's' : ''}` : ''}`
                      : formData.trainingExperienceMonths > 0 
                        ? `${formData.trainingExperienceMonths} month${formData.trainingExperienceMonths !== 1 ? 's' : ''}`
                        : 'Select experience'
                    }
                    readOnly
                  />
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      if (formData.trainingExperienceMonths < 120) { // Cap at 10 years
                        setFormData(prev => ({ ...prev, trainingExperienceMonths: prev.trainingExperienceMonths + 1 }));
                      }
                    }}
                  >
                    +
                  </button>
                </div>
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
                <div className="number-stepper">
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      if (formData.mealCount > 3) {
                        setFormData(prev => ({ ...prev, mealCount: prev.mealCount - 1 }));
                      }
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    className="stepper-display"
                    value={formData.mealCount ? `${formData.mealCount} Meals` : 'Select meals'}
                    readOnly
                  />
                  <button
                    type="button"
                    className="stepper-button"
                    onClick={() => {
                      if (formData.mealCount < 6) {
                        setFormData(prev => ({ ...prev, mealCount: prev.mealCount + 1 }));
                      }
                    }}
                  >
                    +
                  </button>
                </div>
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

          <div className="button-container">
            <button 
              type="submit" 
              className={`miami-button w-full ${isLoading ? 'button-loading' : ''} ${canAutoCalculate ? 'button-ready' : ''}`}
              disabled={isLoading || !canAutoCalculate}
            >
              {isLoading ? (
                <span className="button-loading-content">
                  <span className="loading-spinner"></span>
                  Processing...
                </span>
              ) : calories ? (
                'Recalculate Plan'
              ) : canAutoCalculate ? (
                'Generate Meal Plan'
              ) : (
                'Complete Form to Generate Plan'
              )}
            </button>
          </div>
        </form>

        {calories && macros && mealTiming && mealPlan.length > 0 && (
          <div 
            ref={resultsRef}
            className={`results-section ${showResults ? 'results-animate-in' : ''}`}
          >
            <h2 className="section-title">Your Meal Plan</h2>
            
            <div className="results-card">
              <h3 className="text-lg font-semibold mb-4 text-miami-blue">Daily Targets</h3>
              <div className="nutrition-macros">
                <div className="macro-item macro-calories">
                  <div className="macro-value">{calories}</div>
                  <div className="macro-label">Calories</div>
                </div>
                <div className="macro-item macro-protein">
                  <div className="macro-value">{macros.protein}g</div>
                  <div className="macro-label">Protein</div>
                </div>
                <div className="macro-item macro-carbs">
                  <div className="macro-value">{macros.carbs}g</div>
                  <div className="macro-label">Carbs</div>
                </div>
                <div className="macro-item macro-fats">
                  <div className="macro-value">{macros.fat}g</div>
                  <div className="macro-label">Fats</div>
                </div>
              </div>
            </div>

            {/* AI Insight Box */}
            <div className="ai-insight-box">
              <div className="ai-insight-title">AI Nutrition Insights</div>
              {isGeneratingInsight ? (
                <div className="ai-loading">
                  <span>Analyzing your profile</span>
                  <div className="ai-loading-dots">
                    <div className="ai-loading-dot"></div>
                    <div className="ai-loading-dot"></div>
                    <div className="ai-loading-dot"></div>
                  </div>
                </div>
              ) : aiInsight ? (
                <div className="ai-insight-text">{aiInsight}</div>
              ) : (
                <div className="ai-insight-text">Generating personalized insights...</div>
              )}
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
                  <div className="nutrition-macros mb-4">
                    <div className="macro-item macro-calories">
                      <div className="macro-value">{meal.totalCalories}</div>
                      <div className="macro-label">kcal</div>
                    </div>
                    <div className="macro-item macro-protein">
                      <div className="macro-value">{meal.totalMacros.protein}g</div>
                      <div className="macro-label">Protein</div>
                    </div>
                    <div className="macro-item macro-carbs">
                      <div className="macro-value">{meal.totalMacros.carbs}g</div>
                      <div className="macro-label">Carbs</div>
                    </div>
                    <div className="macro-item macro-fats">
                      <div className="macro-value">{meal.totalMacros.fats}g</div>
                      <div className="macro-label">Fats</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {meal.foods.map((food, foodIndex) => (
                      <div key={foodIndex} className="food-item">
                        <div className="food-name">{addFoodEmoji(food.food.name)}</div>
                        <div className="food-serving-info">
                          <div className="food-grams">
                            {Math.round(food.servings * 100)}g
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 