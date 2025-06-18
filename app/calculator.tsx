import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Checkbox, Paragraph, Snackbar, Surface, TextInput, Title } from 'react-native-paper';
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
  premiumWithGst?: number;
  gstAmount?: number;
  frequency: string;
  totalAnnual: number;
  adAndDb?: boolean;
  ageExtra?: boolean;
  requiredMedicalReports?: boolean;
  taxSaved?: boolean;
  totalApproximatePaidPremium?: boolean;
  maturity?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  
  // Form fields
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [sumAssured, setSumAssured] = useState('100000');
  const [term, setTerm] = useState('10');
  const [paymentFrequency, setPaymentFrequency] = useState('annual');
  const [calculationName, setCalculationName] = useState('');
  
  // Checkbox fields for additional options
  const [adAndDb, setAdAndDb] = useState(false);
  const [ageExtra, setAgeExtra] = useState(false);
  const [requiredMedicalReports, setRequiredMedicalReports] = useState(false);
  const [taxSaved, setTaxSaved] = useState(false);
  const [totalApproximatePaidPremium, setTotalApproximatePaidPremium] = useState(false);
  const [maturity, setMaturity] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const status = await mongoDBService.checkLoginStatus();
        if (status.isLoggedIn && status.user) {
          setUser(status.user);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const initializeCalculator = async () => {
      await checkLoginStatus();
      await fetchPolicyDetails();
      
      // Set a default birth date for someone who is 40 years old
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 40);
      setBirthDate(defaultDate);
      setAge('40');
      
      setLoading(false);
    };
    
    setLoading(true);
    initializeCalculator();
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

    // Validate inputs
    const sumAssuredValue = parseInt(sumAssured, 10);
    const termValue = parseInt(term, 10);
    
    if (isNaN(sumAssuredValue) || sumAssuredValue <= 0) {
      setSnackbarMessage("Please enter a valid sum assured amount.");
      setSnackbarVisible(true);
      return;
    }
    
    // Check minimum sum assured for Single Premium Endowment Plan
    if (isSinglePremiumEndowmentPlan && sumAssuredValue < 100000) {
      setSnackbarMessage("For Single Premium Endowment Plan, sum assured must be at least ₹1,00,000.");
      setSnackbarVisible(true);
      return;
    }
    
    if (isNaN(termValue) || termValue <= 0) {
      setSnackbarMessage("Please enter a valid term.");
      setSnackbarVisible(true);
      return;
    }

    setCalculating(true);
    
    // Calculate premium based on inputs
    const ageInYears = calculateAge(birthDate);
    
    setTimeout(() => {
      // Pass checkbox values to calculatePremiumAmount
      const premiumAmount = calculatePremiumAmount(
        ageInYears, 
        gender, 
        sumAssuredValue, 
        termValue, 
        paymentFrequency,
        {
          adAndDb,
          ageExtra,
          requiredMedicalReports,
          taxSaved,
          totalApproximatePaidPremium,
          maturity
        }
      );
      
      // Calculate GST (4.5% instead of 18%)
      const gstAmount = premiumAmount * 0.045;
      const totalAmount = premiumAmount + gstAmount;
      
      const calculationResult: CalculationResult = {
        premium: premiumAmount,
        premiumWithGst: totalAmount,
        gstAmount: gstAmount,
        frequency: paymentFrequency === 'annual' ? 'Annual' : 'Monthly',
        totalAnnual: paymentFrequency === 'annual' ? totalAmount : totalAmount * 12,
        adAndDb,
        ageExtra,
        requiredMedicalReports,
        taxSaved,
        totalApproximatePaidPremium,
        maturity
      };
      
      setResult(calculationResult);
      setCalculating(false);
      
      // Vibrate to indicate completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const saveCalculation = async () => {
    if (!user) {
      setSnackbarMessage('Please log in to save calculations');
      setSnackbarVisible(true);
      return;
    }

    if (!result) {
      setSnackbarMessage('Please calculate premium first');
      setSnackbarVisible(true);
      return;
    }

    try {
      const calculationData = {
        userId: user._id,
        name: user.name || 'Untitled Calculation',
        age: calculateAge(birthDate),
        gender: 'Not Specified', // Add gender field if available in your form
        sumAssured: parseInt(sumAssured),
        term: parseInt(term),
        result: {
          premium: result.premium,
          frequency: result.frequency,
          totalAnnual: result.premium * (result.frequency === 'Monthly' ? 12 : 1)
        },
        policyId: policy?.id || '',
        categoryId: category || '',
        policyName: policy?.name || 'Custom Policy',
        adAndDb: result.adAndDb || false,
        ageExtra: result.ageExtra || false,
        requiredMedicalReports: result.requiredMedicalReports || false,
        taxSaved: result.taxSaved || false,
        totalApproximatePaidPremium: result.totalApproximatePaidPremium || false,
        maturity: result.maturity || false
      };

      await mongoDBService.savePremiumCalculation(calculationData);
      setSnackbarMessage('Calculation saved successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error saving calculation:', error);
      setSnackbarMessage('Failed to save calculation');
      setSnackbarVisible(true);
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
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                mode="outlined"
                placeholder="Enter Name"
                value={calculationName}
                onChangeText={setCalculationName}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Age*</Text>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {calculateAge(birthDate) > 0 ? 
                    `${calculateAge(birthDate)} years (${birthDate.toLocaleDateString()})` : 
                    "Enter Your Birthdate"}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                />
              )}
              
              <Text style={styles.ageNote}>
                30 days to 65 years
              </Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Term*</Text>
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
                <Text style={styles.sliderValue}>{term} to 25</Text>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Sum Assured*</Text>
              <TextInput
                style={styles.input}
                mode="outlined"
                value={sumAssured}
                placeholder="Min 1,00,000"
                onChangeText={(value) => {
                  // Allow any numeric value without minimum restriction
                  if (value === '' || !isNaN(parseInt(value, 10))) {
                    setSumAssured(value);
                  }
                }}
                keyboardType="numeric"
                left={<TextInput.Affix text="₹" />}
              />
            </View>
            
            {/* Additional options as checkboxes */}
            <View style={styles.checkboxContainer}>
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={adAndDb ? 'checked' : 'unchecked'}
                  onPress={() => setAdAndDb(!adAndDb)}
                  color="#4F6CFF"
                />
                <Text style={styles.checkboxLabel}>AD and DB</Text>
              </View>
              
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={ageExtra ? 'checked' : 'unchecked'}
                  onPress={() => setAgeExtra(!ageExtra)}
                  color="#4F6CFF"
                />
                <Text style={styles.checkboxLabel}>Age Extra</Text>
              </View>
              
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={requiredMedicalReports ? 'checked' : 'unchecked'}
                  onPress={() => setRequiredMedicalReports(!requiredMedicalReports)}
                  color="#4F6CFF"
                />
                <Text style={styles.checkboxLabel}>Required Medical Reports</Text>
              </View>
              
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={taxSaved ? 'checked' : 'unchecked'}
                  onPress={() => setTaxSaved(!taxSaved)}
                  color="#4F6CFF"
                />
                <Text style={styles.checkboxLabel}>Tax Saved</Text>
              </View>
              
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={totalApproximatePaidPremium ? 'checked' : 'unchecked'}
                  onPress={() => setTotalApproximatePaidPremium(!totalApproximatePaidPremium)}
                  color="#4F6CFF"
                />
                <Text style={styles.checkboxLabel}>Total Approximate Paid Premium</Text>
              </View>
              
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={maturity ? 'checked' : 'unchecked'}
                  onPress={() => setMaturity(!maturity)}
                  color="#4F6CFF"
                />
                <Text style={styles.checkboxLabel}>Maturity</Text>
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
              CALCULATE
            </Button>
          </Surface>
          
          {result && (
            <Surface style={styles.resultCard}>
              <Title style={styles.resultTitle}>Premium Calculated</Title>
              <View style={styles.premiumContainer}>
                <Text style={styles.premiumAmount}>
                  {formatCurrency(result.premium)}
                </Text>
                <Text style={styles.premiumNote}>
                  + 4.5% GST ({formatCurrency(result.gstAmount || 0)})
                </Text>
                <Text style={styles.premiumTotal}>
                  Total: {formatCurrency(result.premiumWithGst || result.premium)}
                </Text>
                <Text style={styles.premiumFrequency}>
                  {result.frequency}
                </Text>
              </View>
              
              <Button
                mode="contained"
                onPress={showPremiumEstimate}
                style={styles.viewDetailsButton}
                labelStyle={styles.buttonLabel}
              >
                View Full Estimate
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

  const handleShare = async () => {
    if (!result) return;

    const message = `Premium Estimate\n\n` +
      `Name: ${user?.name || 'Not provided'}\n` +
      `Age: ${calculateAge(birthDate)} years\n` +
      `Term: ${term} years\n` +
      `Sum Assured: ${formatCurrency(sumAssured)}\n` +
      `Premium: ${formatCurrency(result.premium)}\n` +
      `Approximate Return: ${formatCurrency(parseInt(sumAssured) * 1.5)}\n` +
      `Maturity Date: ${new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(term))).toLocaleDateString()}`;
    
    try {
      await Share.share({
        message,
        title: 'Premium Estimate'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const showPremiumEstimate = () => {
    if (!result) return;
    
    // Create the data object to pass to the results screen
    const resultData = {
      // Prioritize the calculationName over the user's name
      name: calculationName.trim() || user?.name || 'Not provided',
      age: calculateAge(birthDate),
      term: term,
      sumAssured: sumAssured,
      premium: result.premium,
      gstAmount: result.gstAmount || 0,
      premiumWithGst: result.premiumWithGst || (result.premium * 1.045),
      frequency: result.frequency,
      approximateReturn: parseInt(sumAssured) * 1.5,
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(term))).toISOString(),
      adAndDb: result.adAndDb || false,
      ageExtra: result.ageExtra || false,
      requiredMedicalReports: result.requiredMedicalReports || false,
      taxSaved: result.taxSaved || false,
      totalApproximatePaidPremium: result.totalApproximatePaidPremium || false,
      maturity: result.maturity || false,
      policyName: policy?.name || 'Custom Policy'
    };
    
    // Navigate to results screen with data
    router.push({
      pathname: '/premium-estimate',
      params: { data: JSON.stringify(resultData) }
    });
  };

  // Update the calculatePremiumAmount function to account for checkbox selections
  const calculatePremiumAmount = (
    age: number, 
    gender: string, 
    sumAssured: number, 
    term: number, 
    paymentFrequency: string,
    options: {
      adAndDb: boolean,
      ageExtra: boolean,
      requiredMedicalReports: boolean,
      taxSaved: boolean,
      totalApproximatePaidPremium: boolean,
      maturity: boolean
    }
  ): number => {
    // Base premium calculation
    let premium = 0;
    
    // Use the sample premium rates from the brochure for Single Premium Endowment Plan
    if (term === 10) {
      if (age <= 10) premium = 77910;
      else if (age <= 20) premium = 77985;
      else if (age <= 30) premium = 78010;
      else if (age <= 40) premium = 78180;
      else if (age <= 50) premium = 78800;
      else if (age <= 60) premium = 79965;
      else premium = 80000;
    } else if (term === 15) {
      if (age <= 10) premium = 66650;
      else if (age <= 20) premium = 66775;
      else if (age <= 30) premium = 66865;
      else if (age <= 40) premium = 67335;
      else if (age <= 50) premium = 68800;
      else if (age <= 60) premium = 71405;
      else premium = 72000;
    } else if (term === 25) {
      if (age <= 10) premium = 50005;
      else if (age <= 20) premium = 50255;
      else if (age <= 30) premium = 50695;
      else if (age <= 40) premium = 52340;
      else if (age <= 50) premium = 56160;
      else premium = 58000;
    } else {
      // For other terms, interpolate between the known values
      if (term < 10) {
        premium = 80000; // Higher premium for shorter terms
      } else if (term > 10 && term < 15) {
        const factor = (term - 10) / 5;
        if (age <= 10) premium = 77910 - factor * (77910 - 66650);
        else if (age <= 20) premium = 77985 - factor * (77985 - 66775);
        else if (age <= 30) premium = 78010 - factor * (78010 - 66865);
        else if (age <= 40) premium = 78180 - factor * (78180 - 67335);
        else if (age <= 50) premium = 78800 - factor * (78800 - 68800);
        else if (age <= 60) premium = 79965 - factor * (79965 - 71405);
        else premium = 80000 - factor * (80000 - 72000);
      } else if (term > 15 && term < 25) {
        const factor = (term - 15) / 10;
        if (age <= 10) premium = 66650 - factor * (66650 - 50005);
        else if (age <= 20) premium = 66775 - factor * (66775 - 50255);
        else if (age <= 30) premium = 66865 - factor * (66865 - 50695);
        else if (age <= 40) premium = 67335 - factor * (67335 - 52340);
        else if (age <= 50) premium = 68800 - factor * (68800 - 56160);
        else if (age <= 60) premium = 71405 - factor * (71405 - 58000);
        else premium = 72000 - factor * (72000 - 58000);
      }
    }
    
    // Scale premium based on sum assured (rates are for 1 lakh)
    premium = (premium / 100000) * sumAssured;
    
    // Apply high sum assured rebate
    let rebate = 0;
    if (sumAssured >= 200000 && sumAssured < 300000) {
      rebate = 0.02 * sumAssured; // 20%o of BSA
    } else if (sumAssured >= 300000 && sumAssured < 500000) {
      rebate = 0.03 * sumAssured; // 30%o of BSA
    } else if (sumAssured >= 500000) {
      rebate = 0.04 * sumAssured; // 40%o of BSA
    }
    
    premium -= rebate;
    
    // Apply additional premium adjustments based on selected options
    if (options.adAndDb) {
      // Add Accidental Death and Disability Benefit premium (approximately 1% of sum assured)
      premium += sumAssured * 0.01;
    }
    
    if (options.ageExtra) {
      // Add age extra premium (approximately 2% extra for older ages)
      if (age > 50) {
        premium += premium * 0.02;
      }
    }
    
    // Apply payment frequency adjustment
    if (paymentFrequency === 'monthly') {
      // Monthly premium is typically slightly higher than annual / 12
      premium = (premium / 12) * 1.05;
    }
    
    return Math.round(premium);
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
  premiumNote: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  premiumTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F6CFF',
    marginTop: 8,
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
  checkboxContainer: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  actionButtons: {
    marginTop: 24,
  },
  shareButton: {
    marginBottom: 12,
    backgroundColor: '#4CAF50',
  },
  viewDetailsButton: {
    borderRadius: 8,
    marginTop: 16,
    backgroundColor: '#4F6CFF',
  },
}); 