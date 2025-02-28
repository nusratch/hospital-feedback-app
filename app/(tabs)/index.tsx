import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Text, Button, Surface, Card, Divider } from 'react-native-paper';
import { Heart, Clock, Star, ChevronRight, Phone, MessageCircle, Award, Shield } from 'lucide-react-native';

export default function HospitalHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text variant="headlineLarge" style={styles.heroTitle}>
              Your Health, Our Priority
            </Text>
            <Text variant="titleMedium" style={styles.heroSubtitle}>
              Experience world-class healthcare with compassionate service
            </Text>
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                buttonColor="white" 
                textColor="#2563eb" 
                style={styles.primaryButton}
                onPress={() => console.log('Book Appointment')}
              >
                Book Appointment
              </Button>
              <Button 
                mode="outlined" 
                textColor="white" 
                style={styles.secondaryButton}
                onPress={() => console.log('Learn More')}
              >
                Learn More
              </Button>
            </View>
          </View>
          
          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>Specialists</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>10k+</Text>
                <Text style={styles.statLabel}>Happy Patients</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>15+</Text>
                <Text style={styles.statLabel}>Years Experience</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Emergency Care</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text variant="headlineMedium" style={styles.sectionTitle}>Our Services</Text>
            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Comprehensive healthcare solutions for you and your family
            </Text>
          </View>
          
          <View style={styles.servicesGrid}>
            {[
              { icon: Heart, title: 'Emergency Care', desc: '24/7 emergency medical services' },
              { icon: Star, title: 'Expert Doctors', desc: 'Qualified healthcare professionals' },
              { icon: Shield, title: 'Primary Care', desc: 'Regular check-ups and preventive care' },
            ].map((service, index) => (
              <Card key={index} style={styles.serviceCard}>
                <Card.Content>
                  <service.icon color="#2563eb" size={48} />
                  <Text variant="titleMedium" style={styles.cardTitle}>{service.title}</Text>
                  <Text variant="bodyMedium" style={styles.cardDesc}>{service.desc}</Text>
                  <Button 
                    mode="text" 
                    textColor="#2563eb"
                    onPress={() => console.log(`Learn more about ${service.title}`)}
                    icon={() => <ChevronRight size={16} color="#2563eb" />}
                    contentStyle={styles.learnMoreButton}
                  >
                    Learn More
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureContent}>
            <Text variant="headlineMedium" style={styles.featureTitle}>Why Choose Us?</Text>
            <View style={styles.featuresList}>
              {[
                { icon: Clock, title: 'Quick Appointments', desc: 'Get appointments without long waiting times' },
                { icon: Award, title: 'Certified Doctors', desc: 'Experienced and board-certified specialists' },
                { icon: Shield, title: 'Safe & Clean', desc: 'Highest standards of cleanliness and safety' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <feature.icon color="#2563eb" size={24} />
                  <View style={styles.featureText}>
                    <Text variant="titleMedium" style={styles.featureItemTitle}>{feature.title}</Text>
                    <Text variant="bodyMedium" style={styles.featureItemDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {/* <Surface style={styles.featureImage} /> */}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaContent}>
            <View style={styles.ctaTextContent}>
              <Text variant="headlineMedium" style={styles.ctaTitle}>Need Urgent Care?</Text>
              <Text style={styles.ctaSubtitle}>Don't wait! Contact us now for immediate assistance</Text>
              <View style={styles.ctaButtons}>
                <Button 
                  mode="contained" 
                  buttonColor="white" 
                  textColor="#2563eb" 
                  icon={() => <Phone size={20} color="#2563eb" />}
                  onPress={() => console.log('Call Now')}
                  style={styles.ctaButton}
                >
                  Call Now
                </Button>
                <Button 
                  mode="outlined" 
                  textColor="white"
                  icon={() => <MessageCircle size={20} color="white" />}
                  onPress={() => console.log('Chat with Us')}
                  style={styles.ctaButton}
                >
                  Chat with Us
                </Button>
              </View>
            </View>
            <Surface style={styles.emergencyContactCard}>
              <Text variant="titleMedium" style={styles.emergencyTitle}>Emergency Contacts</Text>
              <View style={styles.contactList}>
                <View style={styles.contactItem}>
                  <Phone size={20} color="white" />
                  <View style={styles.contactText}>
                    <Text style={styles.contactLabel}>Emergency Hotline</Text>
                    <Text style={styles.contactValue}>1-800-HOSPITAL</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <MessageCircle size={20} color="white" />
                  <View style={styles.contactText}>
                    <Text style={styles.contactLabel}>WhatsApp Support</Text>
                    <Text style={styles.contactValue}>+1 234 567 8900</Text>
                  </View>
                </View>
              </View>
            </Surface>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSection}>
              <Text variant="titleMedium" style={styles.footerHeading}>About Us</Text>
              <Text style={styles.footerText}>Providing quality healthcare services for over 15 years.</Text>
            </View>
            <View style={styles.footerSection}>
              <Text variant="titleMedium" style={styles.footerHeading}>Quick Links</Text>
              <Text style={styles.footerText}>Services</Text>
              <Text style={styles.footerText}>Doctors</Text>
              <Text style={styles.footerText}>Appointments</Text>
              <Text style={styles.footerText}>Emergency Care</Text>
            </View>
            <View style={styles.footerSection}>
              <Text variant="titleMedium" style={styles.footerHeading}>Contact</Text>
              <Text style={styles.footerText}>1234 Healthcare Ave</Text>
              <Text style={styles.footerText}>City, State 12345</Text>
              <Text style={styles.footerText}>contact@hospital.com</Text>
              <Text style={styles.footerText}>1-800-HOSPITAL</Text>
            </View>
            <View style={styles.footerSection}>
              <Text variant="titleMedium" style={styles.footerHeading}>Connect</Text>
              <View style={styles.socialIcons}>
                <View style={styles.socialIcon} />
                <View style={styles.socialIcon} />
                <View style={styles.socialIcon} />
              </View>
            </View>
          </View>
          <Divider style={styles.footerDivider} />
          <Text style={styles.copyright}>© 2024 Healthcare Services. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Hero Section
  heroSection: {
    backgroundColor: '#2563eb',
  },
  heroContent: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    color: '#bfdbfe',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    borderColor: 'white',
  },
  // Stats Section
  statsSection: {
    backgroundColor: '#1d4ed8',
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#bfdbfe',
  },
  // Services Section
  servicesSection: {
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  cardDesc: {
    color: '#6b7280',
    marginBottom: 8,
  },
  learnMoreButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  // Features Section
  featuresSection: {
    padding: 24,
    flexDirection: 'column',
  },
  featureContent: {
    marginBottom: 24,
  },
  featureTitle: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  featureText: {
    flex: 1,
  },
  featureItemTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureItemDesc: {
    color: '#6b7280',
  },
  featureImage: {
    height: 240,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  // CTA Section
  ctaSection: {
    backgroundColor: '#2563eb',
    padding: 24,
  },
  ctaContent: {
    gap: 16,
  },
  ctaTextContent: {
    marginBottom: 16,
  },
  ctaTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: '#bfdbfe',
    marginBottom: 24,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaButton: {
    borderRadius: 8,
    borderColor: 'white',
  },
  emergencyContactCard: {
    backgroundColor: '#1d4ed8',
    padding: 24,
    borderRadius: 8,
  },
  emergencyTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  contactValue: {
    color: '#bfdbfe',
  },
  // Footer
  footer: {
    backgroundColor: '#111827',
    padding: 24,
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footerSection: {
    width: '48%',
    marginBottom: 24,
  },
  footerHeading: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  footerText: {
    color: '#9ca3af',
    marginBottom: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#1f2937',
    borderRadius: 20,
  },
  footerDivider: {
    backgroundColor: '#1f2937',
    marginVertical: 16,
  },
  copyright: {
    color: '#9ca3af',
    textAlign: 'center',
  },
});