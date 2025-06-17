import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Divider, Paragraph, Surface, Title } from 'react-native-paper';

// Policy data
const policyCategories = [
  { id: 'endowment', name: 'Endowment Plans', icon: '💰' },
  { id: 'wholelife', name: 'Whole Life Plans', icon: '♾️' },
  { id: 'moneyback', name: 'Money Back Plans', icon: '💵' },
  { id: 'term', name: 'Term Assurance Plans', icon: '🛡️' },
  { id: 'riders', name: 'Riders', icon: '🧩' },
];

const policies = {
  endowment: [
    { id: '1', name: "LIC's Single Premium Endowment Plan", planNo: '717', uinNo: '512N283V03' },
    { id: '2', name: "LIC's New Endowment Plan", planNo: '714', uinNo: '512N277V03' },
    { id: '3', name: "LIC's New Jeevan Anand", planNo: '715', uinNo: '512N279V03' },
    { id: '4', name: "LIC's Jeevan Lakshya", planNo: '733', uinNo: '512N297V03' },
    { id: '5', name: "LIC's Jeevan Labh Plan", planNo: '736', uinNo: '512N304V03' },
    { id: '6', name: "LIC's Amritbaal", planNo: '774', uinNo: '512N365V02' },
    { id: '7', name: "LIC's Bima Jyoti", planNo: '760', uinNo: '512N339V03' },
    { id: '8', name: "LIC's Jeevan Azad", planNo: '768', uinNo: '512N348V02' },
  ],
  wholelife: [
    { id: '1', name: "LIC's Jeevan Umang", planNo: '745', uinNo: '512N312V03' },
    { id: '2', name: "LIC's Jeevan Utsav", planNo: '771', uinNo: '512N363V02' },
  ],
  moneyback: [
    { id: '1', name: "LIC's Bima Shree", planNo: '748', uinNo: '512N316V03' },
    { id: '2', name: "LIC's New Money Back Plan – 20 Years", planNo: '720', uinNo: '512N280V03' },
    { id: '3', name: "LIC's New Money Back Plan – 25 Years", planNo: '721', uinNo: '512N278V03' },
    { id: '4', name: "LIC's New Children's Money Back Plan", planNo: '732', uinNo: '512N296V03' },
    { id: '5', name: "LIC's Bima Ratna", planNo: '764', uinNo: '512N345V02' },
  ],
  term: [
    { id: '1', name: "LIC's Digi Term", planNo: '876', uinNo: '512N356V02' },
    { id: '2', name: "LIC's Digi Credit Life", planNo: '878', uinNo: '512N358V01' },
    { id: '3', name: "LIC's Yuva Credit Life", planNo: '877', uinNo: '512N357V01' },
    { id: '4', name: "LIC's Yuva Term", planNo: '875', uinNo: '512N355V02' },
    { id: '5', name: "LIC's New Tech-Term", planNo: '954', uinNo: '512N351V01' },
    { id: '6', name: "LIC's New Jeevan Amar", planNo: '955', uinNo: '512N350V02' },
    { id: '7', name: "LIC's Saral Jeevan Bima", planNo: '859', uinNo: '512N341V01' },
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleCategoryPress = (categoryId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
    setSelectedPolicy(null);
  };

  const handlePolicyPress = (policy) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!isLoggedIn) {
      // Show login prompt for non-logged in users
      router.push('login');
      return;
    }
    
    setSelectedPolicy(policy);
  };

  const handleBackToCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(null);
    setSelectedPolicy(null);
  };

  const handleBackToPolicies = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPolicy(null);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPolicyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.policyCard} 
      onPress={() => handlePolicyPress(item)}
    >
      <View style={styles.policyHeader}>
        <Text style={styles.policyName}>{item.name}</Text>
      </View>
      <View style={styles.policyDetails}>
        <View style={styles.policyDetail}>
          <Text style={styles.policyDetailLabel}>Plan No:</Text>
          <Text style={styles.policyDetailValue}>{item.planNo}</Text>
        </View>
        <View style={styles.policyDetail}>
          <Text style={styles.policyDetailLabel}>UIN:</Text>
          <Text style={styles.policyDetailValue}>{item.uinNo}</Text>
        </View>
      </View>
    </TouchableOpacity>
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

        <Surface style={styles.policyDetailCard}>
          <Text style={styles.policyDetailTitle}>{selectedPolicy.name}</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.policyInfoRow}>
            <Text style={styles.policyInfoLabel}>Plan Number:</Text>
            <Text style={styles.policyInfoValue}>{selectedPolicy.planNo}</Text>
          </View>
          
          <View style={styles.policyInfoRow}>
            <Text style={styles.policyInfoLabel}>UIN Number:</Text>
            <Text style={styles.policyInfoValue}>{selectedPolicy.uinNo}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.policyDescription}>
            This is a comprehensive policy offering financial protection and savings. 
            The policy provides a lump sum amount on maturity or to the nominee in case of unfortunate death of the policyholder.
          </Text>
          
          <View style={styles.calculatorContainer}>
            <Title style={styles.calculatorTitle}>Premium Calculator</Title>
            <Paragraph style={styles.calculatorDescription}>
              Calculate your premium based on your age, sum assured, and policy term.
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => router.push({
                pathname: 'calculator',
                params: { policyId: selectedPolicy.id, categoryId: selectedCategory }
              })}
              style={styles.calculatorButton}
              labelStyle={styles.buttonLabel}
            >
              Calculate Premium
            </Button>
          </View>
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

  const renderCategories = () => {
    return (
      <View style={styles.categoriesContainer}>
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
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoriesContainer: {
    flex: 1,
    padding: 16,
  },
  categoriesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
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
    padding: 20,
    alignItems: 'center',
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  policyListContainer: {
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
  policyListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  policyList: {
    paddingBottom: 20,
  },
  policyCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  policyHeader: {
    marginBottom: 8,
  },
  policyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  policyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyDetailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 4,
  },
  policyDetailValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  policyDetailsContainer: {
    flex: 1,
    padding: 16,
  },
  policyDetailCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  policyDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  policyInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  policyInfoLabel: {
    width: 120,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  policyInfoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  policyDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
  },
  calculatorContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  calculatorTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  calculatorDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  calculatorButton: {
    borderRadius: 8,
    backgroundColor: '#4F6CFF',
  },
  buttonLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 