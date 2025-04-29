// context/WorkoutContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { healthDataOperations } from '../firebase/healthData';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
    const [workoutPercentage, setWorkoutPercentage] = useState(0);
    const [caloriesBurned, setCaloriesBurned] = useState(0);
    const dailyGoal = 100; // 100% is the target
    const { user, userData } = useAuth();

    // Load saved workout data on app start or when user/userData changes
    useEffect(() => {
        console.log('WorkoutContext: User or userData changed');
        
        // If we have user-specific data from Firebase, use that
        if (userData) {
            if (userData.workoutPercentage !== undefined) {
                console.log('Found user-specific workout percentage in userData:', userData.workoutPercentage);
                setWorkoutPercentage(userData.workoutPercentage);
            }
            
            if (userData.caloriesBurned !== undefined) {
                console.log('Found user-specific calories burned in userData:', userData.caloriesBurned);
                setCaloriesBurned(userData.caloriesBurned);
            }
            return;
        }

        // Otherwise load from AsyncStorage with user-specific key
        const loadWorkout = async () => {
            try {
                // Use user UID as part of the storage key if available
                const storageKeyPrefix = user ? `@workout_${user.uid}` : '@workout_guest';
                console.log('Attempting to load from AsyncStorage with key prefix:', storageKeyPrefix);
                
                // Load percentage
                const savedPercentage = await AsyncStorage.getItem(`${storageKeyPrefix}_percentage`);
                if (savedPercentage) {
                    const parsedPercentage = parseInt(savedPercentage);
                    console.log('Loaded workout percentage from AsyncStorage:', parsedPercentage);
                    setWorkoutPercentage(parsedPercentage);
                } else {
                    console.log('No saved workout percentage found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setWorkoutPercentage(0);
                }
                
                // Load calories burned
                const savedCalories = await AsyncStorage.getItem(`${storageKeyPrefix}_calories`);
                if (savedCalories) {
                    const parsedCalories = parseFloat(savedCalories);
                    console.log('Loaded calories burned from AsyncStorage:', parsedCalories);
                    setCaloriesBurned(parsedCalories);
                } else {
                    console.log('No saved calories burned found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setCaloriesBurned(0);
                }
            } catch (e) {
                console.error('Error loading workout data:', e);
            }
        };
        loadWorkout();
    }, [user, userData]);

    // Save workout data whenever it changes
    useEffect(() => {
        const saveWorkout = async () => {
            try {
                // Skip saving if workout percentage is 0, calories burned is 0, and user is not logged in
                if (workoutPercentage === 0 && caloriesBurned === 0 && !user) {
                    console.log('Skipping save for guest with 0 workout data');
                    return;
                }
                
                // Use user UID as part of the storage key if available
                const storageKeyPrefix = user ? `@workout_${user.uid}` : '@workout_guest';
                
                // Save percentage
                await AsyncStorage.setItem(`${storageKeyPrefix}_percentage`, workoutPercentage.toString());
                console.log('Saved percentage to AsyncStorage:', `${storageKeyPrefix}_percentage`, '=', workoutPercentage);
                
                // Save calories burned
                await AsyncStorage.setItem(`${storageKeyPrefix}_calories`, caloriesBurned.toString());
                console.log('Saved calories to AsyncStorage:', `${storageKeyPrefix}_calories`, '=', caloriesBurned);
                
                // If user is logged in, also save to Firebase
                if (user) {
                    try {
                        console.log('Saving workout data to Firebase for user:', user.uid);
                        
                        // Use updateHealthData to only update workout fields without affecting other health data
                        const result = await healthDataOperations.updateHealthData(user.uid, {
                            workoutPercentage: workoutPercentage,
                            caloriesBurned: caloriesBurned,
                            lastUpdated: Date.now()
                        });
                        
                        if (result.success) {
                            console.log('Successfully saved workout data to Firebase');
                        } else {
                            console.error('Failed to save workout data to Firebase:', result.error);
                        }
                    } catch (error) {
                        console.error('Error saving to Firebase:', error);
                    }
                }
            } catch (e) {
                console.error('Error saving workout data:', e);
            }
        };
        
        // Only save if there's a real change to save
        if (workoutPercentage !== undefined || caloriesBurned !== undefined) {
            saveWorkout();
        }
    }, [workoutPercentage, caloriesBurned, user]);

    const updateWorkoutPercentage = (newPercentage) => {
        // Ensure newPercentage is a valid number
        if (isNaN(newPercentage) || newPercentage < 0) {
            console.warn('Invalid workout percentage:', newPercentage);
            return;
        }
        
        // Cap the amount at 100%
        const cappedPercentage = Math.min(Math.round(newPercentage), dailyGoal);
        
        console.log('Updating workout percentage:', 
            'User:', user?.uid || 'Guest', 
            'Current:', workoutPercentage, 
            'New:', cappedPercentage
        );
        
        setWorkoutPercentage(cappedPercentage);
    };

    const updateCaloriesBurned = (newCalories) => {
        // Ensure newCalories is a valid number
        if (isNaN(newCalories) || newCalories < 0) {
            console.warn('Invalid calories burned value:', newCalories);
            return;
        }
        
        console.log('Updating calories burned:', 
            'User:', user?.uid || 'Guest', 
            'Current:', caloriesBurned, 
            'New:', newCalories
        );
        
        setCaloriesBurned(newCalories);
        
        // Also update the workout percentage
        const targetCalories = 300; // Same as in Workout.js
        const newPercentage = Math.min(100, Math.round((newCalories / targetCalories) * 100));
        updateWorkoutPercentage(newPercentage);
    };

    const resetWorkout = () => {
        setWorkoutPercentage(0);
        setCaloriesBurned(0);
        console.log('Workout data reset to 0');
    };

    return (
        <WorkoutContext.Provider
            value={{
                workoutPercentage,
                caloriesBurned,
                dailyGoal,
                updateWorkoutPercentage,
                updateCaloriesBurned,
                resetWorkout
            }}
        >
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkout = () => useContext(WorkoutContext); 