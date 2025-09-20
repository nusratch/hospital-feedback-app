import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Star, CheckCircle, AlertCircle } from 'lucide-react-native';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StarRating from '@/components/feedback/StarRating';
import ThankYouModal from '@/components/feedback/ThankYouModal';
import Colors from '@/constants/Colors';
import { submitFeedback } from '@/services/feedback';
import { validateHospitalToken } from '@/utils/validation';

const { width } = Dimensions.get('window');

// Enhanced questions structure with JSON format
const FEEDBACK_QUESTIONS = {
  "categories": [
    {
      "id": "medical_care",
      "title": "Medical Care",
      "icon": "🏥",
      "questions": [
        { 
          "key": "doctorBehavior", 
          "text": "How would you rate the quality of maternity care provided by the doctors during pregnancy and delivery?",
          "category": "medical_care",
          "weight": 1.2
        },
        { 
          "key": "nursingStaff", 
          "text": "How would you rate the support and care provided by the nursing and midwifery staff?",
          "category": "medical_care",
          "weight": 1.1
        },
        { 
          "key": "medicationAvailability", 
          "text": "How would you rate the availability of maternity-related medications and supplies?",
          "category": "medical_care",
          "weight": 1.0
        }
      ]
    },
    {
      "id": "facilities",
      "title": "Facilities & Environment",
      "icon": "🏢",
      "questions": [
        { 
          "key": "cleanliness", 
          "text": "How would you rate the cleanliness and hygiene of the maternity ward and delivery rooms?",
          "category": "facilities",
          "weight": 1.0
        },
        { 
          "key": "hospitalFacilities", 
          "text": "How would you rate the maternity ward facilities, equipment, and delivery-related infrastructure?",
          "category": "facilities",
          "weight": 1.0
        },
        { 
          "key": "foodQuality", 
          "text": "How would you rate the quality and suitability of meals provided for mothers?",
          "category": "facilities",
          "weight": 0.8
        }
      ]
    },
    {
      "id": "service",
      "title": "Service Experience",
      "icon": "⚡",
      "questions": [
        { 
          "key": "waitingTime", 
          "text": "How would you rate the waiting time for maternity-related services and check-ups?",
          "category": "service",
          "weight": 1.1
        },
        { 
          "key": "registrationProcess", 
          "text": "How would you rate the admitting and registration process for maternity care?",
          "category": "service",
          "weight": 1.0
        },
        { 
          "key": "costOfTreatment", 
          "text": "How would you rate the cost of maternity care and delivery services?",
          "category": "service",
          "weight": 0.9
        }
      ]
    },
    {
      "id": "overall",
      "title": "Overall Experience",
      "icon": "🌟",
      "questions": [
        { 
          "key": "overallExperience", 
          "text": "How would you rate your overall maternity care experience?",
          "category": "overall",
          "weight": 1.5
        }
      ]
    }
  ]
};


// Flatten questions for easier access
const QUESTIONS = FEEDBACK_QUESTIONS.categories.flatMap(category => 
  category.questions.map(question => ({
    ...question,
    categoryTitle: category.title,
    categoryIcon: category.icon
  }))
);

