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
import { auth } from './firebase/config';

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
    setAppReady(true);
    
    // We don't need to test database here anymore, as it's handled by AuthContext
    // when a user logs in
  }, []);

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <WaterIntakeProvider>
        <StepsProvider>
          <WorkoutProvider>
            <ThemeProvider>
              <SafeAreaProvider onLayout={onLayoutRootView}>
                <AppNavigation />
              </SafeAreaProvider>
            </ThemeProvider>
          </WorkoutProvider>
        </StepsProvider>
      </WaterIntakeProvider>
    </AuthProvider>
  );
} 
