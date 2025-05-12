// context/NutritionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { healthDataOperations } from '../firebase/healthData';
import consumedFoodService from '../services/ConsumedFoodService';
import { getNutritionPlan } from '../utils/BMICalculator';

const NutritionContext = createContext();

export const NutritionProvider = ({ children }) => {
    const [nutritionPercentage, setNutritionPercentage] = useState(0);
    const [caloriesConsumed, setCaloriesConsumed] = useState(0);
    const [proteinConsumed, setProteinConsumed] = useState(0);
    const [carbsConsumed, setCarbsConsumed] = useState(0);
    const [fatConsumed, setFatConsumed] = useState(0);
    
    // Remove hardcoded default targets
    const [calorieTarget, setCalorieTarget] = useState(0);
    const [proteinTarget, setProteinTarget] = useState(0);
    const [carbsTarget, setCarbsTarget] = useState(0);
    const [fatTarget, setFatTarget] = useState(0);
    
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

    // Update nutrition plan and targets based on user profile
    useEffect(() => {
        if (!userData) {
            console.warn('No userData available');
            return;
        }
        const { weight, height, age, gender, activityLevel, weightGoal } = userData;
        console.log('userData in NutritionContext:', userData);
        // Parse all fields to correct types
        const parsedWeight = weight ? parseFloat(weight) : null;
        const parsedHeight = height ? parseFloat(height) : null;
        const parsedAge = age ? parseInt(age) : null;
        const parsedGender = gender ? gender.toLowerCase() : "male"; // Default to 'male' if missing
        const parsedActivityLevel = activityLevel || 'moderate';
        const parsedWeightGoal = weightGoal || 'Maintain';
        if (parsedWeight && parsedHeight && parsedAge && parsedGender) {
            console.log('Calling getNutritionPlan with:', { parsedWeight, parsedHeight, parsedAge, parsedGender, parsedActivityLevel, parsedWeightGoal });
            const plan = getNutritionPlan(
                parsedWeight,
                parsedHeight,
                parsedAge,
                parsedGender,
                parsedActivityLevel,
                parsedWeightGoal
            );
            console.log('Generated nutrition plan:', plan);
            if (
                plan &&
                plan.nutrientGoals &&
                (plan.nutrientGoals.protein > 0 ||
                 plan.nutrientGoals.carbs > 0 ||
                 plan.nutrientGoals.fat > 0)
            ) {
                setNutritionPlan(plan);
                const { nutrientGoals } = plan;
                setCalorieTarget(nutrientGoals.adjustedCalories || plan.dailyCalories);
                setProteinTarget(nutrientGoals.protein);
                setCarbsTarget(nutrientGoals.carbs);
                setFatTarget(nutrientGoals.fat);
                if (user) {
                    healthDataOperations.updateHealthData(user.uid, {
                        calorieTarget: nutrientGoals.adjustedCalories || plan.dailyCalories,
                        proteinTarget: nutrientGoals.protein,
                        carbsTarget: nutrientGoals.carbs,
                        fatTarget: nutrientGoals.fat,
                        lastUpdated: Date.now()
                    }).catch(error => {
                        console.error('Error updating nutrition targets in database:', error);
                    });
                }
                console.log('Updated nutrition targets:', {
                    calories: nutrientGoals.adjustedCalories || plan.dailyCalories,
                    protein: nutrientGoals.protein,
                    carbs: nutrientGoals.carbs,
                    fat: nutrientGoals.fat
                });
            } else {
                console.warn('Nutrition plan calculation returned all zeros. Not updating targets. Plan:', plan, 'Inputs:', { parsedWeight, parsedHeight, parsedAge, parsedGender, parsedActivityLevel, parsedWeightGoal });
            }
        } else {
            console.warn('Missing required userData fields for nutrition calculation:', { parsedWeight, parsedHeight, parsedAge, parsedGender });
        }
    }, [userData, user]);

    // Load saved nutrition data including targets
    useEffect(() => {
        const loadNutrition = async () => {
            if (!user) return;
            
            try {
                const storageKeyPrefix = `nutrition_${user.uid}_${new Date().toISOString().split('T')[0]}`;
                
                // Load consumed values
                const savedCalories = await AsyncStorage.getItem(`${storageKeyPrefix}_calories`);
                if (savedCalories) {
                    setCaloriesConsumed(parseFloat(savedCalories));
                }
                
                const savedProtein = await AsyncStorage.getItem(`${storageKeyPrefix}_protein`);
                if (savedProtein) {
                    setProteinConsumed(parseFloat(savedProtein));
                }
                
                const savedCarbs = await AsyncStorage.getItem(`${storageKeyPrefix}_carbs`);
                if (savedCarbs) {
                    setCarbsConsumed(parseFloat(savedCarbs));
                }
                
                const savedFat = await AsyncStorage.getItem(`${storageKeyPrefix}_fat`);
                if (savedFat) {
                    setFatConsumed(parseFloat(savedFat));
                }
                
                // Load targets from database if available
                try {
                    const healthData = await healthDataOperations.getHealthData(user.uid);
                    if (healthData) {
                        if (healthData.calorieTarget) setCalorieTarget(healthData.calorieTarget);
                        if (healthData.proteinTarget) setProteinTarget(healthData.proteinTarget);
                        if (healthData.carbsTarget) setCarbsTarget(healthData.carbsTarget);
                        if (healthData.fatTarget) setFatTarget(healthData.fatTarget);
                    }
                } catch (error) {
                    console.error('Error loading nutrition targets from database:', error);
                }
                
                // Also try to get today's totals from the ConsumedFoodService
                try {
                    const todaysTotals = await consumedFoodService.getTodaysTotals(user.uid);
                    if (todaysTotals && todaysTotals.calories > 0) {
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
    }, [user]);

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