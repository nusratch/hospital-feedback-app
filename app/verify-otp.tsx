import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { verifyOTP, sendOTP } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { login, updateUserProfile } = useAuth();
  const { method, value, isLogin, fieldToUpdate, loginType } =
    useLocalSearchParams<{
      method: string;
      value: string;
      isLogin: string;
      fieldToUpdate?: string;
      currentValue?: string;
      loginType?: string;
    }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatIdentifier = () => {
    if (method === 'email') {
      const [username, domain] = value.split('@');
      if (!username || !domain) return value;

      const hiddenUsername = username.substring(0, 2) +
        '*'.repeat(username.length - 4) +
        username.substring(username.length - 2);

      return `${hiddenUsername}@${domain}`;
    } else {
      // Phone
      return value.substring(0, 3) +
        '*'.repeat(value.length - 7) +
        value.substring(value.length - 4);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[0];
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOTP = async () => {
    setTimeLeft(60);
    setError('');

    try {
      await sendOTP(
        method === 'email' ? value : undefined,
        method === 'phone' ? value : undefined
      );
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Pass the loginType to the verifyOTP function
      const { verified, user }: any = await verifyOTP(
        method === 'email' ? value : undefined,
        method === 'phone' ? value : undefined,
        otpValue,
        loginType || 'regular'
      );

      console.log('isVerified', verified);

      if (verified) {
        if (isLogin === 'true') {
          // Handle login
          await login({
            otpVerified: true,
            user: user
          });
          
          // Redirect based on user role
          if (user.isAuthority) {
            router.replace('/(tabs)/authority-dashboard');
          } else if (user.isSuperAdmin) {
            router.replace('/(tabs)/admin-dashboard');
          } else {
            router.replace('/(tabs)');
          }
        } else if (fieldToUpdate) {
          // Handle profile update
          await updateUserProfile({
            [fieldToUpdate]: value
          });
          router.replace('/user-profile');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      console.error('Verification error:', error);
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Verify OTP</Text>
        </View>

        <View style={styles.content}>
          {/* Login Type Indicator */}
          {loginType === 'authority' && (
            <View style={styles.loginTypeContainer}>
              <ShieldCheck size={24} color={Colors.primary} />
              <Text style={styles.loginTypeText}>Authority Login</Text>
            </View>
          )}
          
          <Text style={styles.description}>
            {isLogin === 'true'
              ? 'Enter the 6-digit code sent to your'
              : `Enter the 6-digit code sent to verify your new`} {method}:
          </Text>
          <Text style={styles.identifier}>{formatIdentifier()}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={isLoading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {timeLeft > 0 ? (
              <Text style={styles.timeText}>Resend in {timeLeft}s</Text>
            ) : (
              <TouchableOpacity onPress={resendOTP}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
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
    paddingTop: 40,
    alignItems: 'center',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignSelf: 'center',
  },
  loginTypeText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  identifier: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 32,
  },
  errorText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  otpInput: {
    width: 46,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  verifyButton: {
    width: '100%',
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  resendText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  timeText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.gray[500],
  },
  resendLink: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
});