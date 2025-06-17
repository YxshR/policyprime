import { createRealmContext } from '@realm/react';
import * as Realm from 'realm';

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://yash123456789yg:zje628nfjdaEDSjp@cluster0.9p3ka6n.mongodb.net/";

// Define schemas for our collections
const UserSchema = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    name: 'string',
    email: 'string',
    phone: 'string?',
    passwordHash: 'string',
    createdAt: 'date',
    updatedAt: 'date',
  },
};

const PolicySchema = {
  name: 'Policy',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    name: 'string',
    planNo: 'string',
    uinNo: 'string',
    category: 'string',
    description: 'string?',
    benefits: 'string[]',
    eligibility: 'string?',
    documents: 'string[]',
  },
};

const UserPolicySchema = {
  name: 'UserPolicy',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    userId: 'objectId',
    policyId: 'objectId',
    policyNo: 'string',
    startDate: 'date',
    maturityDate: 'date',
    premiumAmount: 'double',
    premiumFrequency: 'string',
    nextPremiumDate: 'date',
    sumAssured: 'double',
    status: 'string',
  },
};

// Create a configuration object
const realmConfig = {
  schema: [UserSchema, PolicySchema, UserPolicySchema],
};

// Create a realm context
export const { RealmProvider, useRealm, useQuery, useObject } = createRealmContext(realmConfig);

// MongoDB service class
class MongoDBService {
  constructor() {
    this.app = null;
    this.user = null;
    this.realm = null;
    this.initialized = false;
  }

  // Initialize MongoDB connection
  async initialize() {
    try {
      if (this.initialized) return;

      // Initialize the Realm app
      this.app = new Realm.App({ id: "policyprime-app" });
      
      console.log('MongoDB service initialized');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MongoDB service:', error);
      throw error;
    }
  }

  // Register a new user
  async registerUser(email, password, userData) {
    try {
      await this.initialize();
      
      // Register the user with email/password
      await this.app.emailPasswordAuth.registerUser({ email, password });
      
      // Log in the user
      this.user = await this.app.logIn(Realm.Credentials.emailPassword(email, password));
      
      // Get a MongoDB collection reference
      const mongodb = this.user.mongoClient("mongodb-atlas");
      const usersCollection = mongodb.db("policyprime").collection("users");
      
      // Insert user data
      const result = await usersCollection.insertOne({
        ...userData,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return result;
    } catch (error) {
      console.error('Failed to register user:', error);
      throw error;
    }
  }

  // Login a user
  async loginUser(email, password) {
    try {
      await this.initialize();
      
      // Login with email/password
      this.user = await this.app.logIn(Realm.Credentials.emailPassword(email, password));
      
      // Get user data
      const mongodb = this.user.mongoClient("mongodb-atlas");
      const usersCollection = mongodb.db("policyprime").collection("users");
      const userData = await usersCollection.findOne({ email });
      
      return {
        user: this.user,
        userData,
      };
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }

  // Logout the current user
  async logoutUser() {
    try {
      if (this.user) {
        await this.user.logOut();
        this.user = null;
      }
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.app?.currentUser;
  }

  // Get policies by category
  async getPoliciesByCategory(category) {
    try {
      await this.initialize();
      
      // If not logged in, use anonymous auth
      if (!this.user) {
        this.user = await this.app.logIn(Realm.Credentials.anonymous());
      }
      
      const mongodb = this.user.mongoClient("mongodb-atlas");
      const policiesCollection = mongodb.db("policyprime").collection("policies");
      
      const policies = await policiesCollection.find({ category });
      return policies;
    } catch (error) {
      console.error('Failed to get policies:', error);
      throw error;
    }
  }

  // Get policy by ID
  async getPolicyById(policyId) {
    try {
      await this.initialize();
      
      // If not logged in, use anonymous auth
      if (!this.user) {
        this.user = await this.app.logIn(Realm.Credentials.anonymous());
      }
      
      const mongodb = this.user.mongoClient("mongodb-atlas");
      const policiesCollection = mongodb.db("policyprime").collection("policies");
      
      const policy = await policiesCollection.findOne({ _id: policyId });
      return policy;
    } catch (error) {
      console.error('Failed to get policy:', error);
      throw error;
    }
  }

  // Get user policies
  async getUserPolicies() {
    try {
      await this.initialize();
      
      if (!this.user) {
        throw new Error('User not logged in');
      }
      
      const mongodb = this.user.mongoClient("mongodb-atlas");
      const userPoliciesCollection = mongodb.db("policyprime").collection("userPolicies");
      
      const userPolicies = await userPoliciesCollection.find({ userId: this.user.id });
      return userPolicies;
    } catch (error) {
      console.error('Failed to get user policies:', error);
      throw error;
    }
  }

  // Calculate premium
  async calculatePremium(policyId, userData) {
    try {
      await this.initialize();
      
      // If not logged in, use anonymous auth
      if (!this.user) {
        this.user = await this.app.logIn(Realm.Credentials.anonymous());
      }
      
      const mongodb = this.user.mongoClient("mongodb-atlas");
      
      // In a real app, you would call a MongoDB function to calculate the premium
      // For demo purposes, we'll simulate a calculation on the client side
      
      // Get the policy details
      const policiesCollection = mongodb.db("policyprime").collection("policies");
      const policy = await policiesCollection.findOne({ _id: policyId });
      
      if (!policy) {
        throw new Error('Policy not found');
      }
      
      // Simple premium calculation (for demonstration)
      const { age, gender, sumAssured, term, paymentFrequency } = userData;
      
      // Base rate per 1000 of sum assured
      let baseRate = 0;
      
      // Different rates based on policy category
      switch (policy.category) {
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
        totalAnnual: Math.round(annualPremium),
        policyDetails: policy,
      };
    } catch (error) {
      console.error('Failed to calculate premium:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const mongoDBService = new MongoDBService();
export default mongoDBService; 