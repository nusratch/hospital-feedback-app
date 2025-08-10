import { API_BASE_URL } from '@/config/env';
import { Feedback, FeedbackFieldToRoleMapping, GetUrgencyLevel } from '@/types';

// Define the new feedback submission interface based on backend schema
export interface FeedbackSubmission {
  uid: string;
  hospitalToken: string;
  ratings: {
    doctorBehavior: number;
    nursingStaff: number;
    waitingTime: number;
    cleanliness: number;
    foodQuality: number;
    medicationAvailability: number;
    registrationProcess: number;
    hospitalFacilities: number;
    costOfTreatment: number;
    overallExperience: number;
    additionalComments: string;
    averageRating: number;
  };
}

export const fetchUserFeedbacks = async (userId: string): Promise<Feedback[]> => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const accessToken = JSON.parse(localStorage.getItem('auth_tokens') || '')?.accessToken;
    // Attempt to fetch feedbacks from the API
    const response = await fetch(`${API_BASE_URL}/feedback/feedback-list/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // Assuming token is stored in localStorage
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.feedback || [];
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    // Return mock data as fallback
    return [];
  }
};

export const submitFeedback = async (feedback: FeedbackSubmission): Promise<boolean> => {
  console.log('Submitting feedback:', JSON.stringify(feedback, null, 2));

  try {
    // In a real app, this would be an API call
    // Example API call:
    const accessToken = JSON.parse(localStorage.getItem('auth_tokens') || '')?.accessToken;

    const response = await fetch(`${API_BASE_URL}/feedback/new-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}` // Assuming token is stored in localStorage
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }

    // Add the new feedback to the local state with 'submitted' status
    const newFeedback: Feedback = {
      id: Date.now().toString(), // Temporary ID until backend assigns one
      hospitalName: 'City General Hospital', // This would come from the hospital token in a real app
      averageRating: feedback.ratings.averageRating,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'submitted'
    };

    // In a real app, you would update your state management here
    console.log('New feedback created with submitted status:', newFeedback);

    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

// New function to check feedback status and update it
export const checkFeedbackStatus = async (feedbackId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check feedback status');
    }

    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error('Error checking feedback status:', error);
    return 'submitted'; // Default to submitted if there's an error
  }
};

// Function to fetch feedback items for authority review
export const fetchAuthorityFeedbacks = async (role: string): Promise<any[]> => {
  try {
    const accessToken = JSON.parse(localStorage.getItem('auth_tokens') || '')?.accessToken;
    
    // In a real app, this would be an API call to get feedback items for the authority
    const response = await fetch(`${API_BASE_URL}/authorities/feedback-list/${role}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      // For development/demo purposes, generate mock data
      return generateMockAuthorityFeedbacks(role);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching authority feedbacks:', error);
    // For development/demo purposes, generate mock data
    return generateMockAuthorityFeedbacks(role);
  }
};

// Function to update feedback status
export const updateFeedbackStatus = async (
  feedbackId: string, 
  status: 'pending' | 'in_progress' | 'resolved', 
  reviewerId: string, 
  reviewerRole: string
): Promise<boolean> => {
  try {
    const accessToken = JSON.parse(localStorage.getItem('auth_tokens') || '')?.accessToken;
    
    const payload = {
      status,
      reviewerId,
      reviewerRole,
    };
    
    const response = await fetch(`${API_BASE_URL}/authorities/feedback/update-status/${feedbackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to update feedback status');
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    // For development purposes, return true to simulate success
    return true;
  }
};

// Function to mark feedback as reviewed (kept for backward compatibility)
export const markFeedbackAsReviewed = async (feedbackId: string, reviewerId: string, reviewerRole: string): Promise<boolean> => {
  return updateFeedbackStatus(feedbackId, 'resolved', reviewerId, reviewerRole);
};

// Helper function to generate mock authority feedback data for development/demo
const generateMockAuthorityFeedbacks = (role: string): any[] => {
  // Find which feedback fields this role is responsible for
  const responsibleFields = Object.entries(FeedbackFieldToRoleMapping)
    .filter(([field, mappedRole]) => mappedRole === role)
    .map(([field]) => field);
  
  if (responsibleFields.length === 0) {
    return [];
  }
  
  // Generate 3-5 mock feedback items
  const count = Math.floor(Math.random() * 3) + 3;
  const mockFeedbacks = [];
  
  for (let i = 0; i < count; i++) {
    const field = responsibleFields[0]; // Use the first responsible field
    const rating = Math.random() * 3 + 1; // Generate a rating between 1-4 (negative feedback)
    const urgency = GetUrgencyLevel(rating);
    
    mockFeedbacks.push({
      id: `mock-${Date.now()}-${i}`,
      authority: role,
      field,
      rating,
      message: `[${urgency}] Action required: Feedback indicates issues with ${formatFieldName(field)}. Average rating: ${rating.toFixed(1)}/5. Please review and take appropriate action.`,
      urgency,
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
      hospitalName: 'City General Hospital',
      patientId: `patient-${Math.floor(Math.random() * 1000)}`,
      status: 'submitted'
    });
  }
  
  return mockFeedbacks;
};

// Helper function to format field names for display
const formatFieldName = (field: string): string => {
  // Convert camelCase to Title Case with spaces
  return field
    .replace(/([A-Z])/g, ' $1') // Insert a space before all uppercase letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
};