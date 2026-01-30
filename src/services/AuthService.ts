import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuid } from 'uuid';

export interface IUser {
  uid: string;
  email: string;
  displayName?: string;
}

export interface IAuthError {
  code: string;
  message: string;
}

/**
 * AuthService: Mock Authentication Service
 * Handles user authentication locally without Firebase
 * Ready to be replaced with Firebase when configured
 */
class AuthService {
  private currentUser: IUser | null = null;
  private authStateCallbacks: ((user: IUser | null) => void)[] = [];

  constructor() {
    this.initializeAuthState();
  }

  /**
   * Initialize auth state from AsyncStorage
   */
  private async initializeAuthState(): Promise<void> {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('[AuthService] Failed to initialize auth state:', error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string): Promise<IUser> {
    try {
      // Validate inputs
      if (!email || !password) {
        throw this.createError('auth/invalid-input', 'Email and password are required');
      }

      if (!this.isValidEmail(email)) {
        throw this.createError('auth/invalid-email', 'Invalid email address');
      }

      if (password.length < 6) {
        throw this.createError('auth/weak-password', 'Password is too weak (min 6 characters)');
      }

      // Check if user exists
      const existingUser = await AsyncStorage.getItem(`user_${email}`);
      if (existingUser) {
        throw this.createError('auth/email-already-in-use', 'Email already registered');
      }

      // Create new user
      const newUser: IUser = {
        uid: uuid(),
        email,
        displayName: email.split('@')[0],
      };

      // Store user
      await AsyncStorage.setItem(`user_${email}`, JSON.stringify(newUser));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));

      this.currentUser = newUser;
      this.notifyAuthStateChanged(newUser);

      console.log('[AuthService] User signed up:', newUser.uid);
      return newUser;
    } catch (error) {
      console.error('[AuthService] Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<IUser> {
    try {
      // Validate inputs
      if (!email || !password) {
        throw this.createError('auth/invalid-input', 'Email and password are required');
      }

      // Simulate password check (in real Firebase, this would validate)
      const userData = await AsyncStorage.getItem(`user_${email}`);
      if (!userData) {
        throw this.createError('auth/user-not-found', 'User not found');
      }

      const user: IUser = JSON.parse(userData);

      // Store current user
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUser = user;
      this.notifyAuthStateChanged(user);

      console.log('[AuthService] User signed in:', user.uid);
      return user;
    } catch (error) {
      console.error('[AuthService] Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<IUser> {
    try {
      const anonymousUser: IUser = {
        uid: `anon_${uuid()}`,
        email: 'anonymous@local',
        displayName: 'Anonymous User',
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(anonymousUser));
      this.currentUser = anonymousUser;
      this.notifyAuthStateChanged(anonymousUser);

      console.log('[AuthService] Anonymous sign in:', anonymousUser.uid);
      return anonymousUser;
    } catch (error) {
      console.error('[AuthService] Anonymous sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
      this.currentUser = null;
      this.notifyAuthStateChanged(null);
      console.log('[AuthService] User logged out');
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email (mock)
   */
  async resetPassword(email: string): Promise<void> {
    try {
      if (!this.isValidEmail(email)) {
        throw this.createError('auth/invalid-email', 'Invalid email address');
      }
      // In a real app, this would send an email
      console.log('[AuthService] Password reset email would be sent to:', email);
    } catch (error) {
      console.error('[AuthService] Password reset error:', error);
      throw error;
    }
  }

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): IUser | null {
    return this.currentUser;
  }

  /**
   * Get user ID token
   */
  async getIdToken(): Promise<string> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }
    // Mock token - in real Firebase this would be a JWT
    return `mock_token_${this.currentUser.uid}`;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: IUser | null) => void): () => void {
    this.authStateCallbacks.push(callback);

    // Call immediately with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.authStateCallbacks = this.authStateCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyAuthStateChanged(user: IUser | null): void {
    this.authStateCallbacks.forEach((callback) => callback(user));
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create error object
   */
  private createError(code: string, message: string): IAuthError {
    return { code, message };
  }
}

// Export singleton instance
export const authService = new AuthService();

export default AuthService;