export default function FeedbackScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [ratings, setRatings] = useState<{[key: string]: number}>({
    doctorBehavior: 0,
    nursingStaff: 0,
    waitingTime: 0,
    cleanliness: 0,
    foodQuality: 0,
    medicationAvailability: 0,
    registrationProcess: 0,
    hospitalFacilities: 0,
    costOfTreatment: 0,
    overallExperience: 0
  });
  
  const [additionalComments, setAdditionalComments] = useState('');
  const [hospitalToken, setHospitalToken] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Update progress animation
    const progress = completedQuestions.length / QUESTIONS.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [completedQuestions]);

  const calculateProgress = () => {
    return (completedQuestions.length / QUESTIONS.length) * 100;
  };

  const calculateAverageRating = () => {
    const ratingValues = Object.values(ratings);
    const validRatings = ratingValues.filter(rating => rating > 0);
    
    if (validRatings.length > 0) {
      const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
      return parseFloat((sum / validRatings.length).toFixed(1));
    }
    return 0;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    const unratedKeys = Object.keys(ratings).filter(key => ratings[key] === 0);
    if (unratedKeys.length > 0) {
      const unratedQuestion = QUESTIONS.find(q => q.key === unratedKeys[0]);
      newErrors.ratings = `Please complete all ratings (${unratedKeys.length} remaining)`;
    }
    
    if (!hospitalToken) {
      newErrors.hospitalToken = 'Hospital token is required';
    } else if (!validateHospitalToken(hospitalToken)) {
      newErrors.hospitalToken = 'Invalid hospital token format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRatingChange = (key: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [key]: rating
    }));
    
    // Add to completed questions if rating > 0
    if (rating > 0 && !completedQuestions.includes(key)) {
      setCompletedQuestions(prev => [...prev, key]);
    } else if (rating === 0 && completedQuestions.includes(key)) {
      setCompletedQuestions(prev => prev.filter(q => q !== key));
    }

    // Clear rating errors when user starts rating
    if (errors.ratings && rating > 0) {
      setErrors(prev => ({ ...prev, ratings: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Incomplete Form", 
        "Please complete all required fields before submitting.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      const calculatedAverageRating = calculateAverageRating();
      
      const feedbackData = {
        uid: user?.uid || '',
        hospitalToken,
        ratings: {
          doctorBehavior: ratings.doctorBehavior,
          nursingStaff: ratings.nursingStaff,
          waitingTime: ratings.waitingTime,
          cleanliness: ratings.cleanliness,
          foodQuality: ratings.foodQuality,
          medicationAvailability: ratings.medicationAvailability,
          registrationProcess: ratings.registrationProcess,
          hospitalFacilities: ratings.hospitalFacilities,
          costOfTreatment: ratings.costOfTreatment,
          overallExperience: ratings.overallExperience,
          additionalComments,
          averageRating: calculatedAverageRating
        }
      };
      
      const res = await submitFeedback(feedbackData);
      if (res.ok) {
        Alert.alert(
          'Success',
          res.message || 'Feedback submitted successfully',
          [{ text: 'OK', style: 'default' }]
        );
        setErrors({});
        setIsModalVisible(true);
      } else {
        const msg = res.message || 'Unable to submit feedback. Please try again.';
        Alert.alert('Submission Failed', msg, [{ text: 'OK', style: 'destructive' }]);
        const tokenRelated = /token|hospital token|invalid/i.test(msg);
        setErrors({
          form: msg,
          ...(tokenRelated ? { hospitalToken: msg } : {})
        });
        return;
      }
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        'Unable to submit feedback. Please check your connection and try again.',
        [{ text: 'OK', style: 'destructive' }]
      );
      setErrors({ form: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    router.replace('/(tabs)');
  };

  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Progress: {completedQuestions.length}/{QUESTIONS.length} completed
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(calculateProgress())}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderCategoryQuestions = (category: any) => {
    return (
      <View key={category.id} style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
        
        {category.questions.map((question: any, index: number) => {
          const isCompleted = completedQuestions.includes(question.key);
          return (
            <Animated.View 
              key={question.key} 
              style={[
                styles.questionCard,
                isCompleted && styles.questionCardCompleted
              ]}
            >
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  {isCompleted ? (
                    <CheckCircle size={20} color={Colors.success} />
                  ) : (
                    <Text style={styles.questionNumberText}>
                      {QUESTIONS.findIndex(q => q.key === question.key) + 1}
                    </Text>
                  )}
                </View>
                <Text style={styles.questionText}>{question.text}</Text>
              </View>
              
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={ratings[question.key]}
                  maxRating={5}
                  onRate={(rating) => handleRatingChange(question.key, rating)}
                  size={28}
                  // activeColor={Colors.primary}
                  // inactiveColor={Colors.gray[300]}
                />
                {ratings[question.key] > 0 && (
                  <Text style={styles.ratingText}>
                    {ratings[question.key]}/5
                  </Text>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <Animated.View 
        style={[
          styles.container,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Share Your Experience</Text>
        </View>

        {renderProgressBar()}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.introSection}>
              <Text style={styles.description}>
                Your feedback is valuable to us and helps improve our services for future patients.
              </Text>
              
              {errors.ratings && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{errors.ratings}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.questionsSection}>
              {FEEDBACK_QUESTIONS.categories.map(category => 
                renderCategoryQuestions(category)
              )}
            </View>
            
            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>Additional Comments</Text>
              <Input
                value={additionalComments}
                onChangeText={setAdditionalComments}
                placeholder="Share any additional thoughts, suggestions, or specific experiences..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.commentInput}
              />
            </View>
            
            <View style={styles.tokenSection}>
              <Text style={styles.sectionTitle}>Hospital Token</Text>
              <Input
                value={hospitalToken}
                onChangeText={setHospitalToken}
                placeholder="Enter 6-character token"
                maxLength={6}
                autoCapitalize="characters"
                error={errors.hospitalToken}
                style={styles.tokenInput}
              />
            </View>
            
            <View style={styles.userInfoSection}>
              <Text style={styles.sectionTitle}>Your Information</Text>
              <View style={styles.userInfoContainer}>
                <View style={styles.userInfoItem}>
                  <Text style={styles.userInfoLabel}>Email</Text>
                  <Text style={styles.userInfoValue}>{authLoading ? 'Loading…' : (user?.email || 'Not provided')}</Text>
                </View>
                
                <View style={styles.userInfoItem}>
                  <Text style={styles.userInfoLabel}>Phone</Text>
                  <Text style={styles.userInfoValue}>{authLoading ? 'Loading…' : (user?.phoneNumber || 'Not provided')}</Text>
                </View>
              </View>
            </View>
            
            {errors.ratings && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={Colors.error} />
                <Text style={styles.errorText}>{errors.ratings}</Text>
              </View>
            )}

            {errors.form && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={Colors.error} />
                <Text style={styles.errorText}>{errors.form}</Text>
              </View>
            )}
            
            <Button
              title={`Submit Feedback (${completedQuestions.length}/${QUESTIONS.length})`}
              onPress={handleSubmit}
              loading={isLoading}
              style={[
                styles.submitButton,
                completedQuestions.length === QUESTIONS.length && styles.submitButtonReady
              ]}
              disabled={completedQuestions.length === 0}
            />
          </View>
        </ScrollView>
        
        <ThankYouModal
          visible={isModalVisible}
          onClose={handleModalClose}
        />
      </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 26,
    color: Colors.text.primary,
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  progressPercentage: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    marginBottom: 24,
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
    flex: 1,
  },
  questionsSection: {
    marginBottom: 32,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary + '20',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  questionCard: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionCardCompleted: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success + '30',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  questionNumberText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  questionText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 12,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  commentsSection: {
    marginBottom: 24,
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  tokenSection: {
    marginBottom: 24,
  },
  tokenInput: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  userInfoSection: {
    marginBottom: 32,
  },
  userInfoContainer: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 16,
  },
  userInfoItem: {
    marginBottom: 12,
  },
  userInfoLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userInfoValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    height: 56,
  },
  submitButtonReady: {
    backgroundColor: Colors.success,
  },
});
