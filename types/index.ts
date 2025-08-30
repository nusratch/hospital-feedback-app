// User related types
type UserRole = 'super_admin' | 'medical_director' | 'nursing_head' | 'operations_manager' | 
  'housekeeping_manager' | 'catering_manager' | 'pharmacy_head' | 'front_desk_manager' | 
  'facilities_manager' | 'finance_manager' | 'hospital_administrator' | 'user';

interface User {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl?: string;
  authToken: AuthTokens;
  role?: UserRole;
  isAuthority?: boolean;
  department?: string;
  isSuperAdmin?: boolean; // Flag to identify super admin
  profilePicture?: string;
}

// Authentication related types
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Hospital related types
interface Hospital {
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

interface Department {
  id: string;
  name: string;
  description: string;
}

// Feedback related types
type FeedbackStatus = 'completed' | 'in-progress' | 'submitted' | 'reviewed';
type FeedbackField = keyof Omit<FeedbackSubmission['ratings'], 'additionalComments' | 'averageRating'>;

interface Feedback {
  id: string;
  hospitalName: string;
  averageRating: number;
  date: string;
  status: FeedbackStatus;
}

// Define the feedback submission interface based on backend schema
interface FeedbackSubmission {
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
  status?: FeedbackStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

// Authority role interface
interface AuthorityUser {
  email: string;
  name: string;
  phone: string;
  department: string;
  role: string;
}

// Authority role mapping
const authorityRoleMapping: Record<string, AuthorityUser> = {
  medical_director: {
    email: 'dr.director@hospital.com',
    name: 'Dr. Smith',
    phone: '+1234567890',
    department: 'Medical',
    role: 'medical_director'
  },
  nursing_head: {
    email: 'nurse.head@hospital.com',
    name: 'Sarah Johnson',
    phone: '+1234567891',
    department: 'Nursing',
    role: 'nursing_head'
  },
  operations_manager: {
    email: 'ops.manager@hospital.com',
    name: 'Michael Brown',
    phone: '+1234567892',
    department: 'Operations',
    role: 'operations_manager'
  },
  housekeeping_manager: {
    email: 'housekeeping@hospital.com',
    name: 'Emma Wilson',
    phone: '+1234567893',
    department: 'Housekeeping',
    role: 'housekeeping_manager'
  },
  pharmacy_head: {
    email: 'pharmacy.head@hospital.com',
    name: 'Dr. Robert Taylor',
    phone: '+1234567894',
    department: 'Pharmacy',
    role: 'pharmacy_head'
  },
  front_desk_manager: {
    email: 'frontdesk@hospital.com',
    name: 'Lisa Anderson',
    phone: '+1234567895',
    department: 'Reception',
    role: 'front_desk_manager'
  },
  facilities_manager: {
    email: 'facilities@hospital.com',
    name: 'James Wilson',
    phone: '+1234567896',
    department: 'Facilities',
    role: 'facilities_manager'
  },
  finance_manager: {
    email: 'finance@hospital.com',
    name: 'Jennifer Lee',
    phone: '+1234567897',
    department: 'Finance',
    role: 'finance_manager'
  },
  hospital_administrator: {
    email: 'admin@hospital.com',
    name: 'David Miller',
    phone: '+1234567898',
    department: 'Administration',
    role: 'hospital_administrator'
  },
  super_admin: {
    email: 'superadmin@hospital.com',
    name: 'System Admin',
    phone: '+1234567899',
    department: 'IT',
    role: 'super_admin'
  }
};

// Map feedback fields to authority roles
const feedbackFieldToRoleMapping = {
  doctorBehavior: 'medical_director',
  nursingStaff: 'nursing_head',
  waitingTime: 'operations_manager',
  cleanliness: 'housekeeping_manager',
  foodQuality: 'catering_manager',
  medicationAvailability: 'pharmacy_head',
  registrationProcess: 'front_desk_manager',
  hospitalFacilities: 'facilities_manager',
  costOfTreatment: 'finance_manager'
};

// Urgency levels based on ratings
const getUrgencyLevel = (rating: number): 'Low' | 'Medium' | 'High' => {
  if (rating <= 2) return 'High';
  if (rating <= 3.5) return 'Medium';
  return 'Low';
};

// Export all types and interfaces
export type {
  User,
  UserRole,
  AuthorityUser,
  AuthTokens,
  Hospital,
  Department,
  Feedback,
  FeedbackStatus,
  FeedbackSubmission,
  FeedbackField
};

// Export constants with new names to avoid conflicts
export const AuthorityRoleMapping = authorityRoleMapping;
export const FeedbackFieldToRoleMapping = feedbackFieldToRoleMapping;
export const GetUrgencyLevel = getUrgencyLevel;