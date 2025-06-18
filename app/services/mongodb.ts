import AsyncStorage from '@react-native-async-storage/async-storage';

// MongoDB connection string (for reference, not used in Expo Go)
const MONGODB_URI = "mongodb+srv://yash123456789yg:zje628nfjdaEDSjp@cluster0.9p3ka6n.mongodb.net/";

// Define types
type User = {
  id: string;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
};

type Policy = {
  id: string;
  name: string;
  planNo: string;
  uinNo: string;
};

type PolicyCategories = {
  endowment: Policy[];
  wholelife: Policy[];
  moneyback: Policy[];
  term: Policy[];
  riders: Policy[];
  [key: string]: Policy[];
};

type TokenInfo = {
  token: string;
  expiryTime: number;
};

type LoginResponse = {
  success: boolean;
  user: User;
  token: string;
  expiryTime: number;
};

type LoginStatusResponse = {
  isLoggedIn: boolean;
  user?: User;
  tokenExpired?: boolean;
  error?: any;
};

type PremiumResponse = {
  premium: number;
  frequency: string;
  totalAnnual: number;
};

// Define type for saved premium calculation
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

// Maximum number of saved premium calculations allowed per user
const MAX_SAVED_PREMIUMS = 6;

// Mock data for policies
const mockPolicies: PolicyCategories = {
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

type PremiumCalculationData = {
  age: number;
  gender: string;
  sumAssured: number;
  term: number;
  paymentFrequency: string;
  category: string;
};

// MongoDB service class
class MongoDBService {
  private initialized: boolean;
  private tokenExpiryTime: number;

  constructor() {
    this.initialized = false;
    this.tokenExpiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Initialize service
  async initialize(): Promise<void> {
    try {
      if (this.initialized) return;
      
      // Check if there are any users, if not create a demo user
      const users = await this.getUsers();
      if (users.length === 0) {
        const demoUser: User = {
          id: '1',
          email: 'demo@example.com',
          password: 'password123',
          name: 'Demo User',
          phone: '9876543210',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem('users', JSON.stringify([demoUser]));
        console.log('Demo user created: demo@example.com / password123');
      }
      
      console.log('MongoDB service initialized (mock for Expo Go)');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MongoDB service:', error);
      throw error;
    }
  }

  // Generate a refresh token with expiry time
  generateRefreshToken(): TokenInfo {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiryTime = new Date().getTime() + this.tokenExpiryTime;
    return { token, expiryTime };
  }

  // Check if token is expired
  isTokenExpired(expiryTime: number): boolean {
    return new Date().getTime() > expiryTime;
  }

  // Register a new user
  async registerUser(email: string, password: string, userData: any): Promise<{ success: boolean }> {
    try {
      await this.initialize();
      
      // Store user data in AsyncStorage
      const users = await this.getUsers();
      
      // Check if user already exists with the same email
      if (users.find(user => user.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Check if user already exists with the same phone number (if provided)
      if (userData.phone && users.find(user => user.phone === userData.phone)) {
        throw new Error('User with this phone number already exists');
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password, // In a real app, this would be hashed
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    const usersJson = await AsyncStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  // Login a user
  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      await this.initialize();
      
      // Get users from AsyncStorage
      const users = await this.getUsers();
      
      // Find user
      const user = users.find(user => user.email === email && user.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Generate refresh token
      const { token, expiryTime } = this.generateRefreshToken();
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('tokenExpiry', expiryTime.toString());
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      
      return {
        success: true,
        user,
        token,
        expiryTime
      };
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }

  // Check if user is logged in and token is valid
  async checkLoginStatus(): Promise<LoginStatusResponse> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const expiryTimeStr = await AsyncStorage.getItem('tokenExpiry');
      
      if (!token || !expiryTimeStr) {
        return { isLoggedIn: false };
      }
      
      const expiryTime = parseInt(expiryTimeStr);
      
      if (this.isTokenExpired(expiryTime)) {
        // Token expired, logout user
        await this.logoutUser();
        return { isLoggedIn: false, tokenExpired: true };
      }
      
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
      
      return {
        isLoggedIn: true,
        user: currentUser
      };
    } catch (error) {
      console.error('Failed to check login status:', error);
      return { isLoggedIn: false, error };
    }
  }

  // Logout the current user
  async logoutUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('tokenExpiry');
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }

  // Get policies by category
  async getPoliciesByCategory(category: string): Promise<Policy[]> {
    try {
      await this.initialize();
      
      // Return mock data for Expo Go
      return mockPolicies[category] || [];
    } catch (error) {
      console.error('Failed to get policies:', error);
      throw error;
    }
  }

  // Get policy by ID
  async getPolicyById(policyId: string, category: string): Promise<Policy | null> {
    try {
      await this.initialize();
      
      // Find policy in mock data
      const policies = mockPolicies[category] || [];
      return policies.find(policy => policy.id === policyId) || null;
    } catch (error) {
      console.error('Failed to get policy:', error);
      throw error;
    }
  }

  // Calculate premium
  async calculatePremium(userData: PremiumCalculationData): Promise<PremiumResponse> {
    try {
      await this.initialize();
      
      const { age, gender, sumAssured, term, paymentFrequency, category } = userData;
      
      // Base rate per 1000 of sum assured
      let baseRate = 0;
      
      // Different rates based on policy category
      switch (category) {
        case 'endowment':
          baseRate = 45;
          break;
        case 'wholelife':
          baseRate = 55;
          break;
        case 'moneyback':
          baseRate = 40;
          break;
        case 'term':
          baseRate = 5;
          break;
        default:
          baseRate = 30;
      }
      
      // Age factor
      const ageFactor = 1 + (age - 20) * 0.03;
      
      // Gender factor
      const genderFactor = gender === 'male' ? 1.1 : 1;
      
      // Term factor
      const termFactor = 1 - (term - 10) * 0.01;
      
      // Calculate annual premium
      let annualPremium = (sumAssured / 1000) * baseRate * ageFactor * genderFactor * termFactor;
      
      // Adjust for payment frequency
      let finalPremium = 0;
      let frequencyText = '';
      
      switch (paymentFrequency) {
        case 'annual':
          finalPremium = annualPremium;
          frequencyText = 'Annual';
          break;
        case 'semiannual':
          finalPremium = annualPremium * 0.51;
          frequencyText = 'Semi-Annual';
          break;
        case 'quarterly':
          finalPremium = annualPremium * 0.26;
          frequencyText = 'Quarterly';
          break;
        case 'monthly':
          finalPremium = annualPremium * 0.09;
          frequencyText = 'Monthly';
          break;
      }
      
      return {
        premium: Math.round(finalPremium),
        frequency: frequencyText,
        totalAnnual: Math.round(annualPremium)
      };
    } catch (error) {
      console.error('Failed to calculate premium:', error);
      throw error;
    }
  }

  // Get saved premium calculations for the current user
  async getSavedCalculations(): Promise<SavedCalculation[]> {
    try {
      await this.initialize();
      
      // Get current user
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        throw new Error('No user is currently logged in');
      }
      
      const currentUser = JSON.parse(currentUserJson);
      
      // Get all saved calculations
      const savedCalcsJson = await AsyncStorage.getItem('savedCalculations');
      if (!savedCalcsJson) {
        return [];
      }
      
      const allCalculations: SavedCalculation[] = JSON.parse(savedCalcsJson);
      
      // Filter calculations for current user
      return allCalculations.filter(calc => calc.userId === currentUser.id);
    } catch (error) {
      console.error('Failed to get saved calculations:', error);
      throw error;
    }
  }

  // Save a premium calculation
  async savePremiumCalculation(calculationData: Omit<SavedCalculation, 'id' | 'createdAt'>): Promise<SavedCalculation> {
    try {
      await this.initialize();
      
      // Get current user
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        throw new Error('No user is currently logged in');
      }
      
      const currentUser = JSON.parse(currentUserJson);
      
      // Get all saved calculations
      const savedCalcsJson = await AsyncStorage.getItem('savedCalculations');
      const allCalculations: SavedCalculation[] = savedCalcsJson ? JSON.parse(savedCalcsJson) : [];
      
      // Filter calculations for current user
      const userCalculations = allCalculations.filter(calc => calc.userId === currentUser.id);
      
      // Check if user has reached the maximum number of saved calculations
      if (userCalculations.length >= MAX_SAVED_PREMIUMS) {
        throw new Error(`You can only save up to ${MAX_SAVED_PREMIUMS} premium calculations. Please delete some before saving more.`);
      }
      
      // Create new calculation
      const newCalculation: SavedCalculation = {
        ...calculationData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      // Add to all calculations
      allCalculations.push(newCalculation);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('savedCalculations', JSON.stringify(allCalculations));
      
      return newCalculation;
    } catch (error) {
      console.error('Failed to save premium calculation:', error);
      throw error;
    }
  }

  // Delete a saved premium calculation
  async deleteSavedCalculation(calculationId: string): Promise<boolean> {
    try {
      await this.initialize();
      
      // Get current user
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        throw new Error('No user is currently logged in');
      }
      
      const currentUser = JSON.parse(currentUserJson);
      
      // Get all saved calculations
      const savedCalcsJson = await AsyncStorage.getItem('savedCalculations');
      if (!savedCalcsJson) {
        return false;
      }
      
      const allCalculations: SavedCalculation[] = JSON.parse(savedCalcsJson);
      
      // Find calculation to delete
      const calculationIndex = allCalculations.findIndex(
        calc => calc.id === calculationId && calc.userId === currentUser.id
      );
      
      if (calculationIndex === -1) {
        return false;
      }
      
      // Remove calculation
      allCalculations.splice(calculationIndex, 1);
      
      // Save updated calculations
      await AsyncStorage.setItem('savedCalculations', JSON.stringify(allCalculations));
      
      return true;
    } catch (error) {
      console.error('Failed to delete saved calculation:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const mongoDBService = new MongoDBService();
export default mongoDBService; 