import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge, Button, Divider, Paragraph, Surface, Title } from 'react-native-paper';
import mongoDBService from './services/mongodb';

// Define types
type User = {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
};

type Policy = {
  id: string;
  name: string;
  planNo: string;
  uinNo: string;
};

type SavedCalculation = {
  id: string;
  name: string;
  userId: string;
  age: number;
  gender: string;
  sumAssured: number;
  term: number;
  result: {
    premium: number;
    frequency: string;
    totalAnnual: number;
  };
  policyId: string;
  categoryId: string;
  policyName: string;
  createdAt: string;
};

// Maximum number of saved premium calculations allowed
const MAX_SAVED_PREMIUMS = 6;

// Policy categories
const policyCategories = [
  { id: 'endowment', name: 'Endowment Plans', icon: '💰' },
  { id: 'wholelife', name: 'Whole Life Plans', icon: '🏠' },
  { id: 'moneyback', name: 'Money Back Plans', icon: '💸' },
  { id: 'term', name: 'Term Plans', icon: '🛡️' },
  { id: 'riders', name: 'Riders', icon: '➕' },
];

// Define a type for policy categories
type PolicyCategory = 'endowment' | 'wholelife' | 'moneyback' | 'term' | 'riders';

// Mock policy data
const policies: Record<PolicyCategory, Policy[]> = {
  endowment: [
    { id: '1', name: "LIC's Single Premium Endowment Plan", planNo: '817', uinNo: '512N283V03' },
    { id: '2', name: "LIC's New Endowment Plan", planNo: '914', uinNo: '512N277V02' },
    { id: '3', name: "LIC's Jeevan Anand", planNo: '815', uinNo: '512N279V02' },
    { id: '4', name: "LIC's New Jeevan Anand", planNo: '815', uinNo: '512N279V02' },
  ],
  wholelife: [
    { id: '1', name: "LIC's Jeevan Umang", planNo: '845', uinNo: '512N312V01' },
    { id: '2', name: "LIC's Whole Life Policy", planNo: '2', uinNo: '512N338V01' },
  ],
  moneyback: [
    { id: '1', name: "LIC's New Money Back Plan", planNo: '820', uinNo: '512N280V02' },
    { id: '2', name: "LIC's Jeevan Tarang", planNo: '834', uinNo: '512N299V01' },
    { id: '3', name: "LIC's Jeevan Shiromani", planNo: '847', uinNo: '512N313V01' },
  ],
  term: [
    { id: '1', name: "LIC's Tech Term", planNo: '854', uinNo: '512N333V01' },
    { id: '2', name: "LIC's Jeevan Amar", planNo: '855', uinNo: '512N332V01' },
  ],
  riders: [
    { id: '1', name: "LIC's Accident Benefit Rider", planNo: '–', uinNo: '512B203V03' },
    { id: '2', name: "LIC's Premium Waiver Benefit Rider", planNo: '–', uinNo: '512B204V04' },
    { id: '3', name: "LIC's Accidental Death & Disability Benefit Rider", planNo: '–', uinNo: '512B209V02' },
    { id: '4', name: "LIC's New Term Assurance Rider", planNo: '–', uinNo: '512B210V02' },
    { id: '5', name: "LIC's Linked Accidental Death Benefit Rider", planNo: '–', uinNo: '512A211V02' },
  ],
};

