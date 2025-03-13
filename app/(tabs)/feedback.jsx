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
  Picker,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Send, 
  User, 
  Mail, 
  Phone, 
  Home as Building, // Home icon is used instead of Building
  MessageSquare, 
  Filter as ListFilter // Filter icon is used instead of ListFilter
} from 'react-native-feather'; // You'll need to install this package

const Feedback = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    hospitalToken: '',
    category: '',
    comment: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token =   true // await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const categories = [
    { value: 'doctor_behavior', label: 'Doctor Behaviour' },
    { value: 'catering', label: 'Catering' },
    { value: 'food', label: 'Food' },
    { value: 'medical', label: 'Medical' },
    { value: 'ambulance', label: 'Ambulance' }
  ];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log(formData);
    // You would add your API call here
    Alert.alert('Success', 'Feedback submitted successfully!');
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Your Feedback Matters</Text>
              <Text style={styles.subtitle}>
                Help us improve our services by sharing your experience
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <User width={20} height={20} color="#9ca3af" style={styles.inputIcon} />
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
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Mail width={20} height={20} color="#9ca3af" style={styles.inputIcon} />
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
                  <Phone width={20} height={20} color="#9ca3af" style={styles.inputIcon} />
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
                <Text style={styles.label}>Hospital Token</Text>
                <View style={styles.inputContainer}>
                  <Building width={20} height={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter hospital token"
                    value={formData.hospitalToken}
                    onChangeText={(text) => handleChange('hospitalToken', text)}
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Category Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Feedback Category</Text>
                <View style={styles.pickerContainer}>
                  <ListFilter width={20} height={20} color="#9ca3af" style={styles.inputIcon} />
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.category}
                      onValueChange={(itemValue) => handleChange('category', itemValue)}
                      style={styles.picker}
                      mode="dropdown"
                    >
                      <Picker.Item label="Select a category" value="" />
                      {categories.map((category) => (
                        <Picker.Item
                          key={category.value}
                          label={category.label}
                          value={category.value}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {/* Feedback Comment Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Feedback</Text>
                <View style={styles.inputContainer}>
                  <MessageSquare width={20} height={20} color="#9ca3af" style={[styles.inputIcon, { marginTop: 12 }]} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Share your experience with us..."
                    value={formData.comment}
                    onChangeText={(text) => handleChange('comment', text)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Send width={20} height={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Your feedback helps us provide better healthcare services.
            </Text>
            <Text style={styles.footerText}>
              All information provided will be kept confidential.
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
    backgroundColor: '#f9fafb',
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
    backgroundColor: '#2563eb',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
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
});

export default Feedback;