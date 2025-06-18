import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Surface, TextInput } from 'react-native-paper';
import mongoDBService from './services/mongodb';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Validate phone (optional)
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number should be 10 digits';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Create user data
      const userData = {
        name,
        phone,
      };

      // Register user with MongoDB service
      await mongoDBService.registerUser(email, password, userData);
      
      // Login the user after successful registration
      const loginResponse = await mongoDBService.loginUser(email, password);
      
      if (loginResponse.success) {
        // Navigate to home screen
        router.replace('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        ...errors,
        general: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join PolicyPrime today</Text>
        </LinearGradient>

        <Surface style={styles.formContainer}>
          {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            error={!!errors.name}
          />
          {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
          
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            error={!!errors.email}
          />
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
          
          <TextInput
            label="Phone Number (Optional)"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
            error={!!errors.phone}
          />
          {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!passwordVisible}
            error={!!errors.password}
            right={
              <TextInput.Icon 
                icon={passwordVisible ? "eye-off" : "eye"} 
                onPress={togglePasswordVisibility} 
              />
            }
          />
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!confirmPasswordVisible}
            error={!!errors.confirmPassword}
            right={
              <TextInput.Icon 
                icon={confirmPasswordVisible ? "eye-off" : "eye"} 
                onPress={toggleConfirmPasswordVisibility} 
              />
            }
          />
          {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}
          
          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.signupButton}
            labelStyle={styles.buttonLabel}
            loading={isLoading}
            disabled={isLoading}
          >
            Create Account
          </Button>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('login')}>
              <Text style={styles.loginLink}>Login</Text>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  errorText: {
    color: '#CF6679',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  fieldError: {
    color: '#CF6679',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 8,
  },
  signupButton: {
    borderRadius: 30,
    paddingVertical: 6,
    backgroundColor: '#4F6CFF',
    marginTop: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loginLink: {
    color: '#4F6CFF',
    fontWeight: '600',
  },
}); 