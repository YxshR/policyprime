import { MaterialIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import { SplashScreen } from 'expo-splash-screen';
import { useEffect } from 'react';
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
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={NavigationDarkTheme}>
        <Tabs screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarStyle: { backgroundColor: '#1E1E1E', borderTopWidth: 0 },
          tabBarLabelStyle: { fontFamily: 'SpaceMono-Regular' },
          headerStyle: { backgroundColor: '#1E1E1E' },
          headerTintColor: '#FFFFFF',
        }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="policies"
            options={{
              title: 'Policies',
              tabBarIcon: ({ color }) => <MaterialIcons name="policy" size={24} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
              headerShown: false,
            }}
          />
        </Tabs>
      </ThemeProvider>
    </PaperProvider>
  );
}
