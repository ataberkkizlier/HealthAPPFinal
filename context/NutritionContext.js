// context/NutritionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { healthDataOperations } from '../firebase/healthData';
import consumedFoodService from '../services/ConsumedFoodService';
import { getNutritionPlan, WEIGHT_GOALS } from '../utils/BMICalculator';

const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
    const [nutritionPercentage, setNutritionPercentage] = useState(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);
    const [proteinConsumed, setProteinConsumed] = useState(0);
    const [carbsConsumed, setCarbsConsumed] = useState(0);
    const [fatConsumed, setFatConsumed] = useState(0);
    
    // Default targets (will be updated based on user profile)
    const [calorieTarget, setCalorieTarget] = useState(2500);
    const [proteinTarget, setProteinTarget] = useState(125); // in grams
    const [carbsTarget, setCarbsTarget] = useState(312); // in grams
    const [fatTarget, setFatTarget] = useState(83); // in grams
    
    const [nutritionPlan, setNutritionPlan] = useState(null);
    
    const dailyGoal = 100; // 100% is the target
    const { user, userData } = useAuth();

    // Calculate nutrition percentages
    const calculateNutritionMetrics = () => {
        if (!nutritionPlan) return;
        
        // Calculate percentages based on targets
        const proteinPercentage = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));
        const carbsPercentage = Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100));
        const fatPercentage = Math.min(100, Math.round((fatConsumed / fatTarget) * 100));
        
        // Calculate overall percentage as the average of all three macronutrients
        const overallPercentage = Math.round((proteinPercentage + carbsPercentage + fatPercentage) / 3);
        
        return {
            overall: overallPercentage,
            protein: proteinPercentage,
            carbs: carbsPercentage,
            fat: fatPercentage
        };
    };

    // Update nutrition plan based on user profile
    useEffect(() => {
        if (!userData) return;
        
        const { weight, height, age, gender, activityLevel, weightGoal } = userData;
        
        // Check if we have all required data to calculate a nutrition plan
        if (weight && height && age && gender) {
            const activityLevelValue = activityLevel || 'moderate'; // Default to moderate if not set
            const weightGoalValue = weightGoal || WEIGHT_GOALS.MAINTAIN; // Default to maintenance if not set
            
            // Calculate nutrition plan with weight goal
            const plan = getNutritionPlan(
                parseFloat(weight),
                parseFloat(height),
                parseInt(age),
                gender.toLowerCase(),
                activityLevelValue,
                weightGoalValue
            );
            
            setNutritionPlan(plan);
            
            // Update targets
            setCalorieTarget(plan.dailyCalories);
            setProteinTarget(plan.nutrientGoals.protein);
            setCarbsTarget(plan.nutrientGoals.carbs);
            setFatTarget(plan.nutrientGoals.fat);
            
            console.log('Updated nutrition plan based on user profile:', plan);
            console.log(`Using weight goal: ${weightGoalValue}, calories: ${plan.dailyCalories}`);
        }
    }, [userData]);

    // Load saved nutrition data on app start or when user/userData changes
    useEffect(() => {
        console.log('NutritionContext: User or userData changed');
        
        // If we have user-specific data from Firebase, use that
        if (userData) {
            // Load overall nutrition percentage
            if (userData.nutritionPercentage !== undefined) {
                console.log('Found user-specific nutrition percentage in userData:', userData.nutritionPercentage);
                setNutritionPercentage(userData.nutritionPercentage);
            }
            
            // Load calories consumed
            if (userData.caloriesConsumed !== undefined) {
                console.log('Found user-specific calories consumed in userData:', userData.caloriesConsumed);
                setCaloriesConsumed(userData.caloriesConsumed);
            }
            
            // Load macronutrients consumed
            if (userData.proteinConsumed !== undefined) {
                setProteinConsumed(userData.proteinConsumed);
            }
            
            if (userData.carbsConsumed !== undefined) {
                setCarbsConsumed(userData.carbsConsumed);
            }
            
            if (userData.fatConsumed !== undefined) {
                setFatConsumed(userData.fatConsumed);
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
                
                // Load macronutrients
                const savedProtein = await AsyncStorage.getItem(`${storageKeyPrefix}_protein`);
                if (savedProtein) {
                    setProteinConsumed(parseFloat(savedProtein));
                } else {
                    setProteinConsumed(0);
                }
                
                const savedCarbs = await AsyncStorage.getItem(`${storageKeyPrefix}_carbs`);
                if (savedCarbs) {
                    setCarbsConsumed(parseFloat(savedCarbs));
                } else {
                    setCarbsConsumed(0);
                }
                
                const savedFat = await AsyncStorage.getItem(`${storageKeyPrefix}_fat`);
                if (savedFat) {
                    setFatConsumed(parseFloat(savedFat));
                } else {
                    setFatConsumed(0);
                }
                
                // Also try to get today's totals from the ConsumedFoodService
                try {
                    const userId = user ? user.uid : null;
                    const todaysTotals = await consumedFoodService.getTodaysTotals(userId);
                    if (todaysTotals && todaysTotals.calories > 0) {
                        // If we have data in ConsumedFoodService, prefer that
                        console.log('Found nutrition data in ConsumedFoodService:', todaysTotals);
                        updateNutrientIntake(
                            todaysTotals.calories,
                            todaysTotals.protein || 0,
                            todaysTotals.carbs || 0,
                            todaysTotals.fat || 0
                        );
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
                
                // Calculate nutrition metrics
                const metrics = calculateNutritionMetrics() || { overall: nutritionPercentage };
                
                // Save percentage
                await AsyncStorage.setItem(`${storageKeyPrefix}_percentage`, metrics.overall.toString());
                
                // Save calories consumed
                await AsyncStorage.setItem(`${storageKeyPrefix}_calories`, caloriesConsumed.toString());
                
                // Save macronutrients
                await AsyncStorage.setItem(`${storageKeyPrefix}_protein`, proteinConsumed.toString());
                await AsyncStorage.setItem(`${storageKeyPrefix}_carbs`, carbsConsumed.toString());
                await AsyncStorage.setItem(`${storageKeyPrefix}_fat`, fatConsumed.toString());
                
                // If user is logged in, also save to Firebase
                if (user) {
                    try {
                        console.log('Saving nutrition data to Firebase for user:', user.uid);
                        
                        // Use updateHealthData to update nutrition fields
                        const result = await healthDataOperations.updateHealthData(user.uid, {
                            nutritionPercentage: metrics.overall,
                            caloriesConsumed,
                            proteinConsumed,
                            carbsConsumed,
                            fatConsumed,
                            calorieTarget,
                            proteinTarget,
                            carbsTarget,
                            fatTarget,
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
        
        // Save if any of these values change
        saveNutrition();
    }, [nutritionPercentage, caloriesConsumed, proteinConsumed, carbsConsumed, fatConsumed, user]);

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
        
        // No longer update nutrition percentage directly from calories
        // Instead, we'll calculate it based on all macronutrients in calculateNutritionMetrics
    };
    
    const updateNutrientIntake = (calories, protein, carbs, fat) => {
        // Update all nutrition values at once
        setCaloriesConsumed(calories);
        setProteinConsumed(protein);
        setCarbsConsumed(carbs);
        setFatConsumed(fat);
        
        // Calculate overall nutrition percentage based on macronutrients
        const proteinPercentage = Math.min(100, Math.round((protein / proteinTarget) * 100));
        const carbsPercentage = Math.min(100, Math.round((carbs / carbsTarget) * 100));
        const fatPercentage = Math.min(100, Math.round((fat / fatTarget) * 100));
        
        // Overall percentage is the average of all three macronutrients
        const overallPercentage = Math.round((proteinPercentage + carbsPercentage + fatPercentage) / 3);
        
        updateNutritionPercentage(overallPercentage);
    };
    
    // Track food consumption
    const addFoodItem = async (foodItem) => {
        try {
            // Add to consumed foods service
            const userId = user ? user.uid : null;
            // Fix parameter order to match ConsumedFoodService implementation
            const success = await consumedFoodService.addConsumedFood(foodItem, userId);
            
            if (!success) {
                throw new Error('Failed to add food to storage');
            }
            
            // Update local state with new totals
            const todaysTotals = await consumedFoodService.getTodaysTotals(userId);
            
            console.log('Updated totals after adding food:', todaysTotals);
            
            updateNutrientIntake(
                todaysTotals.calories || 0,
                todaysTotals.protein || 0,
                todaysTotals.carbs || 0,
                todaysTotals.fat || 0
            );
            
            return { success: true };
        } catch (error) {
            console.error('Error adding food item:', error);
            return { success: false, error: error.message };
        }
    };

    const resetNutrition = async () => {
        setNutritionPercentage(0);
        setCaloriesConsumed(0);
        setProteinConsumed(0);
        setCarbsConsumed(0);
        setFatConsumed(0);
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
                proteinConsumed,
                carbsConsumed,
                fatConsumed,
                calorieTarget,
                proteinTarget,
                carbsTarget,
                fatTarget,
                dailyGoal,
                nutritionPlan,
                calculateNutritionMetrics,
                updateNutritionPercentage,
                updateCaloriesConsumed,
                updateNutrientIntake,
                addFoodItem,
                resetNutrition
            }}
        >
            {children}
        </NutritionContext.Provider>
    );
};

export const useNutrition = () => useContext(NutritionContext); 