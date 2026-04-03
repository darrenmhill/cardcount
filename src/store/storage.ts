import { Platform } from 'react-native';

const STORAGE_KEY = 'cardcount-settings';

/**
 * Cross-platform persistent storage.
 * Uses localStorage on web (AsyncStorage doesn't persist across reloads),
 * and AsyncStorage on native.
 */
export const Storage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    }
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return AsyncStorage.getItem(STORAGE_KEY);
  },

  async set(value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // quota exceeded or private browsing
      }
      return;
    }
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(STORAGE_KEY, value);
  },
};
