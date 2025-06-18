import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Divider, Paragraph, Snackbar, Surface, TextInput, Title } from 'react-native-paper';
import mongoDBService from './services/mongodb';

// Define types
type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  [key: string]: any;
};

type CalculationResult = {
  premium: number;
  frequency: string;
  totalAnnual: number;
};

type Policy = {
  id: string;
  name: string;
  planNo: string;
  uinNo: string;
};

export default function CalculatorScreen() {
  const router = useRouter();
  const { policyId, categoryId } = useLocalSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSinglePremiumEndowmentPlan, setIsSinglePremiumEndowmentPlan] = useState(false);
  
  // Form fields
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [sumAssured, setSumAssured] = useState('100000');
  const [term, setTerm] = useState('10');
  const [paymentFrequency, setPaymentFrequency] = useState('annual');
  const [calculationName, setCalculationName] = useState('');

  useEffect(() => {
    checkLoginStatus();
    fetchPolicyDetails();
  }, [policyId, categoryId]);

  const checkLoginStatus = async () => {
    try {
      const status = await mongoDBService.checkLoginStatus();
      setIsLoggedIn(status.isLoggedIn);
      if (status.isLoggedIn && status.user) {
        setUser(status.user);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking login status:', error);
      setLoading(false);
    }
  };

  const fetchPolicyDetails = async () => {
    if (policyId && categoryId) {
      try {
        const policyDetails = await mongoDBService.getPolicyById(policyId as string, categoryId as string);
        if (policyDetails) {
          setPolicy(policyDetails);
          
          // Check if this is the Single Premium Endowment Plan
          const isSPEP = policyDetails.name === "LIC's Single Premium Endowment Plan";
          setIsSinglePremiumEndowmentPlan(isSPEP);
          
          if (!isSPEP) {
            // Show message that only Single Premium Endowment Plan is supported
            setSnackbarMessage("Currently, only LIC's Single Premium Endowment Plan calculator is supported.");
            setSnackbarVisible(true);
            
            // Set a timeout to navigate back
            setTimeout(() => {
              router.back();
            }, 3000);
          }
          
          // Set appropriate default term based on policy type
          if (categoryId === 'endowment') {
            setTerm('10');
          } else if (categoryId === 'wholelife') {
            setTerm('20');
          } else if (categoryId === 'moneyback') {
            setTerm('15');
          } else if (categoryId === 'term') {
            setTerm('25');
          }
        }
      } catch (error) {
        console.error('Error fetching policy details:', error);
      }
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/login');
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateDaysOld = (birthDate: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isValidAge = (birthDate: Date): boolean => {
    const daysOld = calculateDaysOld(birthDate);
    const yearsOld = calculateAge(birthDate);
    
    return daysOld >= 30 && yearsOld <= 65;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      // Check if age is within valid range
      if (isValidAge(selectedDate)) {
        setBirthDate(selectedDate);
        const yearsOld = calculateAge(selectedDate);
        setAge(yearsOld.toString());
      } else {
        setSnackbarMessage('Age must be between 30 days and 65 years');
        setSnackbarVisible(true);
      }
    }
  };

  const calculatePremium = () => {
    if (!isLoggedIn) {
      handleLogin();
      return;
    }

    // Only allow calculations for Single Premium Endowment Plan
    if (!isSinglePremiumEndowmentPlan) {
      setSnackbarMessage("Currently, only LIC's Single Premium Endowment Plan calculator is supported.");
      setSnackbarVisible(true);
      return;
    }

    // Validate age
    const ageInDays = calculateDaysOld(birthDate);
    if (ageInDays < 30) {
      setSnackbarMessage("Age must be at least 30 days.");
      setSnackbarVisible(true);
      return;
    }
    
    const ageInYears = calculateAge(birthDate);
    if (ageInYears > 65) {
      setSnackbarMessage("Age must not exceed 65 years.");
      setSnackbarVisible(true);
      return;
    }

    // Validate sum assured (only check if it's a valid number)
    const sumAssuredValue = parseInt(sumAssured, 10);
    if (isNaN(sumAssuredValue) || sumAssuredValue <= 0) {
      setSnackbarMessage("Please enter a valid sum assured amount.");
      setSnackbarVisible(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCalculating(true);
    setResult(null);

    setTimeout(() => {
      const termValue = parseInt(term, 10);
      
      // Base premium calculation
      let premium = 0;
      
      // Use the sample premium rates from the brochure for Single Premium Endowment Plan
      if (termValue === 10) {
        if (ageInYears <= 10) premium = 77910;
        else if (ageInYears <= 20) premium = 77985;
        else if (ageInYears <= 30) premium = 78010;
        else if (ageInYears <= 40) premium = 78180;
        else if (ageInYears <= 50) premium = 78800;
        else if (ageInYears <= 60) premium = 79965;
        else premium = 80000;
      } else if (termValue === 15) {
        if (ageInYears <= 10) premium = 66650;
        else if (ageInYears <= 20) premium = 66775;
        else if (ageInYears <= 30) premium = 66865;
        else if (ageInYears <= 40) premium = 67335;
        else if (ageInYears <= 50) premium = 68800;
        else if (ageInYears <= 60) premium = 71405;
        else premium = 72000;
      } else if (termValue === 25) {
        if (ageInYears <= 10) premium = 50005;
        else if (ageInYears <= 20) premium = 50255;
        else if (ageInYears <= 30) premium = 50695;
        else if (ageInYears <= 40) premium = 52340;
        else if (ageInYears <= 50) premium = 56160;
        else premium = 58000;
      } else {
        // For other terms, interpolate between the known values
        if (termValue < 10) {
          premium = 80000; // Higher premium for shorter terms
        } else if (termValue > 10 && termValue < 15) {
          const factor = (termValue - 10) / 5;
          if (ageInYears <= 10) premium = 77910 - factor * (77910 - 66650);
          else if (ageInYears <= 20) premium = 77985 - factor * (77985 - 66775);
          else if (ageInYears <= 30) premium = 78010 - factor * (78010 - 66865);
          else if (ageInYears <= 40) premium = 78180 - factor * (78180 - 67335);
          else if (ageInYears <= 50) premium = 78800 - factor * (78800 - 68800);
          else if (ageInYears <= 60) premium = 79965 - factor * (79965 - 71405);
          else premium = 80000 - factor * (80000 - 72000);
        } else if (termValue > 15 && termValue < 25) {
          const factor = (termValue - 15) / 10;
          if (ageInYears <= 10) premium = 66650 - factor * (66650 - 50005);
          else if (ageInYears <= 20) premium = 66775 - factor * (66775 - 50255);
          else if (ageInYears <= 30) premium = 66865 - factor * (66865 - 50695);
          else if (ageInYears <= 40) premium = 67335 - factor * (67335 - 52340);
          else if (ageInYears <= 50) premium = 68800 - factor * (68800 - 56160);
          else if (ageInYears <= 60) premium = 71405 - factor * (71405 - 58000);
          else premium = 72000 - factor * (72000 - 58000);
        }
      }
      
      // Scale premium based on sum assured (rates are for 1 lakh)
      premium = (premium / 100000) * sumAssuredValue;
      
      // Apply high sum assured rebate
      let rebate = 0;
      if (sumAssuredValue >= 200000 && sumAssuredValue < 300000) {
        rebate = 0.02 * sumAssuredValue; // 20%o of BSA
      } else if (sumAssuredValue >= 300000 && sumAssuredValue < 500000) {
        rebate = 0.03 * sumAssuredValue; // 30%o of BSA
      } else if (sumAssuredValue >= 500000) {
        rebate = 0.04 * sumAssuredValue; // 40%o of BSA
      }
      
      premium -= rebate;
      
      setResult({
        premium: Math.round(premium),
        frequency: 'Single Premium',
        totalAnnual: Math.round(premium),
      });
      
      setCalculating(false);
    }, 1000);
  };

  const saveCalculation = async () => {
    if (!isSinglePremiumEndowmentPlan) {
      setSnackbarMessage("Currently, only LIC's Single Premium Endowment Plan calculator is supported.");
      setSnackbarVisible(true);
      return;
    }
    
    if (!calculationName.trim()) {
      setSnackbarMessage('Please enter a name for this calculation');
      setSnackbarVisible(true);
      return;
    }

    if (!result) {
      setSnackbarMessage('Please calculate premium first');
      setSnackbarVisible(true);
      return;
    }

    // Validate sum assured
    const sumAssuredValue = parseInt(sumAssured, 10);
    if (isNaN(sumAssuredValue) || sumAssuredValue <= 0) {
      setSnackbarMessage("Please enter a valid sum assured amount.");
      setSnackbarVisible(true);
      return;
    }

    try {
      // Save calculation using MongoDB service
      const ageInYears = calculateAge(birthDate);
      
      const calculationData = {
        name: calculationName,
        userId: user?.id || '',
        age: ageInYears,
        gender,
        sumAssured: sumAssuredValue,
        term: parseInt(term, 10),
        result: result,
        policyId: policyId as string || '',
        categoryId: categoryId as string || '',
        policyName: policy?.name || 'Unknown Policy',
      };
      
      await mongoDBService.savePremiumCalculation(calculationData);
      
      setSnackbarMessage('Calculation saved successfully');
      setSnackbarVisible(true);
      setCalculationName('');
      
      // Vibrate to confirm save
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to save calculation:', error);
      
      // Check if it's the max limit error
      if (error instanceof Error && error.message.includes('can only save up to')) {
        setSnackbarMessage(error.message);
      } else {
        setSnackbarMessage('Failed to save calculation');
      }
      
      setSnackbarVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const formatCurrency = (value: number | string): string => {
    return '₹' + parseInt(value.toString()).toLocaleString('en-IN');
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

  const renderCalculator = () => {
    // If not the Single Premium Endowment Plan, show a message
    if (!isSinglePremiumEndowmentPlan) {
      return (
        <Surface style={styles.unsupportedPolicyCard}>
          <Title style={styles.unsupportedPolicyTitle}>Calculator Not Available</Title>
          <Paragraph style={styles.unsupportedPolicyText}>
            Currently, only LIC's Single Premium Endowment Plan calculator is supported.
            You will be redirected back to the policies page in a moment.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
          >
            Go Back
          </Button>
        </Surface>
      );
    }
    
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.calculatorContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Surface style={styles.calculatorCard}>
            <Title style={styles.calculatorTitle}>
              {policy ? policy.name : 'Premium Calculator'}
            </Title>
            <Paragraph style={styles.calculatorDescription}>
              {policy ? 
                `Calculate your estimated premium for ${policy.name} (${policy.planNo}, UIN: ${policy.uinNo}).` : 
                'Calculate your estimated premium based on your details.'}
            </Paragraph>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {birthDate.toLocaleDateString()} ({calculateAge(birthDate)} years)
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              
              <Text style={styles.ageNote}>
                Age must be between 30 days and 65 years
              </Text>
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
                onChangeText={(value) => {
                  // Allow any numeric value without minimum restriction
                  if (value === '' || !isNaN(parseInt(value, 10))) {
                    setSumAssured(value);
                  }
                }}
                keyboardType="numeric"
                left={<TextInput.Affix text="₹" />}
              />
              <Text style={styles.sumAssuredNote}>
                Enter any amount for sum assured
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Policy Term</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={25}
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
                <Text style={styles.resultLabel}>Sum Assured:</Text>
                <Text style={styles.resultValue}>{formatCurrency(sumAssured)}</Text>
              </View>
              
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>Policy Term:</Text>
                <Text style={styles.resultValue}>{term} years</Text>
              </View>
              
              <TextInput
                label="Save as"
                value={calculationName}
                onChangeText={setCalculationName}
                style={styles.saveInput}
                mode="outlined"
                placeholder="Enter a name for this calculation"
              />
              
              <Button
                mode="contained"
                onPress={saveCalculation}
                style={styles.saveButton}
                labelStyle={styles.buttonLabel}
              >
                Save Calculation
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => router.push('/policies')}
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
              The premium calculated is an estimate based on {policy ? policy.name : 'policy'} data.
              The actual premium may vary based on additional factors. Please contact LIC customer support for the exact premium amount.
            </Text>
          </Surface>
        </ScrollView>
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </KeyboardAvoidingView>
    );
  };

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
  saveInput: {
    backgroundColor: 'transparent',
    marginTop: 16,
    marginBottom: 16,
  },
  saveButton: {
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#4F6CFF',
  },
  viewPoliciesButton: {
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderColor: '#4F6CFF',
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
  snackbar: {
    backgroundColor: '#333333',
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  unsupportedPolicyCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
  },
  unsupportedPolicyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  unsupportedPolicyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  datePickerButton: {
    backgroundColor: 'rgba(79, 108, 255, 0.2)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4F6CFF',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  ageNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  sumAssuredNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#4F6CFF',
  },
}); 