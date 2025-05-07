import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Clock, MapPin, Phone, Mail, ChevronRight } from 'lucide-react-native';
import Header from '@/components/layout/Header';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Colors from '@/constants/Colors';
import { fetchHospitalDetails } from '@/services/hospital';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [hospital, setHospital] = useState(fetchHospitalDetails());

  const handleGiveFeedback = () => {
    if (isAuthenticated) {
      router.push('/feedback');
    } else {
      router.push('/login');
    }
  };

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
          
          <TouchableOpacity 
            style={styles.departmentRow}
            onPress={() => {/* Navigate to departments */}}
          >
            <Text style={styles.sectionTitle}>Departments</Text>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
          
          <View style={styles.buttonContainer}>
            <AnimatedButton 
              title="Give Feedback" 
              onPress={handleGiveFeedback} 
              style={styles.feedbackButton}
            />
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
  departmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 24,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  feedbackButton: {
    marginVertical: 8,
  },
});