export default function PoliciesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [showSavedPremiums, setShowSavedPremiums] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadSavedCalculations();
    }
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    try {
      // Use MongoDB service to check login status
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

  const loadSavedCalculations = async () => {
    try {
      // Use MongoDB service to get saved calculations
      const calculations = await mongoDBService.getSavedCalculations();
      setSavedCalculations(calculations);
    } catch (error) {
      console.error('Failed to load saved calculations:', error);
    }
  };

  const deleteSavedCalculation = async (calculationId: string) => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Delete Calculation",
        "Are you sure you want to delete this saved premium calculation?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
              // Delete calculation using MongoDB service
              const success = await mongoDBService.deleteSavedCalculation(calculationId);
              
              if (success) {
                // Update state with filtered calculations
                const updatedUserCalculations = savedCalculations.filter(calc => calc.id !== calculationId);
                setSavedCalculations(updatedUserCalculations);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } else {
                console.error('Failed to delete calculation');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCategoryPress = (categoryId: PolicyCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
    setSelectedPolicy(null);
    setShowSavedPremiums(false);
  };

  const handlePolicyPress = (policy: Policy) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isLoggedIn) {
      // Show login prompt for non-logged in users
      router.push('/login');
      return;
    }
    
    setSelectedPolicy(policy);
  };

  const handleBackToCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(null);
    setSelectedPolicy(null);
    setShowSavedPremiums(false);
  };

  const handleBackToPolicies = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPolicy(null);
  };

  const handleToggleSavedPremiums = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSavedPremiums(!showSavedPremiums);
    setSelectedCategory(null);
    setSelectedPolicy(null);
  };

  const handleCalculationPress = (calculation: SavedCalculation) => {
    // Find the policy from the saved calculation
    if (calculation.policyId && calculation.categoryId) {
      const category = calculation.categoryId as PolicyCategory;
      if (policies[category]) {
        const policy = policies[category].find(p => p.id === calculation.policyId);
        if (policy) {
          setSelectedPolicy(policy);
          setSelectedCategory(category);
        }
      }
    }
  };

  const formatCurrency = (value: number): string => {
    return '₹' + value.toLocaleString('en-IN');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCategoryItem = ({ item }: { item: typeof policyCategories[0] }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => handleCategoryPress(item.id as PolicyCategory)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPolicyItem = ({ item }: { item: Policy }) => (
    <TouchableOpacity 
      style={styles.policyCard} 
      onPress={() => handlePolicyPress(item)}
    >
      <View style={styles.policyContent}>
        <Text style={styles.policyName}>{item.name}</Text>
        <View style={styles.policyDetails}>
          <Text style={styles.policyDetail}>Plan No: {item.planNo}</Text>
          <Text style={styles.policyDetail}>UIN: {item.uinNo}</Text>
        </View>
      </View>
      <Text style={styles.policyArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderCalculationItem = ({ item }: { item: SavedCalculation }) => (
    <Surface style={styles.calculationCard}>
      <TouchableOpacity 
        style={styles.calculationContent}
        onPress={() => handleCalculationPress(item)}
      >
        <View style={styles.calculationHeader}>
          <Text style={styles.calculationName}>{item.name || 'Premium Calculation'}</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteSavedCalculation(item.id)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.calculationPolicy}>{item.policyName}</Text>
        
        <View style={styles.calculationDetails}>
          <View style={styles.calculationDetail}>
            <Text style={styles.calculationDetailLabel}>Premium:</Text>
            <Text style={styles.calculationDetailValue}>{formatCurrency(item.result.premium)}</Text>
          </View>
          
          <View style={styles.calculationDetail}>
            <Text style={styles.calculationDetailLabel}>Frequency:</Text>
            <Text style={styles.calculationDetailValue}>{item.result.frequency}</Text>
          </View>
          
          <View style={styles.calculationDetail}>
            <Text style={styles.calculationDetailLabel}>Sum Assured:</Text>
            <Text style={styles.calculationDetailValue}>{formatCurrency(item.sumAssured)}</Text>
          </View>
        </View>
        
        <Text style={styles.calculationDate}>Saved on {formatDate(item.createdAt)}</Text>
      </TouchableOpacity>
    </Surface>
  );

  const renderPolicyDetails = () => {
    if (!selectedPolicy) return null;
    
    return (
      <View style={styles.policyDetailsContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToPolicies}
        >
          <Text style={styles.backButtonText}>← Back to Policies</Text>
        </TouchableOpacity>
        
        <Surface style={styles.policyDetailsCard}>
          <Text style={styles.policyDetailsName}>{selectedPolicy.name}</Text>
          
          <View style={styles.policyDetailsInfo}>
            <View style={styles.policyDetailsRow}>
              <Text style={styles.policyDetailsLabel}>Plan No:</Text>
              <Text style={styles.policyDetailsValue}>{selectedPolicy.planNo}</Text>
            </View>
            
            <View style={styles.policyDetailsRow}>
              <Text style={styles.policyDetailsLabel}>UIN:</Text>
              <Text style={styles.policyDetailsValue}>{selectedPolicy.uinNo}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          {selectedPolicy.id === '1' && selectedCategory === 'endowment' ? (
            <View style={styles.calculatorContainer}>
              <Title style={styles.calculatorTitle}>Premium Calculator</Title>
              <Paragraph style={styles.calculatorDescription}>
                Calculate premium for this policy based on your age, sum assured, and other factors.
              </Paragraph>
              <Button 
                mode="contained" 
                onPress={() => router.push({
                  pathname: '/calculator',
                  params: { policyId: selectedPolicy.id, categoryId: selectedCategory }
                })}
                style={styles.calculatorButton}
                labelStyle={styles.buttonLabel}
                icon="calculator"
              >
                Calculate Premium
              </Button>
            </View>
          ) : (
            <View style={styles.calculatorContainer}>
              <Title style={styles.calculatorTitle}>Premium Calculator</Title>
              <Paragraph style={styles.calculatorDescription}>
                Premium calculator for this policy is not available yet. Currently, only LIC's Single Premium Endowment Plan calculator is supported.
              </Paragraph>
            </View>
          )}
        </Surface>
      </View>
    );
  };

  const renderPolicyList = () => {
    if (!selectedCategory) return null;
    
    const categoryPolicies = policies[selectedCategory] || [];
    
    return (
      <View style={styles.policyListContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToCategories}
        >
          <Text style={styles.backButtonText}>← Back to Categories</Text>
        </TouchableOpacity>
        
        <Text style={styles.policyListTitle}>
          {policyCategories.find(cat => cat.id === selectedCategory)?.name}
        </Text>
        
        <FlatList
          data={categoryPolicies}
          renderItem={renderPolicyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.policyList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderSavedPremiums = () => {
    return (
      <View style={styles.savedCalculationsContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToCategories}
        >
          <Text style={styles.backButtonText}>← Back to Categories</Text>
        </TouchableOpacity>
        
        <View style={styles.savedPremiumsHeader}>
          <Text style={styles.savedCalculationsTitle}>Saved Premium Calculations</Text>
          <Badge visible={true} style={styles.savedCountBadge}>
            {`${savedCalculations.length}/${MAX_SAVED_PREMIUMS}`}
          </Badge>
        </View>
        
        {savedCalculations.length > 0 ? (
          <FlatList
            data={savedCalculations}
            renderItem={renderCalculationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.calculationsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Surface style={styles.emptyStateCard}>
            <Text style={styles.emptyStateIcon}>📊</Text>
            <Text style={styles.emptyStateTitle}>No Saved Calculations</Text>
            <Text style={styles.emptyStateText}>
              You haven't saved any premium calculations yet. Try calculating a premium for a policy first!
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowSavedPremiums(false)}
              style={styles.emptyStateButton}
              labelStyle={styles.buttonLabel}
              icon="calculator"
            >
              Browse Policies
            </Button>
          </Surface>
        )}
      </View>
    );
  };

  const renderCategories = () => {
    return (
      <View style={styles.categoriesContainer}>
        {isLoggedIn && (
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                !showSavedPremiums && styles.activeTab
              ]}
              onPress={() => setShowSavedPremiums(false)}
            >
              <Text style={[
                styles.tabText,
                !showSavedPremiums && styles.activeTabText
              ]}>
                Browse Policies
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                showSavedPremiums && styles.activeTab
              ]}
              onPress={handleToggleSavedPremiums}
            >
              <Text style={[
                styles.tabText,
                showSavedPremiums && styles.activeTabText
              ]}>
                Saved Premiums
              </Text>
              {savedCalculations.length > 0 && (
                <Badge visible={true} style={styles.tabBadge}>
                  {`${savedCalculations.length}`}
                </Badge>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {!showSavedPremiums ? (
          <>
            <Text style={styles.categoriesTitle}>Policy Categories</Text>
            <FlatList
              data={policyCategories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.categoryRow}
              contentContainerStyle={styles.categoriesList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          renderSavedPremiums()
        )}
      </View>
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
        <Text style={styles.headerTitle}>LIC Policies</Text>
        {!isLoggedIn && (
          <Text style={styles.headerSubtitle}>
            Login to view policy details and calculate premiums
          </Text>
        )}
      </LinearGradient>
      
      {selectedPolicy ? renderPolicyDetails() : 
       selectedCategory ? renderPolicyList() : 
       renderCategories()}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    backgroundColor: '#4F6CFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#FF80AB',
    marginLeft: 6,
    fontSize: 12,
  },
  categoriesContainer: {
    flex: 1,
    padding: 16,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  categoryName: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  policyListContainer: {
    flex: 1,
    padding: 16,
  },
  policyListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  policyList: {
    paddingBottom: 20,
  },
  policyCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyContent: {
    flex: 1,
  },
  policyName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  policyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyDetail: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  policyArrow: {
    color: '#4F6CFF',
    fontSize: 20,
    marginLeft: 8,
  },
  policyDetailsContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#4F6CFF',
    fontSize: 16,
    fontWeight: '600',
  },
  policyDetailsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
  },
  policyDetailsName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  policyDetailsInfo: {
    marginBottom: 16,
  },
  policyDetailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  policyDetailsLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    width: 80,
  },
  policyDetailsValue: {
    color: '#FFFFFF',
    flex: 1,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  calculatorContainer: {
    alignItems: 'center',
  },
  calculatorTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calculatorDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 16,
  },
  calculatorButton: {
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#4F6CFF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  savedCalculationsContainer: {
    flex: 1,
  },
  savedPremiumsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  savedCalculationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  savedCountBadge: {
    backgroundColor: '#4F6CFF',
    fontSize: 12,
  },
  calculationsList: {
    paddingBottom: 20,
  },
  calculationCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  calculationContent: {
    padding: 16,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationName: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(207, 102, 121, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#CF6679',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calculationPolicy: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 12,
  },
  calculationDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  calculationDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calculationDetailLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  calculationDetailValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calculationDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'right',
  },
  emptyStateCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  emptyStateButton: {
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 24,
    backgroundColor: '#4F6CFF',
  },
}); 