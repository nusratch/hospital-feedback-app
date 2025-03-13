import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { 
  Heart, 
  Clock, 
  Star, 
  ChevronRight, 
  Phone, 
  MessageCircle, 
  Award, 
  Shield 
} from 'react-native-feather'; // You'll need to install this package

const Index = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <ScrollView>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Your Health, Our Priority</Text>
            <Text style={styles.heroSubtitle}>
              Experience world-class healthcare with compassionate service
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Book Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>Specialists</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10k+</Text>
                <Text style={styles.statLabel}>Happy Patients</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>15+</Text>
                <Text style={styles.statLabel}>Years Experience</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Emergency Care</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <Text style={styles.sectionSubtitle}>
              Comprehensive healthcare solutions for you and your family
            </Text>
          </View>

          <View style={styles.servicesGrid}>
            {[
              { icon: Heart, title: 'Emergency Care', desc: '24/7 emergency medical services' },
              { icon: Star, title: 'Expert Doctors', desc: 'Qualified healthcare professionals' },
              { icon: Shield, title: 'Primary Care', desc: 'Regular check-ups and preventive care' },
            ].map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <service.icon width={48} height={48} color="#2563eb" />
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDesc}>{service.desc}</Text>
                <TouchableOpacity style={styles.learnMoreButton}>
                  <Text style={styles.learnMoreText}>Learn More</Text>
                  <ChevronRight width={16} height={16} color="#2563eb" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresContent}>
            <View style={styles.featuresTextContent}>
              <Text style={styles.featuresTitle}>Why Choose Us?</Text>
              <View style={styles.featuresList}>
                {[
                  { icon: Clock, title: 'Quick Appointments', desc: 'Get appointments without long waiting times' },
                  { icon: Award, title: 'Certified Doctors', desc: 'Experienced and board-certified specialists' },
                  { icon: Shield, title: 'Safe & Clean', desc: 'Highest standards of cleanliness and safety' },
                ].map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <feature.icon width={24} height={24} color="#2563eb" />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDesc}>{feature.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.imagePlaceholder}>
              {/* Placeholder for image */}
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaContent}>
            <View style={styles.ctaTextContent}>
              <Text style={styles.ctaTitle}>Need Urgent Care?</Text>
              <Text style={styles.ctaSubtitle}>
                Don't wait! Contact us now for immediate assistance
              </Text>
              <View style={styles.ctaButtonContainer}>
                <TouchableOpacity style={styles.ctaPrimaryButton}>
                  <Phone width={20} height={20} color="#2563eb" />
                  <Text style={styles.ctaPrimaryButtonText}>Call Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ctaSecondaryButton}>
                  <MessageCircle width={20} height={20} color="#fff" />
                  <Text style={styles.ctaSecondaryButtonText}>Chat with Us</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.contactCard}>
              <Text style={styles.contactCardTitle}>Emergency Contacts</Text>
              <View style={styles.contactList}>
                <View style={styles.contactItem}>
                  <Phone width={20} height={20} color="#fff" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Emergency Hotline</Text>
                    <Text style={styles.contactValue}>1-800-HOSPITAL</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <MessageCircle width={20} height={20} color="#fff" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>WhatsApp Support</Text>
                    <Text style={styles.contactValue}>+1 234 567 8900</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerGrid}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>About Us</Text>
              <Text style={styles.footerText}>
                Providing quality healthcare services for over 15 years.
              </Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Quick Links</Text>
              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>Services</Text>
                <Text style={styles.footerText}>Doctors</Text>
                <Text style={styles.footerText}>Appointments</Text>
                <Text style={styles.footerText}>Emergency Care</Text>
              </View>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Contact</Text>
              <View style={styles.footerLinks}>
                <Text style={styles.footerText}>1234 Healthcare Ave</Text>
                <Text style={styles.footerText}>City, State 12345</Text>
                <Text style={styles.footerText}>contact@hospital.com</Text>
                <Text style={styles.footerText}>1-800-HOSPITAL</Text>
              </View>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Connect</Text>
              <View style={styles.socialIcons}>
                <View style={styles.socialIcon} />
                <View style={styles.socialIcon} />
                <View style={styles.socialIcon} />
              </View>
            </View>
          </View>
          <View style={styles.footerDivider} />
          <Text style={styles.footerCopyright}>
            © 2024 Healthcare Services. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#bfdbfe',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    color: '#bfdbfe',
    fontSize: 14,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  serviceDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  learnMoreText: {
    color: '#2563eb',
    fontWeight: '500',
    marginRight: 4,
  },
  // Features Section
  featuresSection: {
    padding: 24,
    backgroundColor: '#fff',
  },
  featuresContent: {
    gap: 24,
  },
  featuresTextContent: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  featuresList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
  },
  featureIconContainer: {
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  // CTA Section
  ctaSection: {
    backgroundColor: '#2563eb',
    padding: 24,
  },
  ctaContent: {
    gap: 24,
  },
  ctaTextContent: {
    marginBottom: 24,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    marginBottom: 24,
  },
  ctaButtonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ctaPrimaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  ctaPrimaryButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  ctaSecondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  ctaSecondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  contactCard: {
    backgroundColor: '#1d4ed8',
    padding: 24,
    borderRadius: 8,
  },
  contactCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contactValue: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  // Footer
  footer: {
    backgroundColor: '#111827',
    padding: 24,
  },
  footerGrid: {
    gap: 24,
  },
  footerColumn: {
    marginBottom: 24,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  footerLinks: {
    gap: 8,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    marginVertical: 24,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default Index;