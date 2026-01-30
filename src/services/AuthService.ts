import { initializeApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously,
  onAuthStateChanged,
  AuthError,
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export interface IAuthError {
  code: string;
  message: string;
}

/**
 * AuthService: Firebase Authentication wrapper
 * Handles user authentication, session management, and auth state
 */
class AuthService {
  private auth: Auth;

  constructor() {
    this.auth = auth;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('[AuthService] User signed up:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthService] Sign up error:', authError.code, authError.message);
      throw this.normalizeError(authError);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('[AuthService] User signed in:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthService] Sign in error:', authError.code, authError.message);
      throw this.normalizeError(authError);
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<User> {
    try {
      const userCredential = await signInAnonymously(this.auth);
      console.log('[AuthService] Anonymous sign in:', userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthService] Anonymous sign in error:', authError.code);
      throw this.normalizeError(authError);
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('[AuthService] User logged out');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthService] Logout error:', authError.code);
      throw this.normalizeError(authError);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('[AuthService] Password reset email sent');
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthService] Password reset error:', authError.code);
      throw this.normalizeError(authError);
    }
  }

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get user ID token
   */
  async getIdToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    return await user.getIdToken();
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Normalize Firebase auth errors to standard format
   */
  private normalizeError(error: AuthError): IAuthError {
    let message = 'Authentication error';

    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'Email already registered';
        break;
      case 'auth/operation-not-allowed':
        message = 'This operation is not allowed';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak (min 6 characters)';
        break;
      case 'auth/account-exists-with-different-credential':
        message = 'Email already associated with different sign-in method';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Check your connection';
        break;
      default:
        message = error.message || 'Authentication failed';
    }

    return {
      code: error.code,
      message,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();

export default AuthService;
