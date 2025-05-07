export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // This is a simple validation for demo purposes
  // In a real app, you might want to use a more sophisticated regex
  // or a library for phone validation
  const regex = /^[\d\s\+\-\(\)]{7,15}$/;
  return regex.test(phone);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const validateHospitalToken = (token: string): boolean => {
  // Validate that token is 6 alphanumeric characters
  const regex = /^[a-zA-Z0-9]{6}$/;
  return regex.test(token);
};