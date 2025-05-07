import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Colors from '@/constants/Colors';
import { validateEmail, validatePhone, validateName } from '@/utils/validation';

export default function UserProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name) newErrors.name = 'Name is required';
    else if (!validateName(name)) newErrors.name = 'Please enter a valid name';
    
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
    
    if (!phone) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Invalid phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Mock API call with artificial delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateUserProfile({ name, email, phone });
      setIsSuccess(true);
      
      // Navigate to home after profile is saved
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch (error) {
      setErrors({ form: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Your Profile</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Avatar 
              size={100} 
              name={name || 'User'} 
              imageUrl={user?.imageUrl}
            />
            <TouchableOpacity style={styles.changePictureButton}>
              <Text style={styles.changePictureText}>Change Picture</Text>
            </TouchableOpacity>
          </View>
          
          {errors.form && (
            <Text style={styles.errorText}>{errors.form}</Text>
          )}
          
          {isSuccess && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>Profile updated successfully!</Text>
            </View>
          )}
          
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            error={errors.name}
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          
          <Button
            title="Save Profile"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    marginRight: 16,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  changePictureButton: {
    marginTop: 12,
  },
  changePictureText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  errorText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 16,
  },
});