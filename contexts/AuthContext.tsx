import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { clearTokens, getTokens, storeTokens } from '@/utils/storage';
import { 
  GetProfile, 
  login as loginApi, 
  refreshAccessToken, 
  updateUserField
} from '@/services/auth';
import { fetchAuthorityRoles, getAuthorityUserByEmail } from '@/services/authorityService';
import { User, UserRole, AuthorityUser } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; phone?: string; otpVerified?: boolean, user: User }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  requiresOTPVerification: (field: string) => boolean;
  userData: User | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<User | null>(null);
  const [authorityRoles, setAuthorityRoles] = useState<Record<string, AuthorityUser>>({});
  const [isLoading, setIsLoading] = useState(true);
  const rolesLoadedRef = useRef(false);

  // Load authority roles from the backend - not dependent on any state
  const loadAuthorityRoles = async () => {
    // Only fetch if not already loaded or if cache is empty
    if (rolesLoadedRef.current && Object.keys(authorityRoles).length > 0) {
      return authorityRoles;
    }
    
    try {
      const roles = await fetchAuthorityRoles();
      setAuthorityRoles(roles);
      rolesLoadedRef.current = true;
      return roles;
    } catch (error) {
      console.error('Failed to load authority roles:', error);
      return {};
    }
  };

  // Check if a user is an authority based on their email
  const checkIfUserIsAuthority = useCallback((email: string): boolean => {
    return !!getAuthorityUserByEmail(email, authorityRoles);
  }, [authorityRoles]);

  // Get user role from email
  const getUserRoleFromEmail = useCallback((email: string): UserRole | undefined => {
    const authorityUser = getAuthorityUserByEmail(email, authorityRoles);
    return authorityUser?.role as UserRole || 'user';
  }, [authorityRoles]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const roles = await loadAuthorityRoles();
      const tokens = await getTokens();
      
      if (tokens) {
        try {
          const newTokens = await refreshAccessToken(tokens.refreshToken);
          if (newTokens) {
            await storeTokens(newTokens);
            const profileData = await GetProfile(newTokens.accessToken);
            // Set user data even if email is missing to avoid unintended logout UI state
            if (profileData) {
              if (profileData.email) {
                const authorityUser = getAuthorityUserByEmail(profileData.email, roles);
                const isAuthority = !!authorityUser;
                const role: UserRole | undefined =
                  (profileData.isSuperAdmin ? 'super_admin' : (authorityUser?.role as UserRole | undefined)) ||
                  (profileData.role as UserRole | undefined) ||
                  'user';

                const enhancedProfileData = {
                  ...profileData,
                  isAuthority,
                  role
                };
                setUserData(enhancedProfileData);
              } else {
                // No email in profile; still keep the session with the basic profile
                setUserData(profileData);
              }
            }
          } else {
            await clearTokens();
            setUserData(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          await clearTokens();
          setUserData(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email?: string; phone?: string; otpVerified?: boolean, user: User }) => {
    if (!credentials.otpVerified) {
      throw new Error('OTP verification required');
    }

    setIsLoading(true);
    try {
      // Ensure we have the latest authority roles
      const roles = await loadAuthorityRoles();
      
      const { user } = await loginApi(credentials);
      
      // Set user role and authority status based on email
      if (user.email) {
        const authorityUser = getAuthorityUserByEmail(user.email, roles);
        if (authorityUser) {
          user.role = authorityUser.role as UserRole;
          user.isAuthority = true;
          user.department = authorityUser.department;
        } else {
          user.role = 'user';
          user.isAuthority = false;
        }
      }
      
      if (user.authToken) {
        await storeTokens(user.authToken);
      }
      setUserData(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await clearTokens();
    setUserData(null);
    setIsLoading(false);
  };

  const requiresOTPVerification = (field: string): boolean => {
    return field !== 'name';
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    console.log('Updating user profile:', userData);
    await updateUserField(userData?.uid || '', 'name', userData.name || '', false);
    
    let updatedUserData = { ...userData };
    if (userData.email) {
      updatedUserData.isAuthority = checkIfUserIsAuthority(userData.email);
      updatedUserData.role = getUserRoleFromEmail(userData.email);
    }
    
    const updateUser = (userData: Partial<User>): Promise<void> => {
      return new Promise<void>((resolve) => {
        setUserData(prev => {
          const updatedUser = {
            ...prev!,
            ...userData
          };
          // Resolve the promise after the state is updated
          Promise.resolve().then(resolve);
          return updatedUser;
        });
      });
    };

    await updateUser(updatedUserData);
  };

  return (
    <AuthContext.Provider
      value={{
        user: userData,
        isAuthenticated: !!userData,
        isLoading,
        login,
        logout,
        updateUserProfile,
        requiresOTPVerification,
        userData,
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