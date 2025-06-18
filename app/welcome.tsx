import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import mongoDBService from './services/mongodb';

const { width, height } = Dimensions.get('window');

// Prevent unnecessary re-renders
const WelcomeScreen = React.memo(() => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const skipButtonOpacity = useRef(new Animated.Value(0)).current;
  const screenPosition = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const pulsing = useRef(new Animated.Value(1)).current;
  
  // Start pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsing, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulsing, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulsing]);
  
  // Animation sequences
  const startLogoAnimation = useCallback(() => {
    return Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
  }, [logoOpacity, logoScale]);
  
  const startTitleAnimation = useCallback(() => {
    return Animated.sequence([
      Animated.delay(500),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(descriptionOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
  }, [titleOpacity, descriptionOpacity]);
  
  const startButtonAnimation = useCallback(() => {
    return Animated.parallel([
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(skipButtonOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);
  }, [buttonOpacity, skipButtonOpacity]);
  
  const startPopupAnimation = useCallback(() => {
    return Animated.timing(popupOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });
  }, [popupOpacity]);

  // Check login status only once when component mounts
  useEffect(() => {
    let isMounted = true;
    let homeTimeout: ReturnType<typeof setTimeout> | null = null;
    let popupTimeout: ReturnType<typeof setTimeout> | null = null;
    let buttonTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const checkLogin = async () => {
      try {
        const { isLoggedIn, tokenExpired: isTokenExpired } = await mongoDBService.checkLoginStatus();
        
        if (!isMounted) return;
        
        // Start logo animation
        startLogoAnimation().start();
        startTitleAnimation().start();
        
        if (isLoggedIn) {
          // User is logged in, navigate to home after animation
          homeTimeout = setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
              router.replace('/');
            }
          }, 3000);
        } else if (isTokenExpired) {
          // Token expired, show popup
          if (isMounted) {
            setTokenExpired(true);
            popupTimeout = setTimeout(() => {
              if (isMounted) {
                startPopupAnimation().start();
                setIsLoading(false);
              }
            }, 1500);
          }
        } else {
          // New user or not logged in
          buttonTimeout = setTimeout(() => {
            if (isMounted) {
              startButtonAnimation().start();
              setIsLoading(false);
            }
          }, 1500);
        }
        
        if (isMounted) {
          setCheckComplete(true);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        if (isMounted) {
          setIsLoading(false);
          setCheckComplete(true);
        }
      }
    };
    
    checkLogin();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (homeTimeout) clearTimeout(homeTimeout);
      if (popupTimeout) clearTimeout(popupTimeout);
      if (buttonTimeout) clearTimeout(buttonTimeout);
    };
  }, [startLogoAnimation, startTitleAnimation, startButtonAnimation, startPopupAnimation, router]);

  const handleLogin = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate screen sliding up
    Animated.timing(screenPosition, {
      toValue: -height,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      router.push('/login');
    });
  }, [screenPosition, router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/');
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#2A3267', '#4F6CFF', '#1E1E1E']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: 1,
              transform: [{ translateY: screenPosition }]
            }
          ]}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { scale: pulsing }
                ]
              }
            ]}
          >
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          
          <Animated.Text style={[styles.appTitle, { opacity: titleOpacity }]}>
            PolicyPrime
          </Animated.Text>
          
          <Animated.Text style={[styles.appDescription, { opacity: descriptionOpacity }]}>
            Your one-stop solution for managing LIC insurance policies
          </Animated.Text>
          
          {tokenExpired && checkComplete && (
            <Animated.View 
              style={[
                styles.popup,
                { opacity: popupOpacity }
              ]}
            >
              <Text style={styles.popupTitle}>Logged Out</Text>
              <Text style={styles.popupMessage}>Your session has expired. Please login again.</Text>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.popupButton}
                labelStyle={styles.buttonLabel}
                icon="login"
              >
                Login
              </Button>
            </Animated.View>
          )}
          
          {!isLoading && !tokenExpired && checkComplete && (
            <>
              <Animated.View 
                style={[
                  styles.skipButtonContainer,
                  { opacity: skipButtonOpacity }
                ]}
              >
                <TouchableOpacity onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.loginButtonContainer,
                  { opacity: buttonOpacity }
                ]}
              >
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  labelStyle={styles.buttonLabel}
                  icon="login"
                >
                  Login
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handleSkip}
                  style={styles.guestButton}
                  labelStyle={styles.guestButtonLabel}
                  icon="account"
                >
                  Continue as Guest
                </Button>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </LinearGradient>
    </View>
  );
});

// Default export
export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#4F6CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  skipButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonContainer: {
    position: 'absolute',
    bottom: 60,
    width: '90%',
  },
  loginButton: {
    borderRadius: 30,
    paddingVertical: 8,
    backgroundColor: '#4F6CFF',
    marginBottom: 15,
    elevation: 5,
  },
  guestButton: {
    borderRadius: 30,
    paddingVertical: 8,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  guestButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  popup: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  popupTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  popupMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  popupButton: {
    borderRadius: 30,
    paddingVertical: 8,
    backgroundColor: '#4F6CFF',
    width: '100%',
  },
}); 