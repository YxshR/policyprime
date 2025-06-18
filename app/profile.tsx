import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Divider, List, Surface, Switch } from 'react-native-paper';

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

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
        setUserEmail('john.doe@example.com');
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('login');
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('userToken');
              await AsyncStorage.removeItem('userToken');
              setIsLoggedIn(false);
              
              // Navigate to home screen
              router.replace('/');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(!notificationsEnabled);
  };

  const toggleBiometric = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBiometricEnabled(!biometricEnabled);
  };

  const toggleDarkMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDarkModeEnabled(!darkModeEnabled);
  };

  const renderLoginPrompt = () => (
    <Surface style={styles.loginPromptContainer}>
      <Avatar.Icon size={80} icon="account" style={styles.guestAvatar} />
      <Text style={styles.guestTitle}>Guest User</Text>
      <Text style={styles.guestMessage}>
        Please log in to access your profile and manage your account settings.
      </Text>
      <Button
        mode="contained"
        onPress={handleLogin}
        style={styles.loginButton}
        labelStyle={styles.buttonLabel}
      >
        Login
      </Button>
    </Surface>
  );

  const renderProfile = () => (
    <ScrollView style={styles.profileContainer}>
      <Surface style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={userName.split(' ').map(name => name[0]).join('')} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
        </View>
        
        <Button
          mode="outlined"
          onPress={() => router.push('edit-profile')}
          style={styles.editProfileButton}
          labelStyle={styles.editProfileLabel}
          icon="pencil"
        >
          Edit Profile
        </Button>
      </Surface>
      
      <Surface style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Account Settings</Text>
        
        <List.Item
          title="Personal Information"
          description="Update your personal details"
          left={props => <List.Icon {...props} icon="account-details" color="#4F6CFF" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('personal-info')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Security"
          description="Password and authentication"
          left={props => <List.Icon {...props} icon="shield-account" color="#4F6CFF" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('security')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Notifications"
          description="Manage your notification preferences"
          left={props => <List.Icon {...props} icon="bell" color="#4F6CFF" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              color="#4F6CFF"
            />
          )}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Biometric Login"
          description="Use fingerprint or face recognition"
          left={props => <List.Icon {...props} icon="fingerprint" color="#4F6CFF" />}
          right={() => (
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              color="#4F6CFF"
            />
          )}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Dark Mode"
          description="Toggle dark/light theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" color="#4F6CFF" />}
          right={() => (
            <Switch
              value={darkModeEnabled}
              onValueChange={toggleDarkMode}
              color="#4F6CFF"
            />
          )}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
      </Surface>
      
      <Surface style={styles.supportCard}>
        <Text style={styles.settingsTitle}>Support</Text>
        
        <List.Item
          title="Help Center"
          description="FAQs and support resources"
          left={props => <List.Icon {...props} icon="help-circle" color="#4F6CFF" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('help')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Contact Us"
          description="Get in touch with our support team"
          left={props => <List.Icon {...props} icon="message" color="#4F6CFF" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('contact')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="About"
          description="App version and information"
          left={props => <List.Icon {...props} icon="information" color="#4F6CFF" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push('about')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
        />
      </Surface>
      
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        labelStyle={styles.logoutLabel}
        icon="logout"
      >
        Logout
      </Button>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>PolicyPrime v1.0.0</Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#4F6CFF', '#6E8AFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Profile</Text>
        {isLoggedIn && (
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        )}
      </LinearGradient>
      
      {isLoggedIn ? renderProfile() : renderLoginPrompt()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
  },
  guestAvatar: {
    backgroundColor: 'rgba(79, 108, 255, 0.2)',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  guestMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    borderRadius: 30,
    paddingHorizontal: 32,
    backgroundColor: '#4F6CFF',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileContainer: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#4F6CFF',
  },
  profileInfo: {
    marginLeft: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  editProfileButton: {
    borderColor: '#4F6CFF',
    borderRadius: 8,
  },
  editProfileLabel: {
    color: '#4F6CFF',
  },
  settingsCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    marginLeft: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  listItemDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  supportCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    marginBottom: 24,
  },
  logoutButton: {
    borderRadius: 8,
    marginBottom: 24,
    backgroundColor: '#CF6679',
  },
  logoutLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
}); 