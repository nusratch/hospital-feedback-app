// Environment variables configuration
// This file centralizes access to environment variables with fallbacks
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
// Use different base URL for mobile vs web to handle Expo Go connectivity
const getDefaultApiUrl = () => {
  // On mobile devices in development, we need to use the local network IP
  // instead of localhost because localhost on a mobile device refers to the device itself
  if (Platform.OS === 'web') {
    // return 'http://172.26.59.176:4000';
    return 'https://hospital-feedback-app-backend.vercel.app';

  } else {
    // For Expo Go on mobile, we can use the manifest URL to get the development server IP
    // This automatically uses the correct IP address without hardcoding
    try {
      // @ts-ignore - Expo manifest typing
      const debuggerHost = '172.26.59.176';//Constants.manifest2?.extra?.expoGo?.debuggerHost ||
      // @ts-ignore - For older Expo versions
      // Constants.manifest?.debuggerHost;

      if (debuggerHost) {
        const hostUri = debuggerHost.split(':')[0];
        // return `http://${hostUri}:4000`;
        return 'https://hospital-feedback-app-backend.vercel.app';

      }
    } catch (e) {
      console.log('Could not determine development server IP, falling back to localhost');
    }

    // Fallback to a common development IP address if we can't get it automatically
    // You may need to change this to your actual IP address if it doesn't work
    // return 'http://10.0.2.2:4000'; // Android emulator default
    return 'https://hospital-feedback-app-backend.vercel.app';

  }
};

export const API_BASE_URL = process.env.API_BASE_URL || getDefaultApiUrl();

// Authentication
export const AUTH_TOKEN_EXPIRY = Number(process.env.AUTH_TOKEN_EXPIRY || '3600');

// App Configuration
export const APP_NAME = process.env.APP_NAME || 'Hospital Feedback App';

// Helper function to get the full API URL for a specific endpoint
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
