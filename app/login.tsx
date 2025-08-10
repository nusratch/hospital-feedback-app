import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validateEmail, validatePhone } from '@/utils/validation';
import Colors from '@/constants/Colors';
import { sendOTP } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();

  const [isEmailLogin, setIsEmailLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorityLogin, setIsAuthorityLogin] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isEmailLogin) {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
    } else {
      if (!phone) newErrors.phone = 'Phone number is required';
      else if (!validatePhone(phone)) newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Use different API endpoint based on login type
      const response = await sendOTP(
        isEmailLogin ? email : undefined,
        !isEmailLogin ? phone : undefined,
        isAuthorityLogin ? 'authority' : 'regular'
      );

      if (response.success) {
        router.push({
          pathname: '/verify-otp',
          params: {
            method: isEmailLogin ? 'email' : 'phone',
            value: isEmailLogin ? email : phone,
            isLogin: 'true',
            loginType: isAuthorityLogin ? 'authority' : 'regular'
          }
        });
      } else {
        setErrors({
          [isEmailLogin ? 'email' : 'phone']: response.message || 'Failed to send OTP. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        [isEmailLogin ? 'email' : 'phone']: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setIsEmailLogin(!isEmailLogin);
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
            onPress={() => router.replace('/')}
          >
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Log In</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Authority Login Toggle */}
          <View style={styles.authorityToggleContainer}>
            <View style={styles.toggleLabelContainer}>
              <ShieldCheck size={20} color={isAuthorityLogin ? Colors.primary : Colors.text.secondary} />
              <Text style={[styles.toggleLabel, isAuthorityLogin && styles.toggleLabelActive]}>
                Authority Login
              </Text>
            </View>
            <Switch
              value={isAuthorityLogin}
              onValueChange={setIsAuthorityLogin}
              trackColor={{ false: Colors.gray[200], true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                !isEmailLogin ? styles.segmentActive : {}
              ]}
              onPress={() => setIsEmailLogin(false)}
            >
              <Text
                style={[
                  styles.segmentText,
                  !isEmailLogin ? styles.segmentTextActive : {}
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                isEmailLogin ? styles.segmentActive : {}
              ]}
              onPress={() => setIsEmailLogin(true)}
            >
              <Text
                style={[
                  styles.segmentText,
                  isEmailLogin ? styles.segmentTextActive : {}
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {errors.form && (
            <Text style={styles.errorText}>{errors.form}</Text>
          )}

          {isEmailLogin ? (
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

          <Text style={styles.otpInfo}>
            We'll send you a one-time password to verify your identity
          </Text>

          <Button
            title="Get OTP"
            onPress={handleSendOTP}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
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
    paddingTop: 40,
  },
  authorityToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  toggleLabelActive: {
    color: Colors.primary,
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
  errorText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.error,
    marginBottom: 16,
  },
  otpInfo: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 12,
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
  },
  noteContainer: {
    marginTop: 16,
  },
  noteText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});