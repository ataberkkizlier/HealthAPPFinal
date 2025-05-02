import { useEffect, useRef } from 'react';
import CategoryTracker from './CategoryTracker';

/**
 * Custom hook to schedule daily reset of health metrics at midnight local time
 * @param {Object} resetFunctions An object containing reset functions for different health metrics
 * @returns {void}
 */
export const useDailyReset = (resetFunctions) => {
  const timeoutRef = useRef(null);

  // Function to schedule the next reset at midnight
  const scheduleNextReset = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow - now;
    console.log(`Scheduling next reset in ${Math.floor(timeUntilMidnight / 1000 / 60)} minutes (at midnight)`);

    // Schedule the reset
    timeoutRef.current = setTimeout(async () => {
      console.log('Midnight reached, checking which categories need to be reset');
      
      // Reset categories that need to be reset
      await CategoryTracker.resetCategoriesIfNeeded({
        waterIntake: resetFunctions.resetWaterIntake,
        nutrition: resetFunctions.resetNutrition,
        steps: resetFunctions.resetSteps,
        sleep: resetFunctions.resetSleep,
        mentalHealth: resetFunctions.resetMentalHealth,
        workout: resetFunctions.resetWorkout
      });
      
      // Schedule the next reset
      scheduleNextReset();
    }, timeUntilMidnight);
  };

  useEffect(() => {
    const checkAndResetIfNeeded = async () => {
      try {
        console.log('App started, checking if any categories need to be reset');
        
        // Reset categories that need to be reset
        await CategoryTracker.resetCategoriesIfNeeded({
          waterIntake: resetFunctions.resetWaterIntake,
          nutrition: resetFunctions.resetNutrition,
          steps: resetFunctions.resetSteps,
          sleep: resetFunctions.resetSleep,
          mentalHealth: resetFunctions.resetMentalHealth,
          workout: resetFunctions.resetWorkout
        });
        
        // Schedule the next reset
        scheduleNextReset();
      } catch (error) {
        console.error('Error in checkAndResetIfNeeded:', error);
        // Ensure we still schedule the next reset even if there's an error
        scheduleNextReset();
      }
    };

    // Check if we need to reset on component mount
    checkAndResetIfNeeded();

    return () => {
      // Clean up the timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    resetFunctions.resetWaterIntake,
    resetFunctions.resetNutrition,
    resetFunctions.resetSteps,
    resetFunctions.resetSleep,
    resetFunctions.resetMentalHealth,
    resetFunctions.resetWorkout
  ]);
}; 