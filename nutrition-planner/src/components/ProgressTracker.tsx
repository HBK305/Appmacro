import React, { useState, useEffect } from 'react';
import { calculateProgressStats, formatProgressStats, validateProgressEntry, type DailyProgress } from '../utils/progressTracking';

interface ProgressTrackerProps {
  targetCalories: number;
  targetMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function ProgressTracker({ targetCalories, targetMacros }: ProgressTrackerProps) {
  const [progressData, setProgressData] = useState<DailyProgress[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<DailyProgress>>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    caloriesConsumed: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fats: 0
    },
    waterIntake: 0,
    mealsCompleted: 0,
    notes: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [stats, setStats] = useState<string>('');

  useEffect(() => {
    // Load saved progress data
    const savedData = localStorage.getItem('progressData');
    if (savedData) {
      setProgressData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    // Calculate and update stats when progress data changes
    if (progressData.length > 0) {
      try {
        const progressStats = calculateProgressStats(progressData);
        setStats(formatProgressStats(progressStats));
      } catch (error) {
        console.error('Error calculating progress stats:', error);
      }
    }
  }, [progressData]);

  const handleInputChange = (field: string, value: string | number) => {
    setCurrentEntry((prev: Partial<DailyProgress>) => {
      if (field.startsWith('macros.')) {
        const macroField = field.split('.')[1];
        return {
          ...prev,
          macros: {
            protein: prev.macros?.protein || 0,
            carbs: prev.macros?.carbs || 0,
            fats: prev.macros?.fats || 0,
            [macroField]: Number(value)
          }
        };
      }
      return {
        ...prev,
        [field]: Number(value)
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateProgressEntry(currentEntry);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newEntry = currentEntry as DailyProgress;
    const newProgressData = [...progressData, newEntry];
    setProgressData(newProgressData);
    localStorage.setItem('progressData', JSON.stringify(newProgressData));
    
    // Reset form
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      caloriesConsumed: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fats: 0
      },
      waterIntake: 0,
      mealsCompleted: 0,
      notes: ''
    });
    setErrors([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Daily Progress</h2>

        {/* Progress Stats */}
        {stats && (
          <div className="mb-8 p-4 bg-gray-50 rounded">
            <h3 className="text-lg font-semibold mb-4">Progress Summary</h3>
            <pre className="whitespace-pre-wrap font-mono text-sm">{stats}</pre>
          </div>
        )}

        {/* Progress Entry Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentEntry.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calories Consumed
              </label>
              <input
                type="number"
                value={currentEntry.caloriesConsumed || ''}
                onChange={(e) => handleInputChange('caloriesConsumed', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={currentEntry.macros?.protein || ''}
                onChange={(e) => handleInputChange('macros.protein', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                value={currentEntry.macros?.carbs || ''}
                onChange={(e) => handleInputChange('macros.carbs', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                value={currentEntry.macros?.fats || ''}
                onChange={(e) => handleInputChange('macros.fats', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Water Intake (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentEntry.waterIntake || ''}
                onChange={(e) => handleInputChange('waterIntake', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meals Completed
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={currentEntry.mealsCompleted || ''}
                onChange={(e) => handleInputChange('mealsCompleted', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={currentEntry.notes || ''}
              onChange={(e) => setCurrentEntry((prev: Partial<DailyProgress>) => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 text-red-500">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Progress
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 