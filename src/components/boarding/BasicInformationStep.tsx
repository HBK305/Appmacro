import React, { useState, useEffect } from 'react';
import { SlideWrapper } from './SlideWrapper';
import { NumberInput } from './NumberInput';
import { PillSelector } from './PillSelector';
import { useBoardingContext } from '../../contexts/BoardingContext';
import { basicInformationSchema } from '../../schemas/boarding';
import { BasicInformation } from '../../types/boarding';

export function BasicInformationStep() {
  const { boardingData, updateBasicInformation, nextStep } = useBoardingContext();
  
  const [formData, setFormData] = useState<Partial<BasicInformation>>({
    age: boardingData.basicInformation?.age || '',
    sex: boardingData.basicInformation?.sex || '',
    height: boardingData.basicInformation?.height || '',
    weight: boardingData.basicInformation?.weight || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const sexOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    try {
      // Convert empty strings to undefined for validation
      const dataToValidate = {
        age: formData.age === '' ? undefined : formData.age,
        sex: formData.sex === '' ? undefined : formData.sex,
        height: formData.height === '' ? undefined : formData.height,
        weight: formData.weight === '' ? undefined : formData.weight
      };

      basicInformationSchema.parse(dataToValidate);
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
    if (isValid && formData.age && formData.sex && formData.height && formData.weight) {
      updateBasicInformation({
        age: formData.age as number,
        sex: formData.sex as 'Male' | 'Female' | 'Other',
        height: formData.height as number,
        weight: formData.weight as number
      });
      nextStep();
    }
  };

  return (
    <SlideWrapper
      title="Basic Information"
      subtitle="Let's start with some basic details about you"
      currentStep={1}
      totalSteps={3}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <div className="boarding-form">
        <div className="boarding-form-row">
          <NumberInput
            label="Age"
            value={formData.age}
            onChange={(value) => setFormData(prev => ({ ...prev, age: value }))}
            min={13}
            max={99}
            unit="years"
            error={errors.age}
            placeholder="25"
            required
          />
        </div>

        <div className="boarding-form-row">
          <PillSelector
            label="Sex"
            options={sexOptions}
            value={formData.sex || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, sex: value as 'Male' | 'Female' | 'Other' }))}
            error={errors.sex}
            required
          />
        </div>

        <div className="boarding-form-row boarding-form-row-split">
          <NumberInput
            label="Height"
            value={formData.height}
            onChange={(value) => setFormData(prev => ({ ...prev, height: value }))}
            min={100}
            max={250}
            unit="cm"
            error={errors.height}
            placeholder="175"
            required
          />
          <NumberInput
            label="Weight"
            value={formData.weight}
            onChange={(value) => setFormData(prev => ({ ...prev, weight: value }))}
            min={30}
            max={300}
            step={0.1}
            unit="kg"
            error={errors.weight}
            placeholder="70.0"
            required
          />
        </div>
      </div>
    </SlideWrapper>
  );
} 