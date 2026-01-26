import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { IUserProfile } from '@types/index';

class AuthService {
  private currentUser: FirebaseAuthTypes.User | null = null;

  constructor() {
    auth().onAuthStateChanged((user) => {
      this.currentUser = user;
    });
  }

  async signInAnonymously(): Promise<IUserProfile> {
    try {
      const result = await auth().signInAnonymously();
      const profile = await this.createAnonymousUserProfile(result.user.uid);
      return profile;
    } catch (error) {
      throw new Error(`Anonymous sign-in failed: ${error}`);
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<IUserProfile> {
    try {
      const result = await auth().createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName });
      const profile = await this.createUserProfile(result.user.uid, email, displayName);
      return profile;
    } catch (error) {
      throw new Error(`Sign-up failed: ${error}`);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<IUserProfile> {
    try {
      const result = await auth().signInWithEmailAndPassword(email, password);
      const profile = await this.getUserProfile(result.user.uid);
      return profile;
    } catch (error) {
      throw new Error(`Sign-in failed: ${error}`);
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      throw new Error(`Sign-out failed: ${error}`);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw new Error(`Password reset failed: ${error}`);
    }
  }

  async getCurrentUser(): Promise<IUserProfile | null> {
    if (!this.currentUser) return null;
    return this.getUserProfile(this.currentUser.uid);
  }

  async getUserProfile(uid: string): Promise<IUserProfile> {
    try {
      const doc = await firestore().collection('users').doc(uid).collection('profile').doc('data').get();

      if (!doc.exists) {
        throw new Error('User profile not found');
      }

      return doc.data() as IUserProfile;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error}`);
    }
  }

  private async createAnonymousUserProfile(uid: string): Promise<IUserProfile> {
    const profile: IUserProfile = {
      uid,
      displayName: `Anonymous User`,
      preferredLanguage: 'es',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore()
      .collection('users')
      .doc(uid)
      .collection('profile')
      .doc('data')
      .set(profile);

    return profile;
  }

  private async createUserProfile(
    uid: string,
    email: string,
    displayName: string
  ): Promise<IUserProfile> {
    const profile: IUserProfile = {
      uid,
      email,
      displayName,
      preferredLanguage: 'es',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore()
      .collection('users')
      .doc(uid)
      .collection('profile')
      .doc('data')
      .set(profile);

    return profile;
  }

  async updateUserProfile(uid: string, updates: Partial<IUserProfile>): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('profile')
        .doc('data')
        .update({
          ...updates,
          updatedAt: new Date(),
        });
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error}`);
    }
  }

  async deleteAccount(uid: string): Promise<void> {
    try {
      // Delete user data from Firestore
      await firestore().collection('users').doc(uid).delete();
      // Delete authentication user
      await this.currentUser?.delete();
    } catch (error) {
      throw new Error(`Failed to delete account: ${error}`);
    }
  }

  isCurrentUserAnonymous(): boolean {
    return this.currentUser?.isAnonymous || false;
  }

  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }
}

export const authService = new AuthService();
