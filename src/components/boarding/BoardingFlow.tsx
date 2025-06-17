import React from 'react';
import { ProgressBar } from './ProgressBar';
import { BasicInformationStep } from './BasicInformationStep';
import { ActivityGoalsStep } from './ActivityGoalsStep';
import { TrainingProfileStep } from './TrainingProfileStep';
import { useBoardingContext } from '../../contexts/BoardingContext';

export function BoardingFlow() {
  const { boardingData } = useBoardingContext();

  const renderCurrentStep = () => {
    switch (boardingData.currentStep) {
      case 1:
        return <BasicInformationStep />;
      case 2:
        return <ActivityGoalsStep />;
      case 3:
        return <TrainingProfileStep />;
      default:
        return <BasicInformationStep />;
    }
  };

  return (
    <div className="boarding-container">
      <div className="boarding-progress-wrapper">
        <ProgressBar 
          currentStep={boardingData.currentStep} 
          totalSteps={3} 
        />
      </div>
      
      <div className="boarding-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 