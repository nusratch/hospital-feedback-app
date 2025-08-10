import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Clock, MapPin, Phone, Mail, ChevronRight, ChevronDown } from 'lucide-react-native';
import Header from '@/components/layout/Header';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Colors from '@/constants/Colors';
import { fetchHospitalDetails } from '@/services/hospital';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, userData } = useAuth();
  const [hospital, setHospital] = useState(fetchHospitalDetails());
  const [showAllDepartments, setShowAllDepartments] = useState(false);

  const handleGiveFeedback = () => {
    // Check if user is admin or authority (department head)
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

  // Get departments to display based on showAllDepartments state
  const displayedDepartments = showAllDepartments 
    ? hospital.departments 
    : hospital.departments.slice(0, 4);

  // Check if feedback button should be disabled
  const isFeedbackDisabled = isAuthenticated && userData && 
    (userData.role === 'super_admin' || userData.isAuthority);

  return (
    <View style={styles.container}>
      <Header title="Hospital Details" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg' }} 
          style={styles.hospitalImage}
          resizeMode="cover"
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={20} color={Colors.gold} fill={Colors.gold} />
            <Text style={styles.ratingText}>{hospital.rating}</Text>
            <Text style={styles.ratingCount}>({hospital.reviewCount} reviews)</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{hospital.address}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Phone size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{hospital.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Mail size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{hospital.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={18} color={Colors.primary} />
              <Text style={styles.infoText}>{hospital.hours}</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{hospital.about}</Text>
          
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesList}>
            {hospital.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.departmentSection}>
            <View style={styles.departmentHeader}>
              <Text style={styles.sectionTitle}>Departments</Text>
              <TouchableOpacity 
                onPress={() => setShowAllDepartments(!showAllDepartments)}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>
                  {showAllDepartments ? 'Show Less' : 'See All'}
                </Text>
                {showAllDepartments 
                  ? <ChevronDown size={18} color={Colors.primary} /> 
                  : <ChevronRight size={18} color={Colors.primary} />
                }
              </TouchableOpacity>
            </View>
            
            <View style={styles.departmentsGrid}>
              {displayedDepartments.map((department) => (
                <View key={department.id} style={styles.departmentCard}>
                  <Text style={styles.departmentName}>{department.name}</Text>
                  <Text style={styles.departmentDescription}>
                    {department.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <AnimatedButton 
              title="Give Feedback" 
              onPress={handleGiveFeedback} 
              style={[
                styles.feedbackButton,
                isFeedbackDisabled && styles.disabledButton
              ]}
              disabled={!!isFeedbackDisabled}
            />
            {isFeedbackDisabled && (
              <Text style={styles.disabledText}>
                Admins and department heads cannot submit feedback
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
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