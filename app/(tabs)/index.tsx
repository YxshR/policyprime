import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello there!</Text>
        <Text style={styles.title}>PolicyPrime</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>LIC Policies</Title>
            <Text style={styles.cardText}>
              Explore our range of LIC policies designed to secure your future.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              onPress={() => router.push('/policies')}
              style={styles.button}
            >
              View Policies
            </Button>
          </Card.Actions>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Dashboard</Title>
            <Text style={styles.cardText}>
              Login to access your personalized dashboard.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="outlined" 
              onPress={() => router.push('/dashboard')}
              style={styles.outlineButton}
              labelStyle={styles.outlineButtonLabel}
            >
              Go to Dashboard
            </Button>
          </Card.Actions>
        </Card>
        
        <View style={styles.quickLinks}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.linkGrid}>
            <Card style={styles.linkCard} onPress={() => {}}>
              <Card.Content style={styles.linkCardContent}>
                <Text style={styles.linkText}>About Us</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.linkCard} onPress={() => {}}>
              <Card.Content style={styles.linkCardContent}>
                <Text style={styles.linkText}>Contact Us</Text>
              </Card.Content>
            </Card>
          </View>
        </View>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    marginBottom: 20,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  cardText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4F6CFF',
    borderRadius: 8,
  },
  outlineButton: {
    borderColor: '#4F6CFF',
    borderRadius: 8,
  },
  outlineButtonLabel: {
    color: '#4F6CFF',
  },
  quickLinks: {
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  linkGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
  },
  linkCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
}); 