import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { MD3DarkTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';

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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={NavigationDarkTheme}>
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
