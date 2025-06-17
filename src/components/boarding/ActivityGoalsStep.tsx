import React, { useState, useEffect } from 'react';
import { SlideWrapper } from './SlideWrapper';
import { SliderField } from './SliderField';
import { PillSelector } from './PillSelector';
import { useBoardingContext } from '../../contexts/BoardingContext';
import { activityGoalsSchema } from '../../schemas/boarding';
import { ActivityGoals } from '../../types/boarding';

export function ActivityGoalsStep() {
  const { boardingData, updateActivityGoals, nextStep, prevStep } = useBoardingContext();
  
  const [formData, setFormData] = useState<Partial<ActivityGoals>>({
    trainingSessions: boardingData.activityGoals?.trainingSessions || 3,
    fitnessGoal: boardingData.activityGoals?.fitnessGoal || '',
    mealsPerDay: boardingData.activityGoals?.mealsPerDay || 3
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const fitnessGoalOptions = [
    { 
      value: 'Lose fat', 
      label: 'Lose Fat',
      description: 'Caloric deficit with higher protein'
    },
    { 
      value: 'Build muscle', 
      label: 'Build Muscle',
      description: 'Caloric surplus with optimal protein timing'
    },
    { 
      value: 'Maintain', 
      label: 'Maintain',
      description: 'Balanced macros for current physique'
    }
  ];

  const mealOptions = [
    { value: 1, label: '1', description: 'OMAD' },
    { value: 2, label: '2', description: 'IF 16:8' },
    { value: 3, label: '3', description: 'Standard' },
    { value: 4, label: '4', description: 'Frequent' },
    { value: 5, label: '5', description: 'Bodybuilder' },
    { value: 6, label: '6', description: 'Max Frequency' }
  ];

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    try {
      const dataToValidate = {
        trainingSessions: formData.trainingSessions,
        fitnessGoal: formData.fitnessGoal === '' ? undefined : formData.fitnessGoal,
        mealsPerDay: formData.mealsPerDay
      };

      activityGoalsSchema.parse(dataToValidate);
      setErrors({});
      setIsValid(true);
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }
      setErrors(newErrors);
      setIsValid(false);
    }
  };

  const handleNext = () => {
    if (isValid && formData.trainingSessions && formData.fitnessGoal && formData.mealsPerDay) {
      updateActivityGoals({
        trainingSessions: formData.trainingSessions,
        fitnessGoal: formData.fitnessGoal as 'Lose fat' | 'Build muscle' | 'Maintain',
        mealsPerDay: formData.mealsPerDay
      });
      nextStep();
    }
  };

  return (
    <SlideWrapper
      title="Activity & Goals"
      subtitle="Tell us about your training and nutrition preferences"
      currentStep={2}
      totalSteps={3}
      onNext={handleNext}
      onPrev={prevStep}
      nextDisabled={!isValid}
      showPrev={true}
    >
      <div className="boarding-form">
        <div className="boarding-form-row">
          <SliderField
            label="Training Sessions per Week"
            value={formData.trainingSessions || 3}
            onChange={(value) => setFormData(prev => ({ ...prev, trainingSessions: value }))}
            min={1}
            max={14}
            unit="sessions"
            error={errors.trainingSessions}
            required
          />
          <div className="boarding-help-text">
            This helps us calculate your activity level and caloric needs
          </div>
        </div>

        <div className="boarding-form-row">
          <PillSelector
            label="Fitness Goal"
            options={fitnessGoalOptions}
            value={formData.fitnessGoal || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, fitnessGoal: value as string }))}
            error={errors.fitnessGoal}
            required
          />
          <div className="boarding-help-text">
            Your goal determines macro ratios and caloric targets
          </div>
        </div>

        <div className="boarding-form-row">
          <PillSelector
            label="Meals per Day"
            options={mealOptions}
            value={formData.mealsPerDay || 3}
            onChange={(value) => setFormData(prev => ({ ...prev, mealsPerDay: value as number }))}
            error={errors.mealsPerDay}
            required
          />
          <div className="boarding-help-text">
            We'll distribute your macros across your preferred meal frequency
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
} 