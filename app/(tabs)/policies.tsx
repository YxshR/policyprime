import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Chip, Divider, Searchbar, Surface } from 'react-native-paper';
import mongoDBService from '../services/mongodb';

// Define policy type
type Policy = {
  id: string;
  name: string;
  planNo: string;
  uinNo: string;
};

// Define policy categories
const categories = [
  { id: 'endowment', name: 'Endowment' },
  { id: 'wholelife', name: 'Whole Life' },
  { id: 'moneyback', name: 'Money Back' },
  { id: 'term', name: 'Term' },
  { id: 'riders', name: 'Riders' },
];

export default function PoliciesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('endowment');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load policies when category changes
  useEffect(() => {
    const loadPolicies = async () => {
      setLoading(true);
      try {
        const data = await mongoDBService.getPoliciesByCategory(selectedCategory);
        setPolicies(data);
      } catch (error) {
        console.error('Error loading policies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, [selectedCategory]);

  // Filter policies based on search query
  const filteredPolicies = searchQuery
    ? policies.filter(policy => 
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.planNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.uinNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : policies;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LIC Policies</Text>
        <Text style={styles.subtitle}>Find the right policy for your needs</Text>
      </View>
      
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Search policies"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#4F6CFF"
          inputStyle={{ color: '#FFFFFF' }}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
      </Surface>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map(category => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.selectedCategoryChipText
            ]}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
      
      <Divider style={styles.divider} />
      
      <ScrollView style={styles.policyList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F6CFF" />
            <Text style={styles.loadingText}>Loading policies...</Text>
          </View>
        ) : filteredPolicies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No policies found</Text>
          </View>
        ) : (
          filteredPolicies.map(policy => (
            <TouchableOpacity
              key={policy.id}
              onPress={() => {
                // Navigate to policy details
                // router.push(`/policy/${selectedCategory}/${policy.id}`);
              }}
            >
              <Surface style={styles.policyCard}>
                <Text style={styles.policyName}>{policy.name}</Text>
                <View style={styles.policyDetails}>
                  <Text style={styles.policyPlan}>Plan: {policy.planNo}</Text>
                  <Text style={styles.policyUin}>UIN: {policy.uinNo}</Text>
                </View>
              </Surface>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#4F6CFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 8,
    elevation: 4,
  },
  searchbar: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#1E1E1E',
  },
  selectedCategoryChip: {
    backgroundColor: '#4F6CFF',
  },
  categoryChipText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  policyList: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  policyCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  policyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  policyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyPlan: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  policyUin: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
}); 