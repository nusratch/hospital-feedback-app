import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, ChevronRight, CreditCard as Edit2, Shield, ClipboardList } from 'lucide-react-native';
import Header from '@/components/layout/Header';
import Avatar from '@/components/ui/Avatar';
import FeedbackItem from '@/components/feedback/FeedbackItem';
import Colors from '@/constants/Colors';
import { fetchUserFeedbacks } from '@/services/feedback';
import { useState, useEffect, useMemo } from 'react';
import { Feedback, UserRole } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);

  useEffect(() => {
    const loadFeedbacks = async () => {
      // Only fetch feedbacks if user is authenticated and user.uid exists
      if (!isAuthenticated || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchUserFeedbacks(user.uid);
        setFeedbacks(data);
      } catch (error) {
        console.error('Error loading feedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, [user?.uid, isAuthenticated]); // Add isAuthenticated to dependency array

  const handleEditProfile = () => {
    router.push('/user-profile');
  };

  // Helper function to get role display name
  const getRoleDisplayName = (role?: UserRole): string => {
    if (!role) return 'User';
    
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'medical_director':
        return 'Medical Director';
      case 'nursing_head':
        return 'nursing_head';
      case 'operations_manager':
        return 'operations_manager';
      case 'housekeeping_manager':
        return 'housekeeping_manager';
      case 'catering_manager':
        return 'catering_manager';
      case 'pharmacy_head':
        return 'pharmacy_head';
      case 'front_desk_manager':
        return 'front_desk_manager';
      case 'facilities_manager':
        return 'facilities_manager';
      case 'finance_manager':
        return 'finance_manager';
      default:
        return 'User';
    }
  };

  const navigateToDashboard = () => {
    if (user?.role === 'super_admin') {
      router.push('/admin-dashboard');
    } else if (user?.isAuthority) {
      router.push('/authority-dashboard');
    }
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

  // Show loading state while user data is being fetched
  if (isAuthenticated && !user?.uid) {
    return (
      <View style={styles.container}>
        <Header title="Profile" />
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Profile" 
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
              name={user?.name || user?.email?.split('@')[0] || 'User'} 
              imageUrl={user?.imageUrl}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <Text style={styles.userPhone}>{user?.phoneNumber || ''}</Text>
              
              {/* Show role badge if user is an authority */}
              {user?.isAuthority && (
                <View style={styles.roleBadge}>
                  <Shield size={12} color="white" />
                  <Text style={styles.roleBadgeText}>
                    {getRoleDisplayName(user?.role)}
                  </Text>
                </View>
              )}
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
        
        {/* Show dashboard shortcut for authorities */}
        {user?.isAuthority && (
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={navigateToDashboard}
          >
            <View style={styles.dashboardButtonContent}>
              <ClipboardList size={20} color={Colors.primary} />
              <Text style={styles.dashboardButtonText}>
                {user.role === 'super_admin' ? 'Admin Dashboard' : 'Authority Dashboard'}
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </TouchableOpacity>
        )}
        
        {/* Hide feedbacks section for authority users */}
        {!user?.isAuthority && (
          <View style={styles.section}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.sectionTitle}>
                Your Feedbacks {feedbacks.length > 0 && `(${feedbacks.length})`}
              </Text>
              {feedbacks.length > 5 && (
                <TouchableOpacity 
                  onPress={() => setShowAllFeedbacks(!showAllFeedbacks)}
                  style={styles.showAllButton}
                >
                  <Text style={styles.showAllText}>
                    {showAllFeedbacks ? 'Show Less' : 'Show All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Loading...</Text>
              </View>
            ) : feedbacks.length > 0 ? (
              <View style={styles.feedbackContainer}>
                <FlatList 
                  data={showAllFeedbacks ? feedbacks : feedbacks.slice(0, 5)} 
                  renderItem={({ item }) => <FeedbackItem feedback={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                  style={styles.feedbackList}
                />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  You haven't submitted any feedback yet
                </Text>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.menuSection}>
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
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleBadgeText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 10,
    color: 'white',
    marginLeft: 4,
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
  dashboardButton: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashboardButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
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
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  showAllButton: {
    padding: 4,
  },
  showAllText: {
    color: Colors.primary,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  feedbackContainer: {
    width: '100%',
  },
  feedbackList: {
    width: '100%',
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