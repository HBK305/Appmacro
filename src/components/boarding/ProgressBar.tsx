import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="boarding-progress-container">
      <div className="boarding-progress-track">
        <div 
          className="boarding-progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div className="boarding-progress-glow" />
      </div>
      <div className="boarding-progress-steps">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`boarding-progress-step ${
              index + 1 <= currentStep ? 'active' : ''
            }`}
          >
            <div className="boarding-progress-step-inner" />
          </div>
        ))}
      </div>
    </div>
  );
} 