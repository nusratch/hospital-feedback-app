import { Feedback, FeedbackSubmission } from '@/types';

// Sample feedbacks for the user
const MOCK_FEEDBACKS = [
  {
    id: '1',
    hospitalName: 'City General Hospital',
    averageRating: 4.5,
    date: '15 Jun 2023',
    status: 'completed',
  },
  {
    id: '2',
    hospitalName: 'Community Medical Center',
    averageRating: 3.8,
    date: '03 May 2023',
    status: 'completed',
  },
  {
    id: '3',
    hospitalName: 'Memorial Health Institute',
    averageRating: 4.2,
    date: '22 Apr 2023',
    status: 'completed',
  },
];

export const fetchUserFeedbacks = (): Feedback[] => {
  // In a real app, this would make an API call
  return MOCK_FEEDBACKS as Feedback[];
};

export const submitFeedback = async (feedback: FeedbackSubmission): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock success
  return true;
};