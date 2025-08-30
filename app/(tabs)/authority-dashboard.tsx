import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Colors from '@/constants/Colors';
import { fetchAuthorityFeedbacks, updateFeedbackStatus } from '@/services/feedback';
import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle } from 'lucide-react-native';

interface AuthorityFeedbackItem {
  id: string;
  authority: string;
  field: string;
  message: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'in_progress' | 'resolved';
  rating: number;
  hospitalName: string;
  submittedAt: string;
}

export default function AuthorityDashboardScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<AuthorityFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAuthorityFeedbacks = async () => {
    if (!isAuthenticated || !user?.isAuthority || !user?.role) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchAuthorityFeedbacks(user.role);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading authority feedbacks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAuthorityFeedbacks();
  }, [user?.role, isAuthenticated]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAuthorityFeedbacks();
  };

  const handleStatusChange = async (feedbackId: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    if (!user?.uid || !user?.role) return;

    try {
      const success = await updateFeedbackStatus(feedbackId, newStatus, user.uid, user.role);
      if (success) {
        // Update the local state to reflect the change
        setFeedbacks(prevFeedbacks => 
          prevFeedbacks.map(feedback => 
            feedback.id === feedbackId 
              ? { ...feedback, status: newStatus } 
              : feedback
          )
        );
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return Colors.error;
      case 'Medium':
        return Colors.warning;
      case 'Low':
        return Colors.success;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'in_progress':
        return Colors.primary;
      case 'resolved':
        return Colors.success;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Authority Dashboard" />
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header title="Authority Dashboard" />
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>Please login to view your dashboard</Text>
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

  if (!user?.isAuthority) {
    return (
      <View style={styles.container}>
        <Header title="Authority Dashboard" />
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>You do not have authority access</Text>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.loginButtonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Authority Dashboard" />
      
      <View style={styles.roleInfoContainer}>
        <Text style={styles.roleTitle}>
          Role: <Text style={styles.roleValue}>{user?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
        </Text>
        <Text style={styles.emailInfo}>{user?.email}</Text>
      </View>
      
      <View style={styles.feedbackHeaderContainer}>
        <Text style={styles.feedbackHeader}>Feedback Items</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : feedbacks.length > 0 ? (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.feedbackItem, item.status === 'resolved' && styles.resolvedItem]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
                  <Text style={styles.urgencyText}>{item.urgency}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusDisplayName(item.status)}</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.submittedAt).toLocaleDateString()}</Text>
              </View>
              
              <Text style={styles.hospitalName}>{item.hospitalName}</Text>
              <Text style={styles.messageText}>{item.message}</Text>
              
              <View style={styles.feedbackFooter}>
                {item.status === 'resolved' ? (
                  <View style={styles.resolvedStatusContainer}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.resolvedStatusText}>This feedback has been resolved and cannot be changed</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.statusLabel}>Update Status:</Text>
                    <View style={styles.statusButtons}>
                      <TouchableOpacity 
                        style={[styles.statusButton, item.status === 'pending' && styles.activeStatusButton]}
                        onPress={() => handleStatusChange(item.id, 'pending')}
                      >
                        <Text style={[styles.statusButtonText, item.status === 'pending' && styles.activeStatusButtonText]}>Pending</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.statusButton, item.status === 'in_progress' && styles.activeStatusButton]}
                        onPress={() => handleStatusChange(item.id, 'in_progress')}
                      >
                        <Text style={[styles.statusButtonText, item.status === 'in_progress' && styles.activeStatusButtonText]}>In Progress</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.statusButton]}
                        onPress={() => handleStatusChange(item.id, 'resolved')}
                      >
                        <Text style={[styles.statusButtonText]}>Resolved</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AlertCircle size={48} color={Colors.text.secondary} />
          <Text style={styles.emptyText}>No feedback items require your attention</Text>
        </View>
      )}
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
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
    lineHeight: 20,
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
  roleInfoContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  roleTitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
  },
  roleValue: {
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.text.primary,
  },
  emailInfo: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  feedbackHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  feedbackHeader: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: Colors.text.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  feedbackItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  resolvedItem: {
    opacity: 0.8,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  urgencyText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
    color: 'white',
  },
  dateText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  hospitalName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  feedbackFooter: {
    marginTop: 16,
  },
  statusLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.secondary,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  activeStatusButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusButtonText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  activeStatusButtonText: {
    color: 'white',
    fontFamily: 'Montserrat-SemiBold',
  },
  resolvedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.success + '15', // Light green background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  resolvedStatusText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
