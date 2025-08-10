import { User, AuthTokens, AuthorityRoleMapping, UserRole } from '@/types';

const authorityRoleMapping = AuthorityRoleMapping;
import { getApiUrl } from '@/config/env';

// Mock API functions
export const login = async (credentials: { email?: string; phone?: string; otpVerified?: boolean, user: User }): Promise<{ user: User; }> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check for valid OTP verification
  if (!credentials.otpVerified) {
    throw new Error('OTP verification required');
  }

  // Create a user profile if it doesn't exist (simulating first-time login)
  // In a real app, this would check if the user exists in the database
  const isNewUser = Math.random() > 0.5;

  // Return mock user and tokens
  return {
    user: {
      uid: credentials.user.uid,
      name: isNewUser ? 'New User' : 'John Doe',
      email: credentials.user.email || '',
      phoneNumber: credentials.user.phoneNumber || '',
      imageUrl: isNewUser ? undefined : 'https://randomuser.me/api/portraits/men/32.jpg',
      authToken: credentials.user.authToken
    }
  };
};

export const sendOTP = async (email?: string, phone?: string, loginType: string = 'regular'): Promise<{ success: boolean, message?: string }> => {
  try {
    // Prepare request data
    const payload: any = {};

    if (!email && !phone) {
      throw new Error('Email or phone is required');
    }

    if (email) {
      payload.email = email;
    }

    if (phone) {
      payload.phoneNumber = phone;
    }
    // Make API call to send OTP
    // Use different endpoint based on login type
    const endpoint = 'user/sign-up';

    if (loginType === 'authority') {
      payload.role = 'authority';
    }

    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });


    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send OTP:', errorData);
      throw new Error(errorData.message || 'Failed to send OTP');
    }

    const data = await response.json();
    console.log(`OTP sent successfully to ${email || phone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    // For development purposes, return success to simulate success
    // In production, you would want to return { success: false } here
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
};

export const verifyOTP = async (email?: string, phone?: string, otp?: string, loginType: string = 'regular'): Promise<{ verified: boolean; user?: User, message?: string }> => {
  try {
    // Validate input
    if (!otp || otp.length !== 6) {
      return { verified: false };
    }

    // Prepare request data
    const payload: any = {
      otp,
    };

    if (!email && !phone) {
      throw new Error('Email or phone is required');
    }

    if (email) {
      payload.email = email;
    }

    if (phone) {
      payload.phoneNumber = phone;
    }

    if (loginType === 'authority') {
      payload.role = 'authority';
    }
    // Make API call to verify OTP
    // Use different endpoint based on login type
    const endpoint =  'user/verify-otp';
    const response = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to verify OTP:', errorData);
      throw new Error(errorData.message || 'Failed to verify OTP');
    }

    const data = await response.json();

    if (data.uid) {
      // Check if the user is an authority based on email
      const isAuthority = email ? checkIfUserIsAuthority(email) : false;
      const role = email ? getUserRoleFromEmail(email) : undefined;

      // Add authority information to the user data
      const userData = {
        ...data,
        isAuthority,
        role
      };

      return {
        verified: true,
        user: userData
      };
    }

    return { verified: false };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { verified: false, message: (error as Error).message || 'Failed to verify OTP' };
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));


  // Make API call to verify OTP
  const response = await fetch(getApiUrl('user/refresh-token'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    },
  });

  console.log("::::::::::response", response)
  // Mock token validation and refresh
  if (response.status === 401 || !response.ok) {
    return null;
  }

  const data = await response.json();
  console.log("::::::::::data", data)
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  };
};

export const updateUserField = async (userId: string, field: string, value: string, otpVerified?: boolean): Promise<boolean> => {
  try {
    // Check if OTP verification is required for this field
    const requiresOTP = field == 'email' || field == 'phoneNumber';

    if (requiresOTP && !otpVerified) {
      throw new Error('OTP verification required ');
    }

    // Prepare request data
    const payload = {
      userId,
      field,
      value,
      otpVerified
    };

    // Make API call to update user field
    const response = await fetch(getApiUrl(`users/update-user/${userId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(payload)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update user field:', errorData);
      throw new Error(errorData.message || `Failed to update ${field}`);
    }

    const data = await response.json();
    console.log(`Successfully updated user ${userId} field ${field} to ${value}`);

    // Update local storage if email or phone is being updated
    if (field === 'email') {
      localStorage.setItem('userEmail', value);
    } else if (field === 'phone') {
      localStorage.setItem('userPhone', value);
    }

    return data.success;
  } catch (error) {
    console.error('Error updating user field:', error);

    // For development purposes, simulate success
    // In production, you would want to throw the error
    if ((error as Error).message === 'OTP verification required for this field') {
      throw error;
    }

    // Update local storage even in development mode
    if (field === 'email') {
      localStorage.setItem('userEmail', value);
    } else if (field === 'phone') {
      localStorage.setItem('userPhone', value);
    }

    console.log(`[DEV MODE] Simulated update for user ${userId} field ${field} to ${value}`);
    return true;
  }
};

export const GetProfile = async (accessToken: string) => {
  try {
    // Make API call to get user profile
    const response = await fetch(getApiUrl(`user/get-profile`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to get user profile:', errorData);
      throw new Error(errorData.message || 'Failed to get user profile');
    }

    const data = await response.json();

    // Check if the user is an authority based on email
    const isAuthority = data.email ? checkIfUserIsAuthority(data.email) : false;
    const role = data.email ? getUserRoleFromEmail(data.email) : undefined;

    // Add authority information to the user data
    const userData = {
      ...data,
      isAuthority,
      role
    };

    console.log(`Successfully got user profile`);
    return userData;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Helper function to check if a user is an authority based on email
export const checkIfUserIsAuthority = (email: string): boolean => {
  // Check if the email is in the authorityRoleMapping values
  return Object.values(authorityRoleMapping).some(auth =>
    auth.email.toLowerCase() === email.toLowerCase()
  );
};

// Helper function to get user role from email
export const getUserRoleFromEmail = (email: string): UserRole => {
  // Find the authority user by email
  const authorityEntry = Object.entries(authorityRoleMapping).find(
    ([_, auth]) => auth.email.toLowerCase() === email.toLowerCase()
  );

  // Return the role if found, otherwise default to 'user'
  return (authorityEntry?.[0] as UserRole) || 'user';
};

// Helper function to get all authority emails and roles
export const getAllAuthorityEmails = (): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  Object.entries(authorityRoleMapping).forEach(([role, auth]) => {
    result[role] = auth.email;
  });
  return result;
};

// Helper function to update or add authority email mapping (for super admin)
export const updateAuthorityEmail = (role: string, newEmail: string): boolean => {
  try {
    // Check if the role exists in the mapping
    if (authorityRoleMapping[role as keyof typeof authorityRoleMapping]) {
      // Update the email for the existing role
      authorityRoleMapping[role as keyof typeof authorityRoleMapping].email = newEmail;

      // In a real app, you would save this to your backend/database here
      console.log(`Updated authority mapping - ${role}: ${newEmail}`);

      return true;
    }

    console.error(`Role '${role}' not found in authority mapping`);
    return false;
  } catch (error) {
    console.error('Error updating authority email:', error);
    return false;
  }
};
