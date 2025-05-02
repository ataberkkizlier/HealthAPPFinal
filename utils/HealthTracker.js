// utils/HealthTracker.js
import React, { useEffect } from 'react';
import { useWaterIntake } from '../context/WaterIntakeContext';
import { useSteps } from '../context/StepsContext';
import { useWorkout } from '../context/WorkoutContext';
import { useNutrition } from '../context/NutritionContext';
import { useSleep } from '../context/SleepContext'; 
import { useMentalHealth } from '../context/MentalHealthContext';
import { useDailyReset } from './dailyReset';

// Component to handle health metrics tracking and daily reset
const HealthTracker = ({ children }) => {
  // Import hooks from context providers
  const { resetWaterIntake } = useWaterIntake();
  const { resetSteps } = useSteps();
  const { resetWorkout } = useWorkout();
  const { resetNutrition } = useNutrition();
  const { resetSleep } = useSleep();
  const { resetMentalHealth } = useMentalHealth();
  
  // Use the daily reset hook to reset all metrics at midnight
  useDailyReset({
    resetWaterIntake,
    resetNutrition,
    resetSteps,
    resetSleep,
    resetMentalHealth,
    resetWorkout
  });
  
  return children;
};

export default HealthTracker; 