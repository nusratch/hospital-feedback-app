import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Shield, User as UserIcon } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Colors from '@/constants/Colors';
import { validateEmail, validatePhone, validateName } from '@/utils/validation';
import { sendOTP, updateUserField } from '@/services/auth';
import { UserRole } from '@/types';

export default function UserProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile, requiresOTPVerification } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Track which fields have been changed
  const [changedFields, setChangedFields] = useState<{[key: string]: boolean}>({});
  
  // Check if user is an authority
  const isAuthority = user?.isAuthority || false;
  const userRole = user?.role || 'user';

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Update changed fields when user edits inputs
  useEffect(() => {
    if (user) {
      setChangedFields({
        name: name !== user.name && name !== '',
        email: email !== user.email && email !== '',
        phoneNumber: phoneNumber !== user.phoneNumber && phoneNumber !== '',
        department: isAuthority && department !== (user.department || '') && department !== ''
      });
    }
  }, [name, email, phoneNumber, department, user, isAuthority]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (name && !validateName(name)) {
      newErrors.name = 'Please enter a valid name';
    }
    
    if (email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (phoneNumber && !validatePhone(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (isAuthority && !department) {
      newErrors.department = 'Department is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Check if we need to verify OTP for email/phone changes
      const needsEmailVerification = changedFields.email && requiresOTPVerification('email');
      const needsPhoneVerification = changedFields.phoneNumber && requiresOTPVerification('phone');
      
      if (needsEmailVerification || needsPhoneVerification) {
        // In a real app, you would send OTP here and navigate to verification
        // For now, we'll just show an alert
        Alert.alert(
          'Verification Required',
          'Please verify your contact information with the OTP sent to your email/phone.'
        );
        return;
      }
      
      // Update user profile
      const updatedUser: any = {
        name: name || user?.name,
        email: email || user?.email,
        phoneNumber: phoneNumber || user?.phoneNumber,
      };
      
      // Add department for authority users
      if (isAuthority) {
        updatedUser.department = department || user?.department || '';
        updatedUser.role = userRole;
      }
      
      await updateUserProfile(updatedUser);
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.avatarContainer}>
          <Avatar 
            source={user?.imageUrl ? { uri: user.imageUrl } : undefined}
            size={100}
            name={name || user?.name || 'U'}
          />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
          
          {isAuthority && (
            <View style={styles.roleBadge}>
              <Shield size={16} color={Colors.primary} />
              <Text style={styles.roleText}>
                {userRole === 'super_admin' ? 'Super Admin' : 
                 userRole?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            error={errors.name}
            editable={!isAuthority} // Authority users cannot edit name
            style={isAuthority ? { backgroundColor: Colors.gray[100] } : {}}
            containerStyle={styles.inputContainer}
            leftIcon={<UserIcon size={20} color={Colors.gray[500]} style={{ marginRight: 8 }} />}
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            editable={!isAuthority} // Authority users cannot edit email
            style={isAuthority ? { backgroundColor: Colors.gray[100] } : {}}
          />
          
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            error={errors.phoneNumber}
            editable={!isAuthority} // Authority users cannot edit phone number
            style={isAuthority ? { backgroundColor: Colors.gray[100] } : {}}
          />
          
          {isAuthority && (
            <Input
              label="Department"
              value={department}
              onChangeText={setDepartment}
              placeholder="Enter your department"
              error={errors.department}
              editable={userRole === 'super_admin'} // Only super admin can edit department
              style={userRole === 'super_admin' ? {} : { backgroundColor: Colors.gray[100] }}
            />
          )}
        </View>
        
        {errors.form && (
          <Text style={styles.errorText}>{errors.form}</Text>
        )}
        
        {isSuccess && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>Profile updated successfully!</Text>
          </View>
        )}
        
        {!isAuthority && (
          <Button
            title="Save Profile"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
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
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  roleText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  changePhotoButton: {
    marginTop: 12,
  },
  changePhotoText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 16,
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
  verificationNote: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.primary,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  }
});