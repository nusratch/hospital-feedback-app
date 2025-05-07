import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Check } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/feedback/StarRating';
import ThankYouModal from '@/components/feedback/ThankYouModal';
import Colors from '@/constants/Colors';
import { submitFeedback } from '@/services/feedback';
import { validateHospitalToken } from '@/utils/validation';

// Feedback questions
const QUESTIONS = [
  'How would you rate the cleanliness of the hospital?',
  'How would you rate the quality of care provided by the doctors?',
  'How would you rate the nursing staff?',
  'How would you rate the admitting and discharge process?',
  'How would you rate the waiting time for services?',
  'How would you rate the equipment and facilities?',
  'How would you rate the hospital food quality?',
  'How would you rate the hospital\'s COVID-19 safety protocols?',
  'How likely are you to recommend this hospital to others?'
];

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [ratings, setRatings] = useState<number[]>(Array(QUESTIONS.length).fill(0));
  const [comment, setComment] = useState('');
  const [hospitalToken, setHospitalToken] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Check if all questions are rated
    const unratedIndex = ratings.findIndex(rating => rating === 0);
    if (unratedIndex !== -1) {
      newErrors.ratings = `Please rate question ${unratedIndex + 1}`;
    }
    
    // Validate hospital token (should be 6 alphanumeric characters)
    if (!hospitalToken) {
      newErrors.hospitalToken = 'Hospital token is required';
    } else if (!validateHospitalToken(hospitalToken)) {
      newErrors.hospitalToken = 'Token must be 6 alphanumeric characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRatingChange = (index: number, rating: number) => {
    const newRatings = [...ratings];
    newRatings[index] = rating;
    setRatings(newRatings);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Mock API call with artificial delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await submitFeedback({
        ratings,
        comment,
        hospitalToken,
        userId: user?.id || '',
      });
      
      setIsModalVisible(true);
    } catch (error) {
      setErrors({ form: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    router.replace('/(tabs)');
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
          <Text style={styles.title}>Give Feedback</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            Please rate your experience with our hospital. Your feedback helps us improve our services.
          </Text>
          
          {errors.form && (
            <Text style={styles.errorText}>{errors.form}</Text>
          )}
          
          {errors.ratings && (
            <Text style={styles.errorText}>{errors.ratings}</Text>
          )}
          
          <View style={styles.questionsContainer}>
            {QUESTIONS.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <Text style={styles.questionText}>{question}</Text>
                <StarRating
                  rating={ratings[index]}
                  maxRating={5}
                  onRate={(rating) => handleRatingChange(index, rating)}
                />
              </View>
            ))}
          </View>
          
          <Input
            label="Comments"
            value={comment}
            onChangeText={setComment}
            placeholder="Please share any additional feedback or suggestions"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.commentInput}
          />
          
          <Input
            label="Hospital Token"
            value={hospitalToken}
            onChangeText={setHospitalToken}
            placeholder="Enter 6-character token"
            maxLength={6}
            autoCapitalize="characters"
            error={errors.hospitalToken}
          />
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoLabel}>Email</Text>
            <Text style={styles.userInfoValue}>{user?.email || ''}</Text>
            
            <Text style={styles.userInfoLabel}>Phone</Text>
            <Text style={styles.userInfoValue}>{user?.phone || ''}</Text>
          </View>
          
          <Button
            title="Submit Feedback"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
      
      <ThankYouModal
        visible={isModalVisible}
        onClose={handleModalClose}
      />
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
  description: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.error,
    marginBottom: 16,
  },
  questionsContainer: {
    marginBottom: 24,
  },
  questionItem: {
    marginBottom: 20,
  },
  questionText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  userInfoContainer: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  userInfoLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  userInfoValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});