import { AuthorityUser, AuthorityRoleMapping } from '@/types';

const fallbackAuthorityRoles = AuthorityRoleMapping;

// This would be replaced with actual API calls in production
const API_BASE_URL = 'http://localhost:4000';

/**
 * Fetches the list of authority users from the backend
 * @returns Promise<Record<string, AuthorityUser>>
 */
export const fetchAuthorityRoles = async (): Promise<Record<string, AuthorityUser>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/authorities`);
    if (!response.ok) {
      throw new Error('Failed to fetch authority roles');
    }
    const data = await response.json();
    
    // Check if the response is in the expected format
    if (Array.isArray(data) || typeof data !== 'object' || !data) {
      console.warn('API returned unexpected format, using fallback authority roles');
      return fallbackAuthorityRoles;
    }
    
    console.log("::::::::data", data)
    // Validate that the data contains AuthorityUser objects
    const isValidFormat = Object.values(data.data).every(user => 
      user && typeof user === 'object' && 'email' in user && 'name' in user
    );
    
    if (!isValidFormat) {
      console.warn('API returned invalid authority user format, using fallback');
      return fallbackAuthorityRoles;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching authority roles:', error);
    // Return the local mapping as fallback
    return fallbackAuthorityRoles;
  }
};

/**
 * Updates an authority user in the backend
 * @param role - The role key
 * @param userData - The updated user data
 * @returns Promise<AuthorityUser>
 */
export const updateAuthorityUser = async (
  role: string,
  userData: Partial<AuthorityUser>
): Promise<AuthorityUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/authorities/${role}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to update authority user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating authority user:', error);
    throw error;
  }
};

/**
 * Gets an authority user by email
 * @param email - The email to search for
 * @returns AuthorityUser | undefined
 */
export const getAuthorityUserByEmail = (email: string, authorities: Record<string, AuthorityUser>): AuthorityUser | undefined => {
 console.log("::::::::authorities", authorities);
  return Object.values(authorities).find(user => 
    user && user.email && user.email.toLowerCase() === email.toLowerCase()
  );
};

/**
 * Creates a new authority user in the backend
 * @param role - The role key
 * @param userData - The user data
 * @returns Promise<AuthorityUser>
 */
export const createAuthorityUser = async (
  role: string,
  uid: string,
  userData: AuthorityUser
): Promise<AuthorityUser> => {
  try {
    const response = await fetch(`${API_BASE_URL}/authorities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...userData, role:[role], createdBy: uid, updatedBy: uid }),
    });

    if (!response.ok) {
      throw new Error('Failed to create authority user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating authority user:', error);
    throw error;
  }
};

/**
 * Deletes an authority user from the backend
 * @param role - The role key to delete
 * @returns Promise<boolean>
 */
export const deleteAuthorityUser = async (role: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/authorities/${role}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete authority user');
    }

    return true;
  } catch (error) {
    console.error('Error deleting authority user:', error);
    throw error;
  }
};

/**
 * Gets an authority user by role
 * @param role - The role to search for
 * @returns AuthorityUser | undefined
 */
export const getAuthorityUserByRole = (role: string, authorities: Record<string, AuthorityUser>): AuthorityUser | undefined => {
  return authorities[role];
};
