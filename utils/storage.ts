import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens } from '@/types';

const TOKEN_STORAGE_KEY = 'auth_tokens';

export const storeTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error storing auth tokens:', error);
  }
};

export const getTokens = async (): Promise<AuthTokens | null> => {
  try {
    const tokensStr = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return tokensStr ? JSON.parse(tokensStr) : null;
  } catch (error) {
    console.error('Error retrieving auth tokens:', error);
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};