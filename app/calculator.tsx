import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Divider, Paragraph, Surface, TextInput, Title } from 'react-native-paper';

export default function CalculatorScreen() {
  const router = useRouter();
  const { policyId, categoryId } = useLocalSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  
  // Form fields
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [sumAssured, setSumAssured] = useState('1000000');
  const [term, setTerm] = useState('20');
  const [paymentFrequency, setPaymentFrequency] = useState('annual');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
      setLoading(false);
    } catch (error) {
      console.error('Error checking login status:', error);
      setLoading(false);
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('login');
  };

  const calculatePremium = () => {
    if (!isLoggedIn) {
      handleLogin();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCalculating(true);
    setResult(null);

    // In a real app, you would call MongoDB to calculate the premium
    // For demo purposes, we'll simulate a calculation
    setTimeout(() => {
      // Simple premium calculation formula (for demonstration only)
      const ageValue = parseInt(age, 10);
      const sumAssuredValue = parseInt(sumAssured, 10);
      const termValue = parseInt(term, 10);
      
      // Base rate per 1000 of sum assured
      let baseRate = 0;
      
      // Different rates based on policy category
      switch (categoryId) {
        case 'endowment':
          baseRate = 45;
          break;
        case 'wholelife':
          baseRate = 55;
          break;
        case 'moneyback':
          baseRate = 40;
          break;
        case 'term':
          baseRate = 5;
          break;
        default:
          baseRate = 30;
      }
      
      // Age factor
      const ageFactor = 1 + (ageValue - 20) * 0.03;
      
      // Gender factor
      const genderFactor = gender === 'male' ? 1.1 : 1;
      
      // Term factor
      const termFactor = 1 - (termValue - 10) * 0.01;
      
      // Calculate annual premium
      let annualPremium = (sumAssuredValue / 1000) * baseRate * ageFactor * genderFactor * termFactor;
      
      // Adjust for payment frequency
      let finalPremium = 0;
      let frequencyText = '';
      
      switch (paymentFrequency) {
        case 'annual':
          finalPremium = annualPremium;
          frequencyText = 'Annual';
          break;
        case 'semiannual':
          finalPremium = annualPremium * 0.51;
          frequencyText = 'Semi-Annual';
          break;
        case 'quarterly':
          finalPremium = annualPremium * 0.26;
          frequencyText = 'Quarterly';
          break;
        case 'monthly':
          finalPremium = annualPremium * 0.09;
          frequencyText = 'Monthly';
          break;
      }
      
      setResult({
        premium: Math.round(finalPremium),
        frequency: frequencyText,
        totalAnnual: Math.round(annualPremium),
      });
      
      setCalculating(false);
    }, 1500);
  };

  const formatCurrency = (value) => {
    return '₹' + parseInt(value).toLocaleString('en-IN');
  };

  const renderLoginPrompt = () => (
    <Surface style={styles.loginPromptContainer}>
      <Title style={styles.loginPromptTitle}>Premium Calculator</Title>
      <Paragraph style={styles.loginPromptText}>
        Please log in to use the premium calculator and explore policy options.
      </Paragraph>
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.loginButton}
        labelStyle={styles.buttonLabel}
      >
        Login to Continue
      </Button>
    </Surface>
  );

  const renderCalculator = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.calculatorContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Surface style={styles.calculatorCard}>
          <Title style={styles.calculatorTitle}>Premium Calculator</Title>
          <Paragraph style={styles.calculatorDescription}>
            Calculate your estimated premium based on your details.
          </Paragraph>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Age</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={65}
                step={1}
                value={parseInt(age, 10)}
                onValueChange={(value) => setAge(value.toString())}
                minimumTrackTintColor="#4F6CFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#4F6CFF"
              />
              <Text style={styles.sliderValue}>{age} years</Text>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  gender === 'male' && styles.radioButtonActive
                ]}
                onPress={() => setGender('male')}
              >
                <Text
                  style={[
                    styles.radioText,
                    gender === 'male' && styles.radioTextActive
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  gender === 'female' && styles.radioButtonActive
                ]}
                onPress={() => setGender('female')}
              >
                <Text
                  style={[
                    styles.radioText,
                    gender === 'female' && styles.radioTextActive
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Sum Assured</Text>
            <TextInput
              style={styles.input}
              mode="outlined"
              value={sumAssured}
              onChangeText={setSumAssured}
              keyboardType="numeric"
              left={<TextInput.Affix text="₹" />}
            />
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={100000}
                maximumValue={10000000}
                step={100000}
                value={parseInt(sumAssured, 10)}
                onValueChange={(value) => setSumAssured(value.toString())}
                minimumTrackTintColor="#4F6CFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#4F6CFF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>1 Lakh</Text>
                <Text style={styles.sliderLabel}>1 Crore</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Policy Term</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={40}
                step={1}
                value={parseInt(term, 10)}
                onValueChange={(value) => setTerm(value.toString())}
                minimumTrackTintColor="#4F6CFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#4F6CFF"
              />
              <Text style={styles.sliderValue}>{term} years</Text>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Frequency</Text>
            <View style={styles.frequencyContainer}>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'monthly' && styles.frequencyButtonActive
                ]}
                onPress={() => setPaymentFrequency('monthly')}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    paymentFrequency === 'monthly' && styles.frequencyTextActive
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'quarterly' && styles.frequencyButtonActive
                ]}
                onPress={() => setPaymentFrequency('quarterly')}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    paymentFrequency === 'quarterly' && styles.frequencyTextActive
                  ]}
                >
                  Quarterly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'semiannual' && styles.frequencyButtonActive
                ]}
                onPress={() => setPaymentFrequency('semiannual')}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    paymentFrequency === 'semiannual' && styles.frequencyTextActive
                  ]}
                >
                  Semi-Annual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  paymentFrequency === 'annual' && styles.frequencyButtonActive
                ]}
                onPress={() => setPaymentFrequency('annual')}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    paymentFrequency === 'annual' && styles.frequencyTextActive
                  ]}
                >
                  Annual
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={calculatePremium}
            style={styles.calculateButton}
            labelStyle={styles.buttonLabel}
            loading={calculating}
            disabled={calculating}
          >
            Calculate Premium
          </Button>
        </Surface>
        
        {result && (
          <Surface style={styles.resultCard}>
            <Title style={styles.resultTitle}>Premium Estimate</Title>
            <View style={styles.premiumContainer}>
              <Text style={styles.premiumAmount}>
                {formatCurrency(result.premium)}
              </Text>
              <Text style={styles.premiumFrequency}>
                {result.frequency}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.resultDetail}>
              <Text style={styles.resultLabel}>Annual Premium:</Text>
              <Text style={styles.resultValue}>{formatCurrency(result.totalAnnual)}</Text>
            </View>
            
            <View style={styles.resultDetail}>
              <Text style={styles.resultLabel}>Sum Assured:</Text>
              <Text style={styles.resultValue}>{formatCurrency(sumAssured)}</Text>
            </View>
            
            <View style={styles.resultDetail}>
              <Text style={styles.resultLabel}>Policy Term:</Text>
              <Text style={styles.resultValue}>{term} years</Text>
            </View>
            
            <Button
              mode="contained"
              onPress={() => router.push('policies')}
              style={styles.viewPoliciesButton}
              labelStyle={styles.buttonLabel}
            >
              View All Policies
            </Button>
          </Surface>
        )}
        
        <Surface style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            The premium calculated is an estimate and may vary based on additional factors. 
            Please contact our customer support for the exact premium amount.
          </Text>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#4F6CFF', '#6E8AFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Calculator</Text>
      </LinearGradient>
      
      {isLoggedIn ? renderCalculator() : renderLoginPrompt()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'relative',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginPromptContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  loginPromptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  loginPromptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    lineHeight: 24,
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
  calculatorContainer: {
    flex: 1,
    padding: 16,
  },
  calculatorCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calculatorDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sliderContainer: {
    marginVertical: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    color: '#4F6CFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 12,
  },
  radioButtonActive: {
    backgroundColor: '#4F6CFF',
    borderColor: '#4F6CFF',
  },
  radioText: {
    color: '#FFFFFF',
  },
  radioTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    marginBottom: 10,
  },
  frequencyButtonActive: {
    backgroundColor: '#4F6CFF',
    borderColor: '#4F6CFF',
  },
  frequencyText: {
    color: '#FFFFFF',
  },
  frequencyTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calculateButton: {
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#4F6CFF',
  },
  resultCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  premiumContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F6CFF',
    marginBottom: 4,
  },
  premiumFrequency: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  resultDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resultValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  viewPoliciesButton: {
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#4F6CFF',
  },
  disclaimerCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
}); 