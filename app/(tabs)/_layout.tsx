import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import mongoDBService from '../services/mongodb';

export default function TabsLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check login status once on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkLoginStatus = async () => {
      try {
        const { isLoggedIn } = await mongoDBService.checkLoginStatus();
        if (isMounted) {
          setIsLoggedIn(isLoggedIn);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    
    checkLoginStatus();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F6CFF',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { backgroundColor: '#1E1E1E', borderTopWidth: 0 },
        tabBarLabelStyle: { fontFamily: 'SpaceMono-Regular' },
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#FFFFFF',
      }}
    >
      {/* Common tabs for all users */}
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
      
      {/* Conditional tabs based on login status */}
      {isLoggedIn ? (
        <>
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
        </>
      ) : (
        <Tabs.Screen
          name="login"
          options={{
            title: 'Login',
            tabBarIcon: ({ color }) => <MaterialIcons name="login" size={24} color={color} />,
            headerShown: false,
          }}
        />
      )}
    </Tabs>
  );
} 