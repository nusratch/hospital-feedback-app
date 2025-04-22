import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

import {
  Send,
  User,
  Mail,
  Phone,
  Home as Building,
  MessageSquare,
  Filter as ListFilter,
  Star
} from 'react-native-feather';

const Feedback = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    hospitalToken: '',
    additionalComments: '',
    ratings: {
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
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = true; // await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const ratingQuestions = [
    { id: 'doctorBehavior', question: "How would you rate the behavior and communication of the doctors?" },
    { id: 'nursingStaff', question: "How satisfied were you with the nursing staff's care and attention?" },
    { id: 'waitingTime', question: "How would you rate the waiting time for consultations and procedures?" },
    { id: 'cleanliness', question: "How clean and hygienic was the hospital environment?" },
    { id: 'foodQuality', question: "If applicable, how would you rate the quality of food provided?" },
    { id: 'medicationAvailability', question: "How satisfied were you with the availability of prescribed medications?" },
    { id: 'registrationProcess', question: "How efficient was the admission/registration process?" },
    { id: 'hospitalFacilities', question: "How would you rate the hospital's facilities and equipment?" },
    { id: 'costOfTreatment', question: "How reasonable was the cost of treatment and services?" },
    { id: 'overallExperience', question: "How would you rate your overall experience at our hospital?" }
  ];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (questionId, rating) => {
    setFormData({
      ...formData,
      ratings: {
        ...formData.ratings,
        [questionId]: rating
      }
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email');
      return false;
    }
    if (!formData.hospitalToken.trim()) {
      Alert.alert('Missing Information', 'Please enter your hospital token');
      return false;
    }

    // Check if at least one rating is provided
    const hasRating = Object.values(formData.ratings).some(rating => rating > 0);
    if (!hasRating) {
      Alert.alert('Missing Feedback', 'Please provide at least one rating');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Calculate average rating
    const ratings = formData.ratings;
    const totalRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
    const averageRating = totalRating / Object.keys(ratings).length;

    console.log("Form Submission Data:", formData);
    console.log("Average Rating:", averageRating.toFixed(1));

    // Prepare data for submission
    const submissionData = {
      uid: '67ead581cdab5b2dbb3fc0a0',
      ...formData,
      averageRating: parseFloat(averageRating.toFixed(1))
    };

    delete submissionData.name;
    delete submissionData.email;
    delete submissionData.phoneNumber;


    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/feedback/new-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      setLoading(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      const responseData = await response.json();
      console.log('Feedback submitted successfully:', responseData);

      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! Your response has been recorded.',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Something went wrong while submitting your feedback');

      Alert.alert(
        'Submission Failed',
        `${error.message}. Please try again later.`,
        [{ text: 'OK' }]
      );
      console.error('Error submitting feedback:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      hospitalToken: '',
      additionalComments: '',
      ratings: {
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
      }
    });
  };

  const RatingStars = ({ questionId, value }) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingChange(questionId, star)}
            style={styles.starButton}
          >
            <Star
              width={28}
              height={28}
              fill={star <= formData.ratings[questionId] ? '#FFD700' : 'none'}
              stroke={star <= formData.ratings[questionId] ? '#FFD700' : '#9ca3af'}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>
          {formData.ratings[questionId] > 0 ? `${formData.ratings[questionId]}/5` : 'Not rated'}
        </Text>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Please login to submit your feedback</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f9fafb" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Hospital Feedback</Text>
              <Text style={styles.subtitle}>
                Help us improve our healthcare services by rating your experience
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Personal Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                {/* Name Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.inputContainer}>
                    <User width={20} height={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      value={formData.name}
                      onChangeText={(text) => handleChange('name', text)}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.inputContainer}>
                    <Mail width={20} height={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChangeText={(text) => handleChange('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Phone Number Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputContainer}>
                    <Phone width={20} height={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChangeText={(text) => handleChange('phoneNumber', text)}
                      keyboardType="phone-pad"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                {/* Hospital Token Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hospital Token <Text style={styles.requiredStar}>*</Text></Text>
                  <View style={styles.inputContainer}>
                    <Building width={20} height={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter hospital token"
                      value={formData.hospitalToken}
                      onChangeText={(text) => handleChange('hospitalToken', text)}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>

              {/* Rating Questions Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rate Your Experience</Text>
                <Text style={styles.sectionSubtitle}>Please rate the following aspects of your hospital experience</Text>

                {ratingQuestions.map((item, index) => (
                  <View key={item.id} style={[styles.questionContainer, index !== ratingQuestions.length - 1 && styles.questionDivider]}>
                    <Text style={styles.questionText}>{index + 1}. {item.question}</Text>
                    <RatingStars questionId={item.id} value={formData.ratings[item.id]} />
                  </View>
                ))}
              </View>

              {/* Additional Comments */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Comments</Text>
                <View style={styles.inputGroup}>
                  <View style={styles.inputContainer}>
                    <MessageSquare width={20} height={20} color="#6366f1" style={[styles.inputIcon, { marginTop: 12 }]} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Share any additional feedback or suggestions..."
                      value={formData.additionalComments}
                      onChangeText={(text) => handleChange('additionalComments', text)}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send width={20} height={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Feedback</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your feedback helps us provide better healthcare services.
            </Text>
            <Text style={styles.footerText}>
              All information provided will be kept confidential.
            </Text>
            <Text style={styles.requiredFieldsText}>
              <Text style={styles.requiredStar}>*</Text> Required fields
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loginText: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  form: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  questionContainer: {
    marginBottom: 16,
    paddingBottom: 16,
  },
  questionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  questionText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starButton: {
    marginRight: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  requiredFieldsText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  }
});

export default Feedback;