// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
}

// Authentication related types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Hospital related types
export interface Hospital {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  email: string;
  hours: string;
  about: string;
  services: string[];
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

// Feedback related types
export type FeedbackStatus = 'completed' | 'in-progress';

export interface Feedback {
  id: string;
  hospitalName: string;
  averageRating: number;
  date: string;
  status: FeedbackStatus;
}

export interface FeedbackSubmission {
  ratings: number[];
  comment: string;
  hospitalToken: string;
  userId: string;
}