// context/StepsContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const StepsContext = createContext();

export const StepsProvider = ({ children }) => {
    const [steps, setSteps] = useState(0);
    const dailyGoal = 10000;
    const { user, saveHealthData } = useAuth();

    useEffect(() => {
        const loadSteps = async () => {
            try {
                const saved = await AsyncStorage.getItem('@steps');
                console.log('Loaded steps from AsyncStorage:', saved);
                if (saved) {
                    const parsedSteps = parseInt(saved);
                    setSteps(parsedSteps);
                    console.log('Set steps after load:', parsedSteps);
                }
            } catch (e) {
                console.log('Error loading steps:', e);
            }
        };
        loadSteps();
    }, []);

    useEffect(() => {
        const saveSteps = async () => {
            try {
                await AsyncStorage.setItem('@steps', steps.toString());
                console.log('Saved steps to AsyncStorage:', steps);
            } catch (e) {
                console.log('Error saving steps:', e);
            }
        };
        saveSteps();
    }, [steps]);

    const updateSteps = (newAmount) => {
        const cappedAmount = Math.min(newAmount, 50000);
        setSteps(cappedAmount);
        console.log('Updated steps:', cappedAmount);
        // Save to Firebase healthData if user is logged in
        if (user && saveHealthData) {
            saveHealthData({ dailySteps: cappedAmount });
        }
    };

    const resetSteps = () => {
        setSteps(0);
        console.log('Steps reset to 0');
        // Save to Firebase healthData if user is logged in
        if (user && saveHealthData) {
            saveHealthData({ dailySteps: 0 });
        }
    };

    return (
        <StepsContext.Provider
            value={{
                steps,
                dailyGoal,
                updateSteps,
                resetSteps
            }}
        >
            {children}
        </StepsContext.Provider>
    );
};

export const useSteps = () => useContext(StepsContext);