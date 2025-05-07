import { Hospital } from '@/types';

// Mock hospital data
const MOCK_HOSPITAL: Hospital = {
  id: '1',
  name: 'City General Hospital',
  rating: 4.5,
  reviewCount: 256,
  address: '123 Healthcare Avenue, Medical District, NY 10001',
  phone: '(555) 123-4567',
  email: 'contact@citygeneralhospital.com',
  hours: 'Open 24 hours',
  about: 'City General Hospital is a leading medical facility providing comprehensive healthcare services to the community since 1965. Our mission is to deliver exceptional patient care through innovative treatment approaches and compassionate service.',
  services: [
    'Emergency Care',
    'Surgery',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Radiology',
    'Oncology',
    'Mental Health',
  ],
  departments: [
    {
      id: '1',
      name: 'Emergency Department',
      description: '24/7 emergency care for critical conditions',
    },
    {
      id: '2',
      name: 'Cardiology',
      description: 'Diagnosis and treatment of heart conditions',
    },
    {
      id: '3',
      name: 'Neurology',
      description: 'Care for conditions affecting the nervous system',
    },
    {
      id: '4',
      name: 'Pediatrics',
      description: 'Specialized healthcare for children',
    },
  ],
};

export const fetchHospitalDetails = (): Hospital => {
  // In a real app, this would make an API call
  return MOCK_HOSPITAL;
};