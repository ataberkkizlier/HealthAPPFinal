// context/WaterIntakeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { healthDataOperations } from '../firebase/healthData';

const WaterIntakeContext = createContext();

export const WaterIntakeProvider = ({ children }) => {
    const [waterIntake, setWaterIntake] = useState(0);
    const dailyGoal = 4000; // 4 liters = 4000ml
    const { user, userData } = useAuth();

    // Load saved intake on app start or when user/userData changes
    useEffect(() => {
        console.log('WaterIntakeContext: User or userData changed');
        
        // If we have user-specific data from Firebase, use that
        if (userData && userData.waterIntake !== undefined) {
            console.log('Found user-specific water intake in userData:', userData.waterIntake);
            setWaterIntake(userData.waterIntake);
            return;
        }

        // Otherwise load from AsyncStorage with user-specific key
        const loadIntake = async () => {
            try {
                // Use user UID as part of the storage key if available
                const storageKey = user ? `@waterIntake_${user.uid}` : '@waterIntake_guest';
                console.log('Attempting to load from AsyncStorage with key:', storageKey);
                
                const saved = await AsyncStorage.getItem(storageKey);
                if (saved) {
                    const parsedIntake = parseInt(saved);
                    console.log('Loaded water intake from AsyncStorage:', parsedIntake);
                    setWaterIntake(parsedIntake);
                } else {
                    console.log('No saved water intake found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setWaterIntake(0);
                }
            } catch (e) {
                console.error('Error loading water intake:', e);
            }
        };
        loadIntake();
    }, [user, userData]);

    // Save intake whenever it changes
    useEffect(() => {
        const saveIntake = async () => {
            try {
                // Skip saving if water intake is 0 and user is not logged in
                if (waterIntake === 0 && !user) {
                    console.log('Skipping save for guest with 0 intake');
                    return;
                }
                
                // Use user UID as part of the storage key if available
                const storageKey = user ? `@waterIntake_${user.uid}` : '@waterIntake_guest';
                await AsyncStorage.setItem(storageKey, waterIntake.toString());
                console.log('Saved to AsyncStorage:', storageKey, '=', waterIntake);
                
                // If user is logged in, also save to Firebase
                if (user) {
                    try {
                        console.log('Saving water intake to Firebase for user:', user.uid, 'Amount:', waterIntake);
                        
                        // Use updateHealthData to only update the waterIntake field without affecting other health data
                        const result = await healthDataOperations.updateHealthData(user.uid, {
                            waterIntake: waterIntake,
                            lastUpdated: Date.now()
                        });
                        
                        if (result.success) {
                            console.log('Successfully saved water intake to Firebase');
                        } else {
                            console.error('Failed to save water intake to Firebase:', result.error);
                        }
                    } catch (error) {
                        console.error('Error saving to Firebase:', error);
                    }
                }
            } catch (e) {
                console.error('Error saving water intake:', e);
            }
        };
        
        // Only save if there's a real change to save
        if (waterIntake !== undefined) {
            saveIntake();
        }
    }, [waterIntake, user]);

    const updateWaterIntake = (newAmount) => {
        // Ensure newAmount is a valid number
        if (isNaN(newAmount) || newAmount < 0) {
            console.warn('Invalid water intake amount:', newAmount);
            return;
        }
        
        // Cap the amount at the daily goal
        const cappedAmount = Math.min(newAmount, dailyGoal);
        
        console.log('Updating water intake:', 
            'User:', user?.uid || 'Guest', 
            'Current:', waterIntake, 
            'New:', cappedAmount, 
            'Percentage:', Math.round((cappedAmount / dailyGoal) * 100)
        );
        
        setWaterIntake(cappedAmount);
    };

    const resetWaterIntake = async () => {
        setWaterIntake(0);
        console.log('Water intake reset to 0');
        
        // Clear AsyncStorage
        try {
            const storageKey = user ? `@waterIntake_${user.uid}` : '@waterIntake_guest';
            await AsyncStorage.removeItem(storageKey);
            
            // If user is logged in, update Firebase too
            if (user) {
                try {
                    await healthDataOperations.updateHealthData(user.uid, {
                        waterIntake: 0,
                        lastUpdated: Date.now()
                    });
                    console.log('Water intake reset in Firebase');
                } catch (error) {
                    console.error('Error resetting water intake in Firebase:', error);
                }
            }
        } catch (e) {
            console.error('Error clearing water intake from storage:', e);
        }
    };

    const percentage = Math.round((waterIntake / dailyGoal) * 100);

    return (
        <WaterIntakeContext.Provider
            value={{
                waterIntake,
                percentage,
                dailyGoal,
                updateWaterIntake,
                resetWaterIntake
            }}
        >
            {children}
        </WaterIntakeContext.Provider>
    );
};

export const useWaterIntake = () => useContext(WaterIntakeContext);