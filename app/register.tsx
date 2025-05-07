import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validateEmail, validatePhone } from '@/utils/validation';
import Colors from '@/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [isEmailRegister, setIsEmailRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (isEmailRegister) {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
    } else {
      if (!phone) newErrors.phone = 'Phone number is required';
      else if (!validatePhone(phone)) newErrors.phone = 'Invalid phone number';
    }
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Add artificial delay for mock API
    setTimeout(() => {
      setIsLoading(false);
      
      // Navigate to OTP verification with the identification method
      router.push({
        pathname: '/verify-otp',
        params: {
          method: isEmailRegister ? 'email' : 'phone',
          value: isEmailRegister ? email : phone
        }
      });
    }, 1500);
  };

  const toggleRegisterMethod = () => {
    setIsEmailRegister(!isEmailRegister);
    setErrors({});
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
          <Text style={styles.title}>Create Account</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                isEmailRegister ? styles.segmentActive : {}
              ]}
              onPress={() => setIsEmailRegister(true)}
            >
              <Text
                style={[
                  styles.segmentText,
                  isEmailRegister ? styles.segmentTextActive : {}
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                !isEmailRegister ? styles.segmentActive : {}
              ]}
              onPress={() => setIsEmailRegister(false)}
            >
              <Text
                style={[
                  styles.segmentText,
                  !isEmailRegister ? styles.segmentTextActive : {}
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>
          
          {isEmailRegister ? (
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
          ) : (
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              error={errors.phone}
            />
          )}
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
          />
          
          <Button
            title="Register"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  segmentTextActive: {
    color: 'white',
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  loginLink: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
});