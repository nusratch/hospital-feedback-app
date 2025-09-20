import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Colors from '@/constants/Colors';
import { fetchHospitalDetails } from '@/services/hospital';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, userData, isLoading: authLoading } = useAuth();
  const [hospital, setHospital] = useState(fetchHospitalDetails());
  // Minimal home screen does not use departments/services sections

  const handleGiveFeedback = () => {
    if (authLoading) return; // ignore taps while hydrating
    if (isAuthenticated && userData) {
      if (userData.role === 'super_admin' || userData.isAuthority) {
        Alert.alert(
          "Access Restricted", 
          "Admins and department heads cannot submit feedback.",
          [{ text: "OK" }]
        );
        return;
      }
      router.push('/feedback');
    } else if (!isAuthenticated) {
      router.push('/login');
    }
  };

  // No departments displayed on minimal home

  const isFeedbackDisabled = isAuthenticated && userData && 
    (userData.role === 'super_admin' || userData.isAuthority);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Restoring your session…</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FFE4EC", "#F7E8FF", "#FFEAD6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Header title="Maternity Care" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Compassionate Maternity Care</Text>
            <Text style={styles.heroSubtitle}>
              {hospital.name}: Supporting mothers and newborns with warmth and expertise.
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            We are dedicated to providing safe, respectful, and family-centered maternity care—from antenatal checkups
            to delivery and postnatal support. Your experience matters to us. Please share your feedback to help us
            continually improve the care we provide for mothers and babies.
          </Text>

          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Give Feedback"
              onPress={handleGiveFeedback}
              style={[
                styles.feedbackButton,
                (isFeedbackDisabled || authLoading) && styles.disabledButton
              ]}
              disabled={!!isFeedbackDisabled || authLoading}
            />
            {isFeedbackDisabled && (
              <Text style={styles.disabledText}>
                Admins and department heads cannot submit feedback
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 8,
    color: Colors.text.secondary,
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroContainer: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroTextWrap: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  heroTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  hospitalImage: {
    width: '100%',
    height: 200,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hospitalName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  ratingCount: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  aboutText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 24,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  serviceItem: {
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  serviceText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.primary,
  },
  departmentSection: {
    marginBottom: 24,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  departmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 120,
    justifyContent: 'center',
  },
  departmentName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  departmentDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  feedbackButton: {
    marginVertical: 8,
  },
  disabledButton: {
    backgroundColor: Colors.gray[300],
    opacity: 0.7,
  },
  disabledText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});