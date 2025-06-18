import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, Paragraph, Surface, Title } from 'react-native-paper';
import mongoDBService from './services/mongodb';

export default function HomeScreen() {
  const router = useRouter();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkIfFirstLaunch();
    checkLoginStatus();
  }, []);

  // Use useFocusEffect to check login status when the screen is focused
  useFocusEffect(
    useCallback(() => {
      checkLoginStatus();
    }, [])
  );

  const checkIfFirstLaunch = async () => {
    try {
      const value = await AsyncStorage.getItem('alreadyLaunched');
      if (value === null) {
        setIsFirstLaunch(true);
        AsyncStorage.setItem('alreadyLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const status = await mongoDBService.checkLoginStatus();
      setIsLoggedIn(status.isLoggedIn);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/login');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFirstLaunch(false);
  };

  const onboardingData = [
    {
      title: 'Welcome to PolicyPrime',
      description: 'Your one-stop solution for all LIC policy management and information.',
      image: require('../assets/images/splash-icon.png'),
    },
    {
      title: 'Explore Policies',
      description: 'Browse through various LIC policies and find the perfect plan for your needs.',
      image: require('../assets/images/icon.png'),
    },
    {
      title: 'Secure & Easy',
      description: 'Your data is secure with us. Manage your policies with ease.',
      image: require('../assets/images/adaptive-icon.png'),
    },
  ];

  const renderOnboarding = () => {
  return (
      <View style={styles.onboardingContainer}>
        <StatusBar style="light" />
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.slideContainer}>
          <Image 
            source={onboardingData[currentPage].image} 
            style={styles.onboardingImage} 
            resizeMode="contain"
          />
          <Text style={styles.onboardingTitle}>{onboardingData[currentPage].title}</Text>
          <Text style={styles.onboardingDesc}>{onboardingData[currentPage].description}</Text>
        </View>
        
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
    <View
              key={index} 
              style={[
                styles.paginationDot, 
                index === currentPage ? styles.paginationDotActive : {}
              ]} 
            />
          ))}
        </View>
        
        <View style={styles.buttonContainer}>
          {currentPage < onboardingData.length - 1 ? (
            <Button 
              mode="contained" 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCurrentPage(currentPage + 1);
              }}
              style={styles.nextButton}
              labelStyle={styles.buttonLabel}
            >
              Next
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsFirstLaunch(false);
              }}
              style={styles.getStartedButton}
              labelStyle={styles.buttonLabel}
            >
              Get Started
            </Button>
          )}
        </View>
    </View>
  );
  };

  const renderHomeContent = () => {
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <StatusBar style="light" />
        
        <LinearGradient
          colors={['#4F6CFF', '#6E8AFF']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>
                {isLoggedIn ? 'Welcome back!' : 'Hello there!'}
              </Text>
              <Text style={styles.headerTitle}>PolicyPrime</Text>
            </View>
            
            {!isLoggedIn && (
              <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            )}
            
            {isLoggedIn && (
              <TouchableOpacity onPress={() => router.push('/profile')}>
                <Avatar.Text size={40} label="U" style={styles.avatar} />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.cardContainer}>
          <Surface style={styles.mainCard}>
            <Title style={styles.cardTitle}>LIC Policies</Title>
            <Paragraph style={styles.cardDescription}>
              Explore our range of LIC policies designed to secure your future.
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => router.push('/policies')}
              style={styles.cardButton}
              labelStyle={styles.buttonLabel}
            >
              View Policies
            </Button>
          </Surface>
          
          <Surface style={styles.mainCard}>
            <Title style={styles.cardTitle}>Dashboard</Title>
            <Paragraph style={styles.cardDescription}>
              {isLoggedIn 
                ? 'Check your policy status and premium details.' 
                : 'Login to access your personalized dashboard.'}
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => router.push('/dashboard')}
              style={styles.cardButton}
              labelStyle={styles.buttonLabel}
              disabled={!isLoggedIn}
            >
              Go to Dashboard
            </Button>
          </Surface>
        </View>
        
        <View style={styles.quickLinksContainer}>
          <Title style={styles.sectionTitle}>Quick Links</Title>
          <View style={styles.quickLinksGrid}>
            <TouchableOpacity style={styles.quickLinkItem}>
              <View style={styles.quickLinkIcon}>
                <Text style={styles.iconText}>ℹ️</Text>
              </View>
              <Text style={styles.quickLinkText}>About Us</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickLinkItem}>
              <View style={styles.quickLinkIcon}>
                <Text style={styles.iconText}>📞</Text>
              </View>
              <Text style={styles.quickLinkText}>Contact Us</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickLinkItem}>
              <View style={styles.quickLinkIcon}>
                <Text style={styles.iconText}>❓</Text>
              </View>
              <Text style={styles.quickLinkText}>FAQs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  if (isFirstLaunch === null) {
    return null; // Still loading
  } else if (isFirstLaunch) {
    return renderOnboarding();
  } else {
    return renderHomeContent();
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  avatar: {
    backgroundColor: '#A1B2FF',
  },
  cardContainer: {
    padding: 16,
    gap: 16,
  },
  mainCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    elevation: 4,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 20,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  cardButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  buttonLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quickLinksContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    marginBottom: 16,
    fontSize: 18,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickLinkItem: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  quickLinkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  quickLinkText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Onboarding styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  onboardingImage: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingDesc: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#4F6CFF',
    width: 20,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  nextButton: {
    borderRadius: 30,
    paddingVertical: 8,
  },
  getStartedButton: {
    borderRadius: 30,
    paddingVertical: 8,
    backgroundColor: '#4F6CFF',
  },
});
