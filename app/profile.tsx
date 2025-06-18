import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Divider, List, Surface, Switch } from 'react-native-paper';
import AuthGuard from './components/AuthGuard';
import mongoDBService from './services/mongodb';

// Define User type
type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  [key: string]: any;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Use MongoDB service to get user data
      const status = await mongoDBService.checkLoginStatus();
      
      if (status.user) {
        // Set user data from the logged in user
        setUser(status.user);
        setUserName(status.user.name || 'User');
        setUserEmail(status.user.email);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
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
              // Use MongoDB service to logout
              await mongoDBService.logoutUser();
              
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

  return (
    <AuthGuard requireAuth={true}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#4F6CFF', '#6E8AFF']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>My Profile</Text>
        </LinearGradient>
        
        <ScrollView style={styles.profileContainer}>
          <Surface style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={(userName && userName.charAt(0)) || 'U'} 
                style={styles.avatar} 
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail}>{userEmail}</Text>
              </View>
            </View>
            
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Feature Coming Soon', 'Edit profile functionality will be available in the next update.')}
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
              onPress={() => Alert.alert('Feature Coming Soon', 'This functionality will be available in the next update.')}
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
              onPress={() => Alert.alert('Feature Coming Soon', 'This functionality will be available in the next update.')}
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
              onPress={() => Alert.alert('Feature Coming Soon', 'This functionality will be available in the next update.')}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Contact Us"
              description="Get in touch with our team"
              left={props => <List.Icon {...props} icon="email" color="#4F6CFF" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Feature Coming Soon', 'This functionality will be available in the next update.')}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={props => <List.Icon {...props} icon="shield-lock" color="#4F6CFF" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => Alert.alert('Feature Coming Soon', 'This functionality will be available in the next update.')}
              style={styles.listItem}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          </Surface>
          
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonLabel}
            icon="logout"
          >
            Logout
          </Button>
          
          <Text style={styles.versionText}>PolicyPrime v1.0.0</Text>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerGradient: {
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
  logoutButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    alignSelf: 'center',
  },
}); 