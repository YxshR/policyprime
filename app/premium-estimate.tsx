import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Snackbar, Surface, Text, Title } from 'react-native-paper';
import mongoDBService from './services/mongodb';

// Helper function to format currency
const formatCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
  return numValue.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
};

export default function PremiumEstimate() {
  const params = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Only parse data once to prevent infinite loops
  useEffect(() => {
    if (!dataLoaded && params.data) {
      try {
        const parsedData = JSON.parse(params.data as string);
        setData(parsedData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error parsing data:', error);
        router.replace('/calculator');
      }
    } else if (!params.data && !dataLoaded) {
      router.replace('/calculator');
    }
  }, [params.data, dataLoaded]);

  const handleShare = async () => {
    if (!data) return;

    const message = `Premium Estimate\n\n` +
      `Name: ${data.name}\n` +
      `Age: ${data.age} years\n` +
      `Term: ${data.term} years\n` +
      `Sum Assured: ${formatCurrency(data.sumAssured)}\n` +
      `Premium: ${formatCurrency(data.premium)}\n` +
      `GST (4.5%): ${formatCurrency(data.gstAmount)}\n` +
      `Total Premium: ${formatCurrency(data.premiumWithGst)}\n` +
      `Approximate Return: ${formatCurrency(data.approximateReturn)}\n` +
      `Maturity Date: ${new Date(data.maturityDate).toLocaleDateString()}`;
    
    try {
      if (Platform.OS === 'web') {
        navigator.clipboard.writeText(message);
        setSnackbarMessage('Details copied to clipboard');
        setSnackbarVisible(true);
      } else {
        await Share.share({
          message,
          title: 'Premium Estimate'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const saveCalculation = async () => {
    try {
      const status = await mongoDBService.checkLoginStatus();
      if (!status.isLoggedIn || !status.user) {
        setSnackbarMessage('Please log in to save calculations');
        setSnackbarVisible(true);
        return;
      }

      setIsLoading(true);
      const calculationData = {
        userId: status.user.id,
        name: data.name,
        age: data.age,
        gender: 'Not Specified',
        sumAssured: parseInt(data.sumAssured),
        term: parseInt(data.term),
        result: {
          premium: data.premium,
          gstAmount: data.gstAmount,
          premiumWithGst: data.premiumWithGst,
          frequency: data.frequency,
          totalAnnual: data.premiumWithGst * (data.frequency === 'Monthly' ? 12 : 1)
        },
        policyId: '',
        categoryId: '',
        policyName: data.policyName,
        adAndDb: data.adAndDb,
        ageExtra: data.ageExtra,
        requiredMedicalReports: data.requiredMedicalReports,
        taxSaved: data.taxSaved,
        totalApproximatePaidPremium: data.totalApproximatePaidPremium,
        maturity: data.maturity
      };

      await mongoDBService.savePremiumCalculation(calculationData);
      setSnackbarMessage('Calculation saved successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error saving calculation:', error);
      setSnackbarMessage('Failed to save calculation');
      setSnackbarVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6CFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.resultCard}>
        <Title style={styles.resultTitle}>Premium Estimate</Title>
        
        {/* Main Details Section */}
        <View style={styles.detailsSection}>
          <Title style={styles.sectionTitle}>Policy Information</Title>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Name:</Text>
            <Text style={styles.resultValue}>{data.name}</Text>
          </View>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Age:</Text>
            <Text style={styles.resultValue}>{data.age} years</Text>
          </View>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Term:</Text>
            <Text style={styles.resultValue}>{data.term} years</Text>
          </View>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Sum Assured:</Text>
            <Text style={styles.resultValue}>{formatCurrency(data.sumAssured)}</Text>
          </View>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Policy:</Text>
            <Text style={styles.resultValue}>{data.policyName}</Text>
          </View>
        </View>

        {/* Additional Benefits Section - Only show if any benefit is selected */}
        {(data.adAndDb || data.ageExtra || data.requiredMedicalReports || 
          data.taxSaved || data.totalApproximatePaidPremium || data.maturity) && (
          <View style={styles.detailsSection}>
            <Title style={styles.sectionTitle}>Selected Benefits</Title>
            {data.adAndDb && (
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>AD and DB:</Text>
                <Text style={styles.resultValue}>Included</Text>
              </View>
            )}
            {data.ageExtra && (
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>Age Extra:</Text>
                <Text style={styles.resultValue}>Included</Text>
              </View>
            )}
            {data.requiredMedicalReports && (
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>Required Medical Reports:</Text>
                <Text style={styles.resultValue}>Included</Text>
              </View>
            )}
            {data.taxSaved && (
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>Tax Saved:</Text>
                <Text style={styles.resultValue}>Applicable</Text>
              </View>
            )}
            {data.totalApproximatePaidPremium && (
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>Total Approximate Paid Premium:</Text>
                <Text style={styles.resultValue}>{formatCurrency(data.premium)}</Text>
              </View>
            )}
            {data.maturity && (
              <View style={styles.resultDetail}>
                <Text style={styles.resultLabel}>Maturity Value:</Text>
                <Text style={styles.resultValue}>{formatCurrency(data.approximateReturn)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Premium Details Section */}
        <View style={styles.detailsSection}>
          <Title style={styles.sectionTitle}>Premium Details</Title>
          <View style={styles.premiumContainer}>
            <Text style={styles.premiumAmount}>
              {formatCurrency(data.premium)}
            </Text>
            <Text style={styles.premiumFrequency}>
              {data.frequency}
            </Text>
          </View>
          
          <View style={styles.gstContainer}>
            <View style={styles.gstDetail}>
              <Text style={styles.gstLabel}>Premium:</Text>
              <Text style={styles.gstValue}>{formatCurrency(data.premium)}</Text>
            </View>
            <View style={styles.gstDetail}>
              <Text style={styles.gstLabel}>GST (4.5%):</Text>
              <Text style={styles.gstValue}>{formatCurrency(data.gstAmount)}</Text>
            </View>
            <View style={styles.gstTotal}>
              <Text style={styles.gstTotalLabel}>Total Premium:</Text>
              <Text style={styles.gstTotalValue}>{formatCurrency(data.premiumWithGst)}</Text>
            </View>
          </View>
        </View>

        {/* Returns Section */}
        <View style={styles.detailsSection}>
          <Title style={styles.sectionTitle}>Returns</Title>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Approximate Return:</Text>
            <Text style={styles.resultValue}>
              {formatCurrency(data.approximateReturn)}
            </Text>
          </View>
          <View style={styles.resultDetail}>
            <Text style={styles.resultLabel}>Maturity Date:</Text>
            <Text style={styles.resultValue}>
              {new Date(data.maturityDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={saveCalculation}
            style={styles.actionButton}
            labelStyle={styles.buttonLabel}
            loading={isLoading}
            disabled={isLoading}
          >
            Save Calculation
          </Button>
          
          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.shareButton}
            labelStyle={styles.buttonLabel}
          >
            Share Details
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.backButton}
            labelStyle={styles.buttonLabel}
          >
            Back to Calculator
          </Button>
        </View>
      </Surface>

      <Surface style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          The premium calculated is an estimate based on {data.policyName} data.
          The actual premium may vary based on additional factors. Please contact LIC customer support for the exact premium amount.
        </Text>
      </Surface>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
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
  resultCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    elevation: 4,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
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
  resultDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  premiumContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  premiumAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F6CFF',
  },
  premiumFrequency: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 12,
    backgroundColor: '#4F6CFF',
    borderRadius: 8,
  },
  shareButton: {
    marginBottom: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  backButton: {
    borderColor: '#AAAAAA',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  disclaimerCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    elevation: 2,
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AAAAAA',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#888888',
  },
  snackbar: {
    backgroundColor: '#333333',
  },
  gstContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(79, 108, 255, 0.1)',
    borderRadius: 8,
  },
  gstDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gstLabel: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  gstValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  gstTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  gstTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  gstTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F6CFF',
  },
}); 