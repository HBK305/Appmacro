export interface BasicInformation {
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  height: number; // cm
  weight: number; // kg
}

export interface ActivityGoals {
  trainingSessions: number; // 1-14
  fitnessGoal: 'Lose fat' | 'Build muscle' | 'Maintain';
  mealsPerDay: number; // 1-6
}

export interface TrainingProfile {
  primarySport: string;
  bodyFatPercentage?: number; // optional
  trainingExperience: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface BoardingData {
  basicInformation?: BasicInformation;
  activityGoals?: ActivityGoals;
  trainingProfile?: TrainingProfile;
  completed: boolean;
  currentStep: number;
}

export interface BoardingContextType {
  boardingData: BoardingData;
  updateBasicInformation: (data: BasicInformation) => void;
  updateActivityGoals: (data: ActivityGoals) => void;
  updateTrainingProfile: (data: TrainingProfile) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeBarding: () => void;
  resetBoarding: () => void;
}

export type BoardingStep = 1 | 2 | 3; 