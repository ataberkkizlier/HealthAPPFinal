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
        // If we have user-specific data from Firebase, use that
        if (userData && userData.waterIntake) {
            setWaterIntake(userData.waterIntake);
            console.log('Loaded user-specific water intake from Firebase:', userData.waterIntake);
            return;
        }

        // Otherwise load from AsyncStorage with user-specific key
        const loadIntake = async () => {
            try {
                // Use user UID as part of the storage key if available
                const storageKey = user ? `@waterIntake_${user.uid}` : '@waterIntake_guest';
                const saved = await AsyncStorage.getItem(storageKey);
                console.log('Loaded from AsyncStorage with key:', storageKey, 'value:', saved);
                
                if (saved) {
                    const parsedIntake = parseInt(saved);
                    setWaterIntake(parsedIntake);
                    console.log('Set waterIntake after load:', parsedIntake);
                }
            } catch (e) {
                console.log('Error loading water intake:', e);
            }
        };
        loadIntake();
    }, [user, userData]);

    // Save intake whenever it changes
    useEffect(() => {
        const saveIntake = async () => {
            try {
                // Only save to AsyncStorage if there's a change in value
                if (waterIntake === 0 && !user) return;
                
                // Use user UID as part of the storage key if available
                const storageKey = user ? `@waterIntake_${user.uid}` : '@waterIntake_guest';
                await AsyncStorage.setItem(storageKey, waterIntake.toString());
                console.log('Saved to AsyncStorage with key:', storageKey, 'value:', waterIntake);
                
                // If user is logged in, also save to Firebase
                if (user) {
                    try {
                        await healthDataOperations.updateHealthData(user.uid, {
                            waterIntake: waterIntake
                        });
                        console.log('Saved water intake to Firebase for user:', user.uid);
                    } catch (error) {
                        console.error('Error saving to Firebase:', error);
                    }
                }
            } catch (e) {
                console.log('Error saving water intake:', e);
            }
        };
        saveIntake();
    }, [waterIntake, user]);

    const updateWaterIntake = (newAmount) => {
        const cappedAmount = Math.min(newAmount, dailyGoal);
        setWaterIntake(cappedAmount);
        console.log('Updated waterIntake:', cappedAmount, 'Percentage:', Math.round((cappedAmount / dailyGoal) * 100));
    };

    const percentage = Math.round((waterIntake / dailyGoal) * 100);

    return (
        <WaterIntakeContext.Provider
            value={{
                waterIntake,
                percentage,
                dailyGoal,
                updateWaterIntake
            }}
        >
            {children}
        </WaterIntakeContext.Provider>
    );
};

export const useWaterIntake = () => useContext(WaterIntakeContext);