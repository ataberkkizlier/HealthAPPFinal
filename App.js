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
import { auth } from './firebase/config';
import fatSecretService from './services/FatSecretService';

// Firebase config import
import './firebase/config';

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

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <WaterIntakeProvider>
        <StepsProvider>
          <WorkoutProvider>
            <NutritionProvider>
              <ThemeProvider>
                <SafeAreaProvider onLayout={onLayoutRootView}>
                  <AppNavigation />
                </SafeAreaProvider>
              </ThemeProvider>
            </NutritionProvider>
          </WorkoutProvider>
        </StepsProvider>
      </WaterIntakeProvider>
    </AuthProvider>
  );
} 
