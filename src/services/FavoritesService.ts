import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_CACHE_KEY = 'pharmacy_favorites';

class FavoritesService {
  async addFavorite(userId: string, pharmacyId: string): Promise<void> {
    try {
      // Add to Firestore
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .doc(pharmacyId)
        .set({ pharmacyId, addedAt: new Date() });

      // Add to local cache
      const favorites = await this.getCachedFavorites(userId);
      if (!favorites.includes(pharmacyId)) {
        favorites.push(pharmacyId);
        await this.cacheFavorites(userId, favorites);
      }
    } catch (error) {
      throw new Error(`Failed to add favorite: ${error}`);
    }
  }

  async removeFavorite(userId: string, pharmacyId: string): Promise<void> {
    try {
      // Remove from Firestore
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .doc(pharmacyId)
        .delete();

      // Remove from local cache
      const favorites = await this.getCachedFavorites(userId);
      const filtered = favorites.filter((id) => id !== pharmacyId);
      await this.cacheFavorites(userId, filtered);
    } catch (error) {
      throw new Error(`Failed to remove favorite: ${error}`);
    }
  }

  async getFavorites(userId: string): Promise<string[]> {
    try {
      // Try Firestore first
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .get();

      const favorites = snapshot.docs.map((doc) => doc.id);

      // Cache locally
      await this.cacheFavorites(userId, favorites);

      return favorites;
    } catch (error) {
      // Fallback to local cache
      return this.getCachedFavorites(userId);
    }
  }

  async isFavorite(userId: string, pharmacyId: string): Promise<boolean> {
    try {
      const doc = await firestore()
        .collection('users')
        .doc(userId)
        .collection('favorites')
        .doc(pharmacyId)
        .get();

      return doc.exists;
    } catch (error) {
      // Fallback to local cache
      const favorites = await this.getCachedFavorites(userId);
      return favorites.includes(pharmacyId);
    }
  }

  private async cacheFavorites(userId: string, favorites: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${FAVORITES_CACHE_KEY}_${userId}`,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('Failed to cache favorites:', error);
    }
  }

  private async getCachedFavorites(userId: string): Promise<string[]> {
    try {
      const cached = await AsyncStorage.getItem(`${FAVORITES_CACHE_KEY}_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Failed to get cached favorites:', error);
      return [];
    }
  }
}

export const favoritesService = new FavoritesService();
