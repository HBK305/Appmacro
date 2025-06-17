import React, { useState, useEffect } from 'react';
import { SlideWrapper } from './SlideWrapper';
import { SliderField } from './SliderField';
import { PillSelector } from './PillSelector';
import { useBoardingContext } from '../../contexts/BoardingContext';
import { trainingProfileSchema } from '../../schemas/boarding';
import { TrainingProfile } from '../../types/boarding';

// Import the ActivitySelector from the existing component
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

export function TrainingProfileStep() {
  const { boardingData, updateTrainingProfile, completeBarding, prevStep } = useBoardingContext();
  
  const [formData, setFormData] = useState<Partial<TrainingProfile>>({
    primarySport: boardingData.trainingProfile?.primarySport || '',
    bodyFatPercentage: boardingData.trainingProfile?.bodyFatPercentage || undefined,
    trainingExperience: boardingData.trainingProfile?.trainingExperience || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const experienceOptions = [
    { 
      value: 'Beginner', 
      label: 'Beginner',
      description: '< 1 year training'
    },
    { 
      value: 'Intermediate', 
      label: 'Intermediate',
      description: '1-3 years training'
    },
    { 
      value: 'Advanced', 
      label: 'Advanced',
      description: '3+ years training'
    }
  ];

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    try {
      const dataToValidate = {
        primarySport: formData.primarySport === '' ? undefined : formData.primarySport,
        bodyFatPercentage: formData.bodyFatPercentage,
        trainingExperience: formData.trainingExperience === '' ? undefined : formData.trainingExperience
      };

      trainingProfileSchema.parse(dataToValidate);
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

  const handleFinish = () => {
    if (isValid && formData.primarySport && formData.trainingExperience) {
      updateTrainingProfile({
        primarySport: formData.primarySport,
        bodyFatPercentage: formData.bodyFatPercentage,
        trainingExperience: formData.trainingExperience as 'Beginner' | 'Intermediate' | 'Advanced'
      });
      completeBarding();
    }
  };

  return (
    <SlideWrapper
      title="Training Profile"
      subtitle="Final step - tell us about your training background"
      currentStep={3}
      totalSteps={3}
      onNext={handleFinish}
      onPrev={prevStep}
      nextLabel="Complete Setup"
      nextDisabled={!isValid}
      showPrev={true}
    >
      <div className="boarding-form">
        <div className="boarding-form-row">
          <div className="boarding-field">
            <label className="boarding-label">
              Primary Sport/Activity
              <span className="boarding-required">*</span>
            </label>
            <ActivitySelector
              value={formData.primarySport || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, primarySport: value }))}
            />
            {errors.primarySport && <span className="boarding-error">{errors.primarySport}</span>}
          </div>
        </div>

        <div className="boarding-form-row">
          <SliderField
            label="Body Fat Percentage"
            value={formData.bodyFatPercentage || 15}
            onChange={(value) => setFormData(prev => ({ ...prev, bodyFatPercentage: value }))}
            min={5}
            max={50}
            step={0.5}
            unit="%"
            error={errors.bodyFatPercentage}
            required={false}
          />
          <div className="boarding-help-text">
            Optional - helps with more accurate calorie calculations
            <button type="button" className="boarding-help-link">
              📊 Visual Reference Guide
            </button>
          </div>
        </div>

        <div className="boarding-form-row">
          <PillSelector
            label="Training Experience"
            options={experienceOptions}
            value={formData.trainingExperience || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, trainingExperience: value as string }))}
            error={errors.trainingExperience}
            required
          />
          <div className="boarding-help-text">
            This affects your recovery needs and macro distribution
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
} 