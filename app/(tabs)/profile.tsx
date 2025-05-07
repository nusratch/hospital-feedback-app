import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, LogOut, Star, User, ChevronRight, CreditCard as Edit2 } from 'lucide-react-native';
import Header from '@/components/layout/Header';
import Avatar from '@/components/ui/Avatar';
import FeedbackItem from '@/components/feedback/FeedbackItem';
import Colors from '@/constants/Colors';
import { fetchUserFeedbacks } from '@/services/feedback';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const feedbacks = fetchUserFeedbacks();

  const handleEditProfile = () => {
    router.push('/user-profile');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Profile" />
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>Please login to view your profile</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Profile" 
        rightIcon={<Settings size={24} color={Colors.text.primary} />}
        onRightPress={() => {/* Navigate to settings */}}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Avatar 
              size={80} 
              name={user?.name || 'User'} 
              imageUrl={user?.imageUrl}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <Text style={styles.userPhone}>{user?.phone || ''}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
          >
            <Edit2 size={16} color="white" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Feedbacks</Text>
          
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <FeedbackItem key={feedback.id} feedback={feedback} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You haven't submitted any feedback yet
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <User size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Account Settings</Text>
            <ChevronRight size={16} color={Colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Star size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Rate the App</Text>
            <ChevronRight size={16} color={Colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]} 
            onPress={logout}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  messageText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  userPhone: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuItemText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: Colors.error,
  },
});