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
  }, []);

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <WaterIntakeProvider>
        <StepsProvider>
          <ThemeProvider>
            <SafeAreaProvider onLayout={onLayoutRootView}>
              <AppNavigation />
            </SafeAreaProvider>
          </ThemeProvider>
        </StepsProvider>
      </WaterIntakeProvider>
    </AuthProvider>
  );
} 
