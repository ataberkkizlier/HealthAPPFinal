import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const SleepContext = createContext();

// Recommended sleep hours per night is 8 hours
const RECOMMENDED_SLEEP_HOURS = 8;

export const SleepProvider = ({ children }) => {
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepQualityPercentage, setSleepQualityPercentage] = useState(0);
  const [sleepHistory, setSleepHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, saveHealthData } = useAuth();

  // Load sleep data from storage on mount
  useEffect(() => {
    const loadSleepData = async () => {
      try {
        const storedSleepHours = await AsyncStorage.getItem('sleepHours');
        const storedSleepPercentage = await AsyncStorage.getItem('sleepQualityPercentage');
        const storedSleepHistory = await AsyncStorage.getItem('sleepHistory');

        if (storedSleepHours) {
          setSleepHours(parseFloat(storedSleepHours));
        }

        if (storedSleepPercentage) {
          setSleepQualityPercentage(parseFloat(storedSleepPercentage));
        }

        if (storedSleepHistory) {
          setSleepHistory(JSON.parse(storedSleepHistory));
        }
      } catch (error) {
        console.error('Error loading sleep data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSleepData();
  }, []);

  // Save sleep data to storage whenever it changes
  useEffect(() => {
    const saveSleepData = async () => {
      try {
        await AsyncStorage.setItem('sleepHours', sleepHours.toString());
        await AsyncStorage.setItem('sleepQualityPercentage', sleepQualityPercentage.toString());
        await AsyncStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));
      } catch (error) {
        console.error('Error saving sleep data:', error);
      }
    };

    if (!loading) {
      saveSleepData();
    }
  }, [sleepHours, sleepQualityPercentage, sleepHistory, loading]);

  // Update sleep hours and calculate percentage
  const updateSleepHours = (hours) => {
    const parsedHours = parseFloat(hours);

    if (!isNaN(parsedHours) && parsedHours >= 0) {
      setSleepHours(parsedHours);
      
      // Calculate sleep quality percentage (8 hours = 100%)
      const percentage = Math.min(100, Math.round((parsedHours / RECOMMENDED_SLEEP_HOURS) * 100));
      setSleepQualityPercentage(percentage);

      // Update sleep history with the latest entry
      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
      
      const newEntry = {
        id: Date.now().toString(),
        date: today.toISOString(),
        day: dayOfWeek,
        hours: parsedHours,
        percentage: percentage
      };

      // Add to history, keeping only the last 7 days
      setSleepHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(entry => 
          new Date(entry.date).toDateString() !== today.toDateString()
        );

        return [...filteredHistory, newEntry].slice(-7);
      });

      // Save to Firebase healthData if user is logged in
      if (user && saveHealthData) {
        saveHealthData({ sleepHours: parsedHours });
      }
    }
  };

  // Update the sleep quality percentage directly
  const updateSleepQualityPercentage = (percentage) => {
    const parsedPercentage = parseInt(percentage);
    
    if (!isNaN(parsedPercentage) && parsedPercentage >= 0 && parsedPercentage <= 100) {
      setSleepQualityPercentage(parsedPercentage);
      
      // Calculate corresponding sleep hours
      const hours = (parsedPercentage / 100) * RECOMMENDED_SLEEP_HOURS;
      setSleepHours(parseFloat(hours.toFixed(1)));
    }
  };

  // Reset sleep data
  const resetSleep = async () => {
    try {
      setSleepHours(0);
      setSleepQualityPercentage(0);
      setSleepHistory([]); // Clear weekly sleep history
      await AsyncStorage.setItem('sleepHours', '0');
      await AsyncStorage.setItem('sleepQualityPercentage', '0');
      await AsyncStorage.setItem('sleepHistory', '[]'); // Clear from storage
      console.log('Sleep data reset to 0');
      // Save to Firebase healthData if user is logged in
      if (user && saveHealthData) {
        saveHealthData({ sleepHours: 0 });
      }
    } catch (error) {
      console.error('Error resetting sleep data:', error);
    }
  };

  return (
    <SleepContext.Provider value={{
      sleepHours,
      sleepQualityPercentage,
      sleepHistory,
      updateSleepHours,
      updateSleepQualityPercentage,
      resetSleep,
      recommendedSleepHours: RECOMMENDED_SLEEP_HOURS
    }}>
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = () => {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error('useSleep must be used within a SleepProvider');
  }
  return context;
}; 