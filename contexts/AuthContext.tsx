import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clearTokens, getTokens, refreshTokens, storeTokens } from '@/utils/storage';
import { login as loginApi, refreshAccessToken } from '@/services/auth';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for existing tokens on app start
    const initAuth = async () => {
      const tokens = await getTokens();
      if (tokens) {
        try {
          // Try to refresh token
          const newTokens = await refreshAccessToken(tokens.refreshToken);
          if (newTokens) {
            await storeTokens(newTokens);
            
            // Mock fetching user profile
            // In a real app, you would fetch the user profile from API
            setUser({
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '(123) 456-7890',
            });
          } else {
            // If refresh fails, log out
            clearTokens();
            setUser(null);
          }
        } catch (error) {
          // Clear tokens on error
          clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email?: string; phone?: string; password: string }) => {
    setIsLoading(true);
    try {
      const { user, tokens } = await loginApi(credentials);
      await storeTokens(tokens);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await clearTokens();
    setUser(null);
    setIsLoading(false);
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    // In a real app, you would make an API call to update the user profile
    setUser(prev => prev ? { ...prev, ...userData } : null);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}