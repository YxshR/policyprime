import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { MD3DarkTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import mongoDBService from './services/mongodb';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create custom theme
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4F6CFF',
    secondary: '#6E8AFF',
    tertiary: '#A1B2FF',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#CF6679',
    text: '#FFFFFF',
    onSurface: '#FFFFFF',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0,0,0,0.5)',
    notification: '#FF80AB',
  },
};

const { LightTheme, DarkTheme: NavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Get current route name from pathname
  const currentRoute = pathname?.split('/').filter(Boolean)[0] || '';

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Check login status when app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const status = await mongoDBService.checkLoginStatus();
        setIsLoggedIn(status.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If user is logged in and trying to go back to login/signup screen, redirect to home
      if (isLoggedIn && (currentRoute === 'login' || currentRoute === 'signup')) {
        router.replace('/');
        return true; // Prevent default behavior
      }
      return false; // Let default behavior happen
    });

    return () => backHandler.remove();
  }, [isLoggedIn, currentRoute, router]);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            gestureEnabled: !isLoggedIn, // Disable gesture navigation if logged in
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: false,
            gestureEnabled: !isLoggedIn, // Disable gesture navigation if logged in
          }} 
        />
        <Stack.Screen name="profile" />
        <Stack.Screen name="policies" />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
