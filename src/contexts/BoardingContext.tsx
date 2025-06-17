import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BoardingData, BoardingContextType, BasicInformation, ActivityGoals, TrainingProfile } from '../types/boarding';

const BOARDING_STORAGE_KEY = 'glowbit_boarding_data';

const initialBoardingData: BoardingData = {
  completed: false,
  currentStep: 1
};

type BoardingAction =
  | { type: 'UPDATE_BASIC_INFORMATION'; payload: BasicInformation }
  | { type: 'UPDATE_ACTIVITY_GOALS'; payload: ActivityGoals }
  | { type: 'UPDATE_TRAINING_PROFILE'; payload: TrainingProfile }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'COMPLETE_BOARDING' }
  | { type: 'RESET_BOARDING' }
  | { type: 'LOAD_FROM_STORAGE'; payload: BoardingData };

function boardingReducer(state: BoardingData, action: BoardingAction): BoardingData {
  switch (action.type) {
    case 'UPDATE_BASIC_INFORMATION':
      return {
        ...state,
        basicInformation: action.payload
      };
    case 'UPDATE_ACTIVITY_GOALS':
      return {
        ...state,
        activityGoals: action.payload
      };
    case 'UPDATE_TRAINING_PROFILE':
      return {
        ...state,
        trainingProfile: action.payload
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 3) as 1 | 2 | 3
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1) as 1 | 2 | 3
      };
    case 'COMPLETE_BOARDING':
      return {
        ...state,
        completed: true
      };
    case 'RESET_BOARDING':
      return initialBoardingData;
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    default:
      return state;
  }
}

const BoardingContext = createContext<BoardingContextType | undefined>(undefined);

export function BoardingProvider({ children }: { children: ReactNode }) {
  const [boardingData, dispatch] = useReducer(boardingReducer, initialBoardingData);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOARDING_STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored) as BoardingData;
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsedData });
      }
    } catch (error) {
      console.warn('Failed to load boarding data from storage:', error);
    }
  }, []);

  // Save to localStorage whenever boardingData changes
  useEffect(() => {
    try {
      localStorage.setItem(BOARDING_STORAGE_KEY, JSON.stringify(boardingData));
    } catch (error) {
      console.warn('Failed to save boarding data to storage:', error);
    }
  }, [boardingData]);

  const contextValue: BoardingContextType = {
    boardingData,
    updateBasicInformation: (data: BasicInformation) => {
      dispatch({ type: 'UPDATE_BASIC_INFORMATION', payload: data });
    },
    updateActivityGoals: (data: ActivityGoals) => {
      dispatch({ type: 'UPDATE_ACTIVITY_GOALS', payload: data });
    },
    updateTrainingProfile: (data: TrainingProfile) => {
      dispatch({ type: 'UPDATE_TRAINING_PROFILE', payload: data });
    },
    nextStep: () => {
      dispatch({ type: 'NEXT_STEP' });
    },
    prevStep: () => {
      dispatch({ type: 'PREV_STEP' });
    },
    completeBarding: () => {
      dispatch({ type: 'COMPLETE_BOARDING' });
      // Clear the temporary storage after completion
      localStorage.removeItem(BOARDING_STORAGE_KEY);
    },
    resetBoarding: () => {
      dispatch({ type: 'RESET_BOARDING' });
      localStorage.removeItem(BOARDING_STORAGE_KEY);
    }
  };

  return (
    <BoardingContext.Provider value={contextValue}>
      {children}
    </BoardingContext.Provider>
  );
}

export function useBoardingContext() {
  const context = useContext(BoardingContext);
  if (context === undefined) {
    throw new Error('useBoardingContext must be used within a BoardingProvider');
  }
  return context;
} 