import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import mongoDBService from '../services/mongodb';

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, redirects to login if not authenticated
  redirectIfAuth?: boolean; // If true, redirects to home if authenticated
  redirectTo?: string; // Custom redirect path
};

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  redirectIfAuth = false,
  redirectTo 
}: AuthGuardProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const status = await mongoDBService.checkLoginStatus();
        setIsLoggedIn(status.isLoggedIn);

        // Handle redirects based on authentication status
        if (status.isLoggedIn && redirectIfAuth) {
          // Redirect authenticated users (e.g., from login/signup pages)
          router.replace(redirectTo || '/' as any);
        } else if (!status.isLoggedIn && requireAuth) {
          // Redirect unauthenticated users (e.g., from protected pages)
          router.replace(redirectTo || '/login' as any);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [router, requireAuth, redirectIfAuth, redirectTo]);

  // Handle back button for Android
  useEffect(() => {
    const backAction = () => {
      // If we're on a protected page and user isn't logged in, or
      // if we're on login/signup page and user is logged in,
      // prevent going back
      if ((requireAuth && !isLoggedIn) || (redirectIfAuth && isLoggedIn)) {
        return true; // Prevents default back action
      }
      return false; // Allows default back action
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isLoggedIn, requireAuth, redirectIfAuth]);

  // Show loading indicator while checking authentication status
  if (isLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CFF" />
      </View>
    );
  }

  // If we've passed the auth checks, render the children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
}); 