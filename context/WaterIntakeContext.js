// context/WaterIntakeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WaterIntakeContext = createContext();

export const WaterIntakeProvider = ({ children }) => {
    const [waterIntake, setWaterIntake] = useState(0);
    const dailyGoal = 4000; // 4 liters = 4000ml

    // Load saved intake on app start
    useEffect(() => {
        const loadIntake = async () => {
            try {
                const saved = await AsyncStorage.getItem('@waterIntake');
                console.log('Loaded from AsyncStorage:', saved);
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
    }, []);

    // Save intake whenever it changes
    useEffect(() => {
        const saveIntake = async () => {
            try {
                await AsyncStorage.setItem('@waterIntake', waterIntake.toString());
                console.log('Saved to AsyncStorage:', waterIntake);
            } catch (e) {
                console.log('Error saving water intake:', e);
            }
        };
        saveIntake();
    }, [waterIntake]);

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