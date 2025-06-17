import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Paragraph, ProgressBar, Surface, Title } from 'react-native-paper';

// Mock user data for demonstration
const mockUserPolicies = [
  {
    id: '1',
    name: "LIC's New Endowment Plan",
    planNo: '714',
    policyNo: 'EN123456789',
    startDate: '2022-05-15',
    maturityDate: '2042-05-15',
    premiumAmount: 12500,
    premiumFrequency: 'Annual',
    nextPremiumDate: '2023-05-15',
    sumAssured: 1500000,
    status: 'Active',
  },
  {
    id: '2',
    name: "LIC's Jeevan Labh Plan",
    planNo: '736',
    policyNo: 'JL987654321',
    startDate: '2021-08-10',
    maturityDate: '2041-08-10',
    premiumAmount: 25000,
    premiumFrequency: 'Annual',
    nextPremiumDate: '2023-08-10',
    sumAssured: 3000000,
    status: 'Active',
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPolicies, setUserPolicies] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userToken) {
        setIsLoggedIn(true);
        // In a real app, you would fetch user data from MongoDB
        // For demo purposes, we'll use mock data
        setUserName('John Doe');
        setUserPolicies(mockUserPolicies);
      } else {
        setIsLoggedIn(false);
      }
      
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

  const calculatePolicyProgress = (startDate, maturityDate) => {
    const start = new Date(startDate).getTime();
    const end = new Date(maturityDate).getTime();
    const now = new Date().getTime();
    
    if (now <= start) return 0;
    if (now >= end) return 1;
    
    return (now - start) / (end - start);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderLoginPrompt = () => (
    <Surface style={styles.loginPromptContainer}>
      <Title style={styles.loginPromptTitle}>Dashboard Access</Title>
      <Paragraph style={styles.loginPromptText}>
        Please log in to view your policy dashboard and manage your policies.
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

  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContainer}>
      <Surface style={styles.summaryCard}>
        <Title style={styles.summaryTitle}>Policy Summary</Title>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userPolicies.length}</Text>
            <Text style={styles.statLabel}>Active Policies</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₹{userPolicies.reduce((sum, policy) => sum + policy.sumAssured, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Coverage</Text>
          </View>
        </View>
      </Surface>

      <Title style={styles.sectionTitle}>Your Policies</Title>
      
      {userPolicies.map((policy) => (
        <Surface key={policy.id} style={styles.policyCard}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyName}>{policy.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{policy.status}</Text>
            </View>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.detailLabel}>Policy Number:</Text>
            <Text style={styles.detailValue}>{policy.policyNo}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.detailLabel}>Sum Assured:</Text>
            <Text style={styles.detailValue}>₹{policy.sumAssured.toLocaleString()}</Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.detailLabel}>Premium:</Text>
            <Text style={styles.detailValue}>
              ₹{policy.premiumAmount.toLocaleString()} ({policy.premiumFrequency})
            </Text>
          </View>
          
          <View style={styles.policyDetail}>
            <Text style={styles.detailLabel}>Next Premium:</Text>
            <Text style={styles.detailValue}>{formatDate(policy.nextPremiumDate)}</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Policy Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(calculatePolicyProgress(policy.startDate, policy.maturityDate) * 100)}%
              </Text>
            </View>
            <ProgressBar
              progress={calculatePolicyProgress(policy.startDate, policy.maturityDate)}
              color="#4F6CFF"
              style={styles.progressBar}
            />
            <View style={styles.dateContainer}>
              <Text style={styles.startDate}>{formatDate(policy.startDate)}</Text>
              <Text style={styles.maturityDate}>{formatDate(policy.maturityDate)}</Text>
            </View>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => router.push({
              pathname: 'policy-detail',
              params: { policyId: policy.id }
            })}
            style={styles.viewDetailsButton}
            labelStyle={styles.viewDetailsLabel}
          >
            View Details
          </Button>
        </Surface>
      ))}
      
      <Surface style={styles.supportCard}>
        <Title style={styles.supportTitle}>Need Help?</Title>
        <Paragraph style={styles.supportText}>
          Contact our customer support team for any queries related to your policies.
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => router.push('contact')}
          style={styles.supportButton}
          labelStyle={styles.buttonLabel}
        >
          Contact Support
        </Button>
      </Surface>
    </ScrollView>
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
        <Text style={styles.headerTitle}>Dashboard</Text>
        {isLoggedIn && (
          <Text style={styles.headerSubtitle}>Welcome back, {userName}</Text>
        )}
      </LinearGradient>
      
      {isLoggedIn ? renderDashboard() : renderLoginPrompt()}
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
  dashboardContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  divider: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  policyCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  policyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#4F6CFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  policyDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4F6CFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  startDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  maturityDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  viewDetailsButton: {
    borderColor: '#4F6CFF',
    borderRadius: 8,
  },
  viewDetailsLabel: {
    color: '#4F6CFF',
  },
  supportCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginTop: 8,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  supportButton: {
    borderRadius: 8,
    backgroundColor: '#4F6CFF',
  },
}); 