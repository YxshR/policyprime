import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Checkbox, Surface, TextInput } from 'react-native-paper';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // In a real app, you would validate credentials with MongoDB
      // For demo purposes, we'll simulate a successful login
      const userToken = 'demo-token-123';
      
      // Store token securely
      await SecureStore.setItemAsync('userToken', userToken);
      
      // If remember me is checked, store the email for next login
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('userToken', userToken);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
      }
      
      // Navigate to home screen
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('signup');
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#4F6CFF', '#6E8AFF']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>PolicyPrime</Text>
          <Text style={styles.subtitle}>Secure your future with us</Text>
        </LinearGradient>

        <Surface style={styles.formContainer}>
          <Text style={styles.formTitle}>Login</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TextInput
            label="Email or Phone"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!passwordVisible}
            right={
              <TextInput.Icon 
                icon={passwordVisible ? "eye-off" : "eye"} 
                onPress={togglePasswordVisibility} 
              />
            }
          />
          
          <View style={styles.rememberContainer}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color="#4F6CFF"
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </View>
            
            <TouchableOpacity onPress={() => router.push('forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            labelStyle={styles.buttonLabel}
            loading={isLoading}
            disabled={isLoading}
          >
            Login
          </Button>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <Button
            mode="outlined"
            onPress={() => router.replace('/')}
            style={styles.skipButton}
            labelStyle={styles.skipButtonLabel}
          >
            Continue as Guest
          </Button>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#1E1E1E',
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#CF6679',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#FFFFFF',
    marginLeft: 8,
  },
  forgotText: {
    color: '#4F6CFF',
  },
  loginButton: {
    borderRadius: 30,
    paddingVertical: 6,
    backgroundColor: '#4F6CFF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 10,
  },
  skipButton: {
    borderRadius: 30,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  skipButtonLabel: {
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  signupLink: {
    color: '#4F6CFF',
    fontWeight: '600',
  },
}); 