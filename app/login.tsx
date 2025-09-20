import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validateEmail } from '@/utils/validation';
import Colors from '@/constants/Colors';
import { sendOTP } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'authority' | 'patient' | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';

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
        email,
        undefined,
        selectedRole === 'authority' ? 'authority' : 'regular'
      );

      if (response.success) {
        router.push({
          pathname: '/verify-otp',
          params: {
            method: 'email',
            value: email,
            isLogin: 'true',
            loginType: selectedRole === 'authority' ? 'authority' : 'regular'
          }
        });
      } else {
        setErrors({
          email: response.message || 'Failed to send OTP. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        email: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#e3f2fd', '#e0f7fa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
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
              onPress={() => {
                if (selectedRole) setSelectedRole(null);
                else router.replace('/');
              }}
            >
              <ChevronLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Log In</Text>
          </View>

          {/* Registration-free note */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>No registration needed — enter your email to receive an OTP.</Text>
          </View>

          {selectedRole === null ? (
            <View style={styles.formContainer}>
              <Text style={styles.chooseRoleTitle}>Continue as</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => {
                    setSelectedRole('authority');
                    setErrors({});
                  }}
                >
                  <ShieldCheck size={28} color={Colors.primary} />
                  <Text style={styles.roleTitle}>Authority</Text>
                  <Text style={styles.roleSubtitle}>Manage and review feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => {
                    setSelectedRole('patient');
                    setErrors({});
                  }}
                >
                  <User size={28} color={Colors.primary} />
                  <Text style={styles.roleTitle}>Patient</Text>
                  <Text style={styles.roleSubtitle}>Share your experience</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>
                  {selectedRole === 'authority' ? 'Login as Authority' : 'Login as Patient'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedRole(null)}>
                  <Text style={styles.changeRoleText}>Change</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Email</Text>
                <Input
                  label=""
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
              </View>

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
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  infoBanner: {
    marginHorizontal: 24,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  infoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  chooseRoleTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  roleContainer: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  roleTitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  roleSubtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 16,
  },
  rolePillText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  changeRoleText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
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