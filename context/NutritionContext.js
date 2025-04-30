// context/NutritionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { healthDataOperations } from '../firebase/healthData';
import consumedFoodService from '../services/ConsumedFoodService';

const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
    const [nutritionPercentage, setNutritionPercentage] = useState(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);
    const dailyGoal = 100; // 100% is the target
    const { user, userData } = useAuth();

    // Target calories for 100% nutrition goal - can be adjusted based on user profile in the future
    const TARGET_CALORIES = 2500; // 2000 calories = 100% nutrition

    // Load saved nutrition data on app start or when user/userData changes
    useEffect(() => {
        console.log('NutritionContext: User or userData changed');
        
        // If we have user-specific data from Firebase, use that
        if (userData) {
            if (userData.nutritionPercentage !== undefined) {
                console.log('Found user-specific nutrition percentage in userData:', userData.nutritionPercentage);
                setNutritionPercentage(userData.nutritionPercentage);
            }
            
            if (userData.caloriesConsumed !== undefined) {
                console.log('Found user-specific calories consumed in userData:', userData.caloriesConsumed);
                setCaloriesConsumed(userData.caloriesConsumed);
            }
            return;
        }

        // Otherwise load from AsyncStorage with user-specific key
        const loadNutrition = async () => {
            try {
                // Use user UID as part of the storage key if available
                const storageKeyPrefix = user ? `@nutrition_${user.uid}` : '@nutrition_guest';
                console.log('Attempting to load from AsyncStorage with key prefix:', storageKeyPrefix);
                
                // Load percentage
                const savedPercentage = await AsyncStorage.getItem(`${storageKeyPrefix}_percentage`);
                if (savedPercentage) {
                    const parsedPercentage = parseInt(savedPercentage);
                    console.log('Loaded nutrition percentage from AsyncStorage:', parsedPercentage);
                    setNutritionPercentage(parsedPercentage);
                } else {
                    console.log('No saved nutrition percentage found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setNutritionPercentage(0);
                }
                
                // Load calories consumed
                const savedCalories = await AsyncStorage.getItem(`${storageKeyPrefix}_calories`);
                if (savedCalories) {
                    const parsedCalories = parseFloat(savedCalories);
                    console.log('Loaded calories consumed from AsyncStorage:', parsedCalories);
                    setCaloriesConsumed(parsedCalories);
                } else {
                    console.log('No saved calories consumed found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setCaloriesConsumed(0);
                }
                
                // Also try to get today's totals from the ConsumedFoodService
                try {
                    const userId = user ? user.uid : null;
                    const todaysTotals = await consumedFoodService.getTodaysTotals(userId);
                    if (todaysTotals && todaysTotals.calories > 0) {
                        // If we have data in ConsumedFoodService, prefer that
                        console.log('Found nutrition data in ConsumedFoodService:', todaysTotals);
                        updateCaloriesConsumed(todaysTotals.calories);
                        // Nutrition percentage will be automatically updated by updateCaloriesConsumed
                    }
                } catch (error) {
                    console.error('Error getting today\'s totals from ConsumedFoodService:', error);
                }
            } catch (e) {
                console.error('Error loading nutrition data:', e);
            }
        };
        loadNutrition();
    }, [user, userData]);

    // Save nutrition data whenever it changes
    useEffect(() => {
        const saveNutrition = async () => {
            try {
                // Skip saving if nutrition percentage is 0, calories consumed is 0, and user is not logged in
                if (nutritionPercentage === 0 && caloriesConsumed === 0 && !user) {
                    console.log('Skipping save for guest with 0 nutrition data');
                    return;
                }
                
                // Use user UID as part of the storage key if available
                const storageKeyPrefix = user ? `@nutrition_${user.uid}` : '@nutrition_guest';
                
                // Save percentage
                await AsyncStorage.setItem(`${storageKeyPrefix}_percentage`, nutritionPercentage.toString());
                console.log('Saved percentage to AsyncStorage:', `${storageKeyPrefix}_percentage`, '=', nutritionPercentage);
                
                // Save calories consumed
                await AsyncStorage.setItem(`${storageKeyPrefix}_calories`, caloriesConsumed.toString());
                console.log('Saved calories to AsyncStorage:', `${storageKeyPrefix}_calories`, '=', caloriesConsumed);
                
                // If user is logged in, also save to Firebase
                if (user) {
                    try {
                        console.log('Saving nutrition data to Firebase for user:', user.uid);
                        
                        // Use updateHealthData to only update nutrition fields without affecting other health data
                        const result = await healthDataOperations.updateHealthData(user.uid, {
                            nutritionPercentage: nutritionPercentage,
                            caloriesConsumed: caloriesConsumed,
                            lastUpdated: Date.now()
                        });
                        
                        if (result.success) {
                            console.log('Successfully saved nutrition data to Firebase');
                        } else {
                            console.error('Failed to save nutrition data to Firebase:', result.error);
                        }
                    } catch (error) {
                        console.error('Error saving to Firebase:', error);
                    }
                }
            } catch (e) {
                console.error('Error saving nutrition data:', e);
            }
        };
        
        // Only save if there's a real change to save
        if (nutritionPercentage !== undefined || caloriesConsumed !== undefined) {
            saveNutrition();
        }
    }, [nutritionPercentage, caloriesConsumed, user]);

    const updateNutritionPercentage = (newPercentage) => {
        // Ensure newPercentage is a valid number
        if (isNaN(newPercentage) || newPercentage < 0) {
            console.warn('Invalid nutrition percentage:', newPercentage);
            return;
        }
        
        // Cap the amount at 100%
        const cappedPercentage = Math.min(Math.round(newPercentage), dailyGoal);
        
        console.log('Updating nutrition percentage:', 
            'User:', user?.uid || 'Guest', 
            'Current:', nutritionPercentage, 
            'New:', cappedPercentage
        );
        
        setNutritionPercentage(cappedPercentage);
    };

    const updateCaloriesConsumed = (newCalories) => {
        // Ensure newCalories is a valid number
        if (isNaN(newCalories) || newCalories < 0) {
            console.warn('Invalid calories consumed value:', newCalories);
            return;
        }
        
        console.log('Updating calories consumed:', 
            'User:', user?.uid || 'Guest', 
            'Current:', caloriesConsumed, 
            'New:', newCalories
        );
        
        setCaloriesConsumed(newCalories);
        
        // Also update the nutrition percentage based on the daily calorie goal
        const newPercentage = Math.min(100, Math.round((newCalories / TARGET_CALORIES) * 100));
        updateNutritionPercentage(newPercentage);
    };

    const resetNutrition = async () => {
        setNutritionPercentage(0);
        setCaloriesConsumed(0);
        console.log('Nutrition data reset to 0');
        
        // Also reset consumed foods in ConsumedFoodService
        try {
            const userId = user ? user.uid : null;
            await consumedFoodService.resetTodaysData(userId);
            console.log('ConsumedFoodService data reset');
        } catch (error) {
            console.error('Error resetting ConsumedFoodService data:', error);
        }
    };

    return (
        <NutritionContext.Provider
            value={{
                nutritionPercentage,
                caloriesConsumed,
                dailyGoal,
                TARGET_CALORIES,
                updateNutritionPercentage,
                updateCaloriesConsumed,
                resetNutrition
            }}
        >
            {children}
        </NutritionContext.Provider>
    );
};

export const useNutrition = () => useContext(NutritionContext); 