import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useCallback, useEffect, useState } from 'react';
import { FONTS } from './constants/fonts';
import AppNavigation from './navigations/AppNavigation';
import { LogBox, Platform } from 'react-native';
import { ThemeProvider } from './theme/ThemeProvider';
import { WaterIntakeProvider } from './context/WaterIntakeContext';
import { AuthProvider } from './context/AuthContext';
import { StepsProvider } from './context/StepsContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { NutritionProvider } from './context/NutritionContext';
import { SleepProvider } from './context/SleepContext';
import { MentalHealthProvider } from './context/MentalHealthContext';
import { auth } from './firebase/config';
import fatSecretService from './services/FatSecretService';
import HealthTracker from './utils/HealthTracker';

// Firebase config import
import './firebase/config';

// Add this error handling utility at the top of the file
// This will suppress the useInsertionEffect warning on logout
const suppressAnimationWarnings = () => {
  // Store the original console.error
  const originalConsoleError = console.error;
  
  // Replace console.error with our custom handler
  console.error = (message, ...args) => {
    // Check if the message contains the specific animation error
    if (typeof message === 'string' && message.includes('useInsertionEffect must not schedule updates')) {
      // Just ignore this specific error
      return;
    }
    
    // Pass other errors to the original console.error
    return originalConsoleError(message, ...args);
  };
};

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts(FONTS);
  const [appReady, setAppReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && appReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appReady]);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize FatSecret API service
        await fatSecretService.initialize();
        console.log('FatSecret API service initialized');
      } catch (error) {
        console.error('Failed to initialize FatSecret service:', error);
      } finally {
        setAppReady(true);
      }
    }
    
    initializeApp();
  }, []);

  // Apply error suppression when the app starts
  useEffect(() => {
    suppressAnimationWarnings();
  }, []);

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <WaterIntakeProvider>
        <StepsProvider>
          <WorkoutProvider>
            <NutritionProvider>
              <SleepProvider>
                <MentalHealthProvider>
                  <ThemeProvider>
                    <SafeAreaProvider onLayout={onLayoutRootView}>
                      <HealthTracker>
                        <AppNavigation />
                      </HealthTracker>
                    </SafeAreaProvider>
                  </ThemeProvider>
                </MentalHealthProvider>
              </SleepProvider>
            </NutritionProvider>
          </WorkoutProvider>
        </StepsProvider>
      </WaterIntakeProvider>
    </AuthProvider>
  );
} 
