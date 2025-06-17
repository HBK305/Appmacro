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
    <div className="export-section">
      <h3 className="export-title">Export Meal Plan</h3>
      
      {/* Export Options */}
      <div className="export-options">
        <h4 className="export-subtitle">Export Options</h4>
        <div className="export-checkboxes">
          <label className="export-checkbox-label">
            <input
              type="checkbox"
              checked={exportOptions.includeMacros}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeMacros: e.target.checked }))}
              className="export-checkbox"
            />
            <span className="export-checkbox-text">Include Macros</span>
          </label>
          <label className="export-checkbox-label">
            <input
              type="checkbox"
              checked={exportOptions.includeCalories}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeCalories: e.target.checked }))}
              className="export-checkbox"
            />
            <span className="export-checkbox-text">Include Calories</span>
          </label>
          <label className="export-checkbox-label">
            <input
              type="checkbox"
              checked={exportOptions.includeNotes}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
              className="export-checkbox"
            />
            <span className="export-checkbox-text">Include Notes</span>
          </label>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button
          onClick={() => handleExport('text')}
          className="export-button export-button-text"
        >
          <span className="export-button-icon">📄</span>
          Export as Text
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="export-button export-button-csv"
        >
          <span className="export-button-icon">📊</span>
          Export as CSV
        </button>
        <button
          onClick={() => handleExport('json')}
          className="export-button export-button-json"
        >
          <span className="export-button-icon">⚡</span>
          Export as JSON
        </button>
      </div>
    </div>
  );
} 