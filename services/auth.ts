import { User, AuthTokens } from '@/types';

// Mock API functions
export const login = async (credentials: { email?: string; phone?: string; password: string }): Promise<{ user: User; tokens: AuthTokens }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check for valid credentials (mock validation)
  if (credentials.password !== 'password123') {
    throw new Error('Invalid credentials');
  }
  
  // Return mock user and tokens
  return {
    user: {
      id: '1',
      name: 'John Doe',
      email: credentials.email || 'john.doe@example.com',
      phone: credentials.phone || '(123) 456-7890',
    },
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    },
  };
};

export const register = async (data: { email?: string; phone?: string; password: string }) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success
  return { success: true };
};

export const verifyOTP = async (email?: string, phone?: string, otp?: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock OTP validation
  return otp === '123456';
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock token validation and refresh
  if (refreshToken === 'invalid-token') {
    return null;
  }
  
  return {
    accessToken: 'new-mock-access-token',
    refreshToken: 'new-mock-refresh-token',
    expiresIn: 3600,
  };
};

export const sendOTP = async (email?: string, phone?: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock sending OTP
  return true;
};