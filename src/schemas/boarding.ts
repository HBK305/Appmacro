import { z } from 'zod';

export const basicInformationSchema = z.object({
  age: z.number()
    .min(13, 'Age must be at least 13')
    .max(99, 'Age must be less than 100')
    .int('Age must be a whole number'),
  sex: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Please select your sex'
  }),
  height: z.number()
    .min(100, 'Height must be at least 100cm')
    .max(250, 'Height must be less than 250cm')
    .int('Height must be a whole number'),
  weight: z.number()
    .min(30, 'Weight must be at least 30kg')
    .max(300, 'Weight must be less than 300kg')
    .multipleOf(0.1, 'Weight can have one decimal place')
});

export const activityGoalsSchema = z.object({
  trainingSessions: z.number()
    .min(1, 'At least 1 training session per week')
    .max(14, 'Maximum 14 training sessions per week')
    .int('Training sessions must be a whole number'),
  fitnessGoal: z.enum(['Lose fat', 'Build muscle', 'Maintain'], {
    required_error: 'Please select your fitness goal'
  }),
  mealsPerDay: z.number()
    .min(1, 'At least 1 meal per day')
    .max(6, 'Maximum 6 meals per day')
    .int('Meals per day must be a whole number')
});

export const trainingProfileSchema = z.object({
  primarySport: z.string()
    .min(1, 'Please select your primary sport'),
  bodyFatPercentage: z.number()
    .min(5, 'Body fat percentage must be at least 5%')
    .max(50, 'Body fat percentage must be less than 50%')
    .optional(),
  trainingExperience: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    required_error: 'Please select your training experience'
  })
});

export const boardingDataSchema = z.object({
  basicInformation: basicInformationSchema.optional(),
  activityGoals: activityGoalsSchema.optional(),
  trainingProfile: trainingProfileSchema.optional(),
  completed: z.boolean(),
  currentStep: z.number().min(1).max(3)
});

export type BasicInformationInput = z.infer<typeof basicInformationSchema>;
export type ActivityGoalsInput = z.infer<typeof activityGoalsSchema>;
export type TrainingProfileInput = z.infer<typeof trainingProfileSchema>; 