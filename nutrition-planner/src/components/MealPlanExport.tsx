import React, { useState } from 'react';
import { type MealRecommendation } from '../utils/foodRecommendations';
import { type MealTiming } from '../utils/nutritionCalculations';
import { exportToText, exportToCSV, exportToJSON, downloadFile } from '../utils/mealPlanExport';

interface MealPlanExportProps {
  mealPlan: MealRecommendation[];
  mealTiming: MealTiming[];
}

export default function MealPlanExport({ mealPlan, mealTiming }: MealPlanExportProps) {
  const [exportOptions, setExportOptions] = useState({
    includeMacros: true,
    includeCalories: true,
    includeNotes: true
  });

  const handleExport = (format: 'text' | 'csv' | 'json') => {
    const date = new Date().toISOString().split('T')[0];
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'text':
        content = exportToText(mealPlan, mealTiming, exportOptions);
        filename = `meal-plan-${date}.txt`;
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = exportToCSV(mealPlan, mealTiming);
        filename = `meal-plan-${date}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = exportToJSON(mealPlan, mealTiming);
        filename = `meal-plan-${date}.json`;
        mimeType = 'application/json';
        break;
    }

    downloadFile(content, filename, mimeType);
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h3 className="text-lg font-semibold mb-4">Export Meal Plan</h3>
      
      {/* Export Options */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Export Options</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeMacros}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeMacros: e.target.checked }))}
              className="mr-2"
            />
            Include Macros
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeCalories}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeCalories: e.target.checked }))}
              className="mr-2"
            />
            Include Calories
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={exportOptions.includeNotes}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
              className="mr-2"
            />
            Include Notes
          </label>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleExport('text')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Export as Text
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Export as CSV
        </button>
        <button
          onClick={() => handleExport('json')}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Export as JSON
        </button>
      </div>
    </div>
  );
} 