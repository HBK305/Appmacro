import React, { useState, useEffect } from 'react';
import { UserProfileForm } from './UserProfileForm';
import ProgressTracker from './ProgressTracker';
import MealPlanExport from './MealPlanExport';
import { type MealRecommendation } from '../utils/foodRecommendations';
import { type MealTiming } from '../utils/nutritionCalculations';

export function CommandSensor() {
  const [mealPlan, setMealPlan] = useState<MealRecommendation[]>([]);
  const [mealTiming, setMealTiming] = useState<MealTiming[]>([]);
  const [activeModule, setActiveModule] = useState<'nutrition' | 'progress' | 'export'>('nutrition');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Simulate system initialization
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="command-sensor-init">
        <div className="command-sensor-init-content">
          <div className="command-sensor-logo">
            <div className="command-sensor-logo-text">GLOWBIT</div>
            <div className="command-sensor-logo-subtitle">COMMAND SENSOR</div>
          </div>
          <div className="command-sensor-init-status">
            <div className="command-sensor-init-bar">
              <div className="command-sensor-init-fill" />
            </div>
            <div className="command-sensor-init-text">
              INITIALIZING NEURAL INTERFACE...
            </div>
          </div>
        </div>
        <div className="command-sensor-init-bg">
          <div className="command-sensor-grid" />
          <div className="command-sensor-scanlines" />
          <div className="command-sensor-noise" />
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'nutrition' as const,
      name: 'NUTRITION',
      icon: '🧬',
      description: 'Macro Analysis & Meal Planning',
      status: 'ACTIVE'
    },
    {
      id: 'progress' as const,
      name: 'PROGRESS',
      icon: '📊',
      description: 'Performance Tracking',
      status: mealPlan.length > 0 ? 'READY' : 'STANDBY'
    },
    {
      id: 'export' as const,
      name: 'EXPORT',
      icon: '💾',
      description: 'Data Export & Sharing',
      status: mealPlan.length > 0 ? 'READY' : 'STANDBY'
    }
  ];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'nutrition':
        return (
          <UserProfileForm
            onMealPlanGenerated={(plan: MealRecommendation[], timing: MealTiming[]) => {
              setMealPlan(plan);
              setMealTiming(timing);
            }}
          />
        );
      case 'progress':
        return (
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
        );
      case 'export':
        return mealPlan.length > 0 ? (
          <MealPlanExport mealPlan={mealPlan} mealTiming={mealTiming} />
        ) : (
          <div className="command-sensor-empty">
            <div className="command-sensor-empty-icon">💾</div>
            <div className="command-sensor-empty-title">NO DATA TO EXPORT</div>
            <div className="command-sensor-empty-subtitle">
              Generate a meal plan first to access export functions
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="command-sensor">
      <div className="command-sensor-header">
        <div className="command-sensor-brand">
          <div className="command-sensor-brand-title">GLOWBIT</div>
          <div className="command-sensor-brand-subtitle">COMMAND SENSOR v2.1</div>
        </div>
        <div className="command-sensor-status">
          <div className="command-sensor-status-indicator active" />
          <span>NEURAL LINK ESTABLISHED</span>
        </div>
      </div>

      <div className="command-sensor-nav">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`command-sensor-module ${
              activeModule === module.id ? 'active' : ''
            } ${module.status.toLowerCase()}`}
          >
            <div className="command-sensor-module-icon">{module.icon}</div>
            <div className="command-sensor-module-content">
              <div className="command-sensor-module-name">{module.name}</div>
              <div className="command-sensor-module-description">{module.description}</div>
            </div>
            <div className="command-sensor-module-status">{module.status}</div>
          </button>
        ))}
      </div>

      <div className="command-sensor-main">
        <div className="command-sensor-content">
          {renderActiveModule()}
        </div>
      </div>

      {/* Background effects */}
      <div className="command-sensor-bg">
        <div className="command-sensor-grid-overlay" />
        <div className="command-sensor-scanlines" />
        <div className="command-sensor-chromatic" />
      </div>
    </div>
  );
} 