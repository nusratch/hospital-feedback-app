import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ViewStyle, TextStyle, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { AnalyticsContent } from './analytics';
import {
  fetchAuthorityRoles,
  updateAuthorityUser,
  createAuthorityUser,
  deleteAuthorityUser
} from '../../services/authorityService';
import { RefreshCw, Edit2, Save, X, Plus, Trash2, User, Mail, Phone, AlertCircle, CheckCircle, Users, Key, BarChart3, CheckSquare } from 'lucide-react-native';
import { AuthorityRoleMapping, AuthorityUser } from '@/types';
import { fetchTokens as fetchHospitalTokens, addToken as addHospitalToken, HospitalToken } from '../../services/tokenService';
import { Picker } from '@react-native-picker/picker';
import { fetchAuthorityFeedbacks, updateFeedbackStatus } from '../../services/feedback';
import { FlatList, ActivityIndicator } from 'react-native';

// Super admin email - must match the one in authorityRoleMapping in types/index.ts
const SUPER_ADMIN_EMAIL = 'nusratchy.002+admin@gmail.com';

export default function AdminDashboardScreen() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [authorities, setAuthorities] = useState<{ [key: string]: string }>({});
  const [authorityRoleMapping, setAuthorityRoleMapping] = useState<Record<string, AuthorityUser>>(AuthorityRoleMapping);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({
    email: '',
    name: '',
    phone: '',
    department: ''
  });
  const [newDepartment, setNewDepartment] = useState('');
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Super Admin',
    email: SUPER_ADMIN_EMAIL,
    phone: '+1234567890'
  });

  // Hospital token states
  const [tokens, setTokens] = useState<HospitalToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<HospitalToken[]>([]);
  const [tokenSearch, setTokenSearch] = useState('');
  const [tokenFilter, setTokenFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // My Actions states
  interface AuthorityFeedbackItem {
    id: string;
    authority: string;
    field: string;
    message: string;
    additionalComments?: string;
    urgency: 'Low' | 'Medium' | 'High';
    status: 'pending' | 'in_progress' | 'resolved';
    rating: number;
    hospitalName: string;
    submittedAt: string;
  }
  const [feedbacks, setFeedbacks] = useState<AuthorityFeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackRefreshing, setFeedbackRefreshing] = useState(false);
  const [feedbackDateSort, setFeedbackDateSort] = useState<'asc' | 'desc'>('desc');

  // Top navigation state
  const [activeTab, setActiveTab] = useState<'users' | 'tokens' | 'analytics' | 'actions'>('users');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAuthorityData();
  }, []);

  useEffect(() => {
    loadTokens();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadAuthorityData(),
        loadTokens(),
        loadAuthorityFeedbacks()
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddToken = async () => {
    try {
      const res = await addHospitalToken(undefined, user?.uid);
      if (res.ok) {
        await loadTokens();
        const msg = res.message || 'Token generated successfully';
        const tokenText = res.token?.token ? `\nToken: ${res.token.token}` : '';
        Alert.alert('Success', `${msg}${tokenText}`);
        setTokenError(null);
        setTokenMessage(`${msg}${res.token?.token ? ` (Token: ${res.token.token})` : ''}`);
      } else {
        const errMsg = res.message || 'Failed to generate token';
        Alert.alert('Error', errMsg);
        setTokenMessage(null);
        setTokenError(errMsg);
      }
    } catch (e) {
      console.error('Error generating token:', e);
      Alert.alert('Error', 'Failed to generate token');
      setTokenMessage(null);
      setTokenError('Failed to generate token');
    }
  };

  const handleEditRole = (role: string) => {
    const authority = AuthorityRoleMapping[role as keyof typeof AuthorityRoleMapping];
    setEditingRole(role);
    console.log("::::::::authority", authority)
    setEditingData({
      email: authorities[role] || '',
      name: authority?.name || '',
      phone: authority?.phone || '',
      department: authority?.department || formatRoleName(role)
    });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setEditingData({
      email: '',
      name: '',
      phone: '',
      department: ''
    });
  };

  const handleSaveEdit = async (role: string) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Update the authority data via API
    try {
      const updatedUser = await updateAuthorityUser(role, {
        email: editingData.email,
        name: editingData.name,
        phone: editingData.phone,
        role: role
      });

      if (updatedUser) {
        // Update the authority mapping with the new data
        if (AuthorityRoleMapping[role as keyof typeof AuthorityRoleMapping]) {
          AuthorityRoleMapping[role as keyof typeof AuthorityRoleMapping] = {
            ...AuthorityRoleMapping[role as keyof typeof AuthorityRoleMapping],
            email: editingData.email,
            name: editingData.name,
            phone: editingData.phone,
            department: editingData.department,
            role: role
          };
        }

        setAuthorities(prev => ({
          ...prev,
          [role]: editingData.email
        }));

        setEditingRole(null);
        setEditingData({
          email: '',
          name: '',
          phone: '',
          department: ''
        });

        // Reload data to get fresh state
        await loadAuthorityData();
        Alert.alert('Success', 'Authority updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update authority');
      }
    } catch (error) {
      console.error('Error updating authority:', error);
      Alert.alert('Error', 'Failed to update authority');
    }
  };

  const loadAuthorityData = async () => {
    try {
      setLoading(true);
      const authorityData = await fetchAuthorityRoles();
      setAuthorityRoleMapping(authorityData);

      // Convert to authorities format for backward compatibility
      const emails: { [key: string]: string } = {};
      Object.entries(authorityData).forEach(([role, user]) => {
        emails[role] = user.email;
      });
      setAuthorities(emails);
    } catch (error) {
      console.error('Error loading authority data:', error);
      Alert.alert('Error', 'Failed to load authority data');
    } finally {
      setLoading(false);
    }
  };

  const loadTokens = async () => {
    try {
      setTokenLoading(true);
      const list = await fetchHospitalTokens();
      setTokens(list);
      setFilteredTokens(list);
    } catch (e) {
      console.error('Error loading tokens:', e);
      Alert.alert('Error', 'Failed to load hospital tokens');
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    const q = tokenSearch.trim().toLowerCase();
    const filtered = tokens.filter(t => {
      const matchesSearch = !q || (t.token || '').toLowerCase().includes(q);
      const matchesFilter = tokenFilter === 'all' || (tokenFilter === 'used' ? t.used : !t.used);
      return matchesSearch && matchesFilter;
    });
    setFilteredTokens(filtered);
  }, [tokenSearch, tokens, tokenFilter]);

  const handleAddDepartment = async () => {
    if (!newDepartment.trim() || !headName.trim() || !headEmail.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(headEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (phoneNumber && phoneNumber.length !== 10) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    const role = newDepartment.toUpperCase().replace(/\s+/g, '_');

    // Check if role already exists
    if (authorities[role]) {
      Alert.alert('Error', 'Department already exists');
      return;
    }

    try {
      const newUser: AuthorityUser = {
        email: headEmail,
        name: headName,
        phone: phoneNumber || '',
        role: role,
        department: newDepartment
      };

      const createdUser = await createAuthorityUser(role, user?.uid || '', newUser);

      if (createdUser) {
        // Clear form
        setNewDepartment('');
        setHeadName('');
        setHeadEmail('');
        setPhoneNumber('');
        setShowAddDepartment(false);

        // Reload data to get fresh state
        await loadAuthorityData();
        Alert.alert('Success', 'Department added successfully');
      }
    } catch (error) {
      console.error('Error adding department:', error);
      Alert.alert('Error', 'Failed to add department');
    }
  };

  const handleRemoveDepartment = (role: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove the ${formatRoleName(role)} department?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteAuthorityUser(role);
              if (success) {
                // Reload data to get fresh state
                await loadAuthorityData();
                Alert.alert('Success', 'Department removed successfully');
              }
            } catch (error) {
              console.error('Error removing department:', error);
              Alert.alert('Error', 'Failed to remove department');
            }
          }
        }
      ]
    );
  };

  const formatRoleName = (role: string): string => {
    return role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // While auth is initializing, avoid redirecting
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Admin Dashboard" />
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Redirect to login if not authenticated (after loading completes)
  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  // Redirect to home if not super admin (after loading completes)
  if (!isLoading && user?.role !== "super_admin") {
    router.replace('/(tabs)');
    return null;
  }

  const handleProfileUpdate = () => {
    // Basic validation
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!profileData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profileData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Here you would typically call an API to update the profile
    console.log('Updating profile with:', profileData);
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditingProfile(false);

    // Note: In a real app, you would update the user context here as well
    // updateUserProfile(profileData);
  };

  const loadAuthorityFeedbacks = async () => {
    if (!user?.role) {
      setFeedbackLoading(false);
      return;
    }

    try {
      setFeedbackLoading(true);
      const data = await fetchAuthorityFeedbacks(user.role);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading authority feedbacks:', error);
    } finally {
      setFeedbackLoading(false);
      setFeedbackRefreshing(false);
    }
  };

  const handleFeedbackRefresh = () => {
    setFeedbackRefreshing(true);
    loadAuthorityFeedbacks();
  };

  const handleStatusChange = async (feedbackId: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    if (!user?.uid || !user?.role) return;

    try {
      const success = await updateFeedbackStatus(feedbackId, newStatus, user.uid, user.role);
      if (success) {
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
        return 'Unknown';
    }
  };

  useEffect(() => {
    if (activeTab === 'actions') {
      loadAuthorityFeedbacks();
    }
  }, [activeTab, user?.role]);

  return (
    <View style={styles.container}>
      <Header 
        title="Admin Dashboard" 
        rightIcon={<RefreshCw size={20} color={Colors.primary} />}
        onRightPress={onRefresh}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerNavBar}>
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('users')}
              style={[styles.navButton, activeTab === 'users' && styles.navButtonActive]}
            >
              <Users size={20} color={activeTab === 'users' ? 'white' : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('tokens')}
              style={[styles.navButton, activeTab === 'tokens' && styles.navButtonActive]}
            >
              <Key size={20} color={activeTab === 'tokens' ? 'white' : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('analytics')}
              style={[styles.navButton, activeTab === 'analytics' && styles.navButtonActive]}
            >
              <BarChart3 size={20} color={activeTab === 'analytics' ? 'white' : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('actions')}
              style={[styles.navButton, activeTab === 'actions' && styles.navButtonActive]}
            >
              <CheckSquare size={20} color={activeTab === 'actions' ? 'white' : Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'users' && (
        <View>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Department Management</Text>
            <TouchableOpacity
              style={styles.formButton}
              onPress={() => setShowAddDepartment(!showAddDepartment)}
            >
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Department</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>Manage department heads and their access</Text>
        </View>

        {showAddDepartment && (
          <View style={styles.addDepartmentContainer}>
            <Text style={styles.formTitle}>Add New Department</Text>
            <TextInput
              style={[styles.input, { color: Colors.gray[900] }]}
              placeholder="Enter department name"
              placeholderTextColor={Colors.gray[400]}
              value={newDepartment}
              onChangeText={setNewDepartment}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { color: Colors.gray[900] }]}
              placeholder="Department head full name"
              placeholderTextColor={Colors.gray[400]}
              value={headName}
              onChangeText={setHeadName}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { color: Colors.gray[900] }]}
              placeholder="Department head email *"
              placeholderTextColor={Colors.gray[400]}
              value={headEmail}
              onChangeText={setHeadEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              style={[styles.input, { color: Colors.gray[900] }]}
              placeholder="Phone number (optional)"
              placeholderTextColor={Colors.gray[400]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddDepartment(false);
                  setNewDepartment('');
                  setHeadName('');
                  setHeadEmail('');
                  setPhoneNumber('');
                }}
              >
                <Text style={[styles.actionButtonText, { color: Colors.gray[700] }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.addButton,
                  (!newDepartment.trim() || !headName.trim() || !headEmail.trim() ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(headEmail) ||
                    (phoneNumber && phoneNumber.length !== 10)) && styles.disabledButton
                ]}
                onPress={handleAddDepartment}
                disabled={Boolean(!newDepartment.trim() || !headName.trim() || !headEmail.trim() ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(headEmail) ||
                  (phoneNumber && phoneNumber.length !== 10))}
              >
                <Text style={styles.actionButtonText}>Add Department</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.authoritiesContainer}>
          {Object.entries(authorities).map(([role, email]) => (
            <View key={role} style={styles.authorityItem}>
              <View style={styles.authorityInfo}>
                <Text style={styles.roleName}>{formatRoleName(role)}</Text>
                {editingRole === role ? (
                  <View style={styles.editFormContainer}>
                    <TextInput
                      style={[styles.input, { color: Colors.gray[900] }]}
                      value={editingData.email}
                      onChangeText={(text) => setEditingData(prev => ({ ...prev, email: text }))}
                      placeholder="Department head email *"
                      placeholderTextColor={Colors.gray[400]}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                    <TextInput
                      style={[styles.input, { color: Colors.gray[900] }]}
                      value={editingData.name}
                      onChangeText={(text) => setEditingData(prev => ({ ...prev, name: text }))}
                      placeholder="Department head name"
                      placeholderTextColor={Colors.gray[400]}
                      autoCapitalize="words"
                    />
                    <TextInput
                      style={[styles.input, { color: Colors.gray[900] }]}
                      value={editingData.phone}
                      onChangeText={(text) => setEditingData(prev => ({ ...prev, phone: text }))}
                      placeholder="Phone number (optional)"
                      placeholderTextColor={Colors.gray[400]}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                ) : (
                  <Text style={styles.emailText}>
                    {email || 'No email assigned'}
                  </Text>
                )}
              </View>
              <View style={styles.actions}>
                {editingRole === role ? (
                  <>
                    <TouchableOpacity
                      onPress={() => handleSaveEdit(role)}
                      style={styles.actionIconButton}
                    >
                      <Save size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      style={styles.actionIconButton}
                    >
                      <X size={20} color={Colors.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleEditRole(role)}
                      style={[styles.actionIconButton, role === 'super_admin' && { opacity: 0.5 }]}
                      disabled={editingRole !== null || role === 'super_admin'}
                    >
                      <Edit2 size={18} color={role === 'super_admin' ? Colors.gray[400] : Colors.primary} />
                    </TouchableOpacity>
                    {role !== 'super_admin' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveDepartment(role)}
                        style={styles.actionIconButton}
                        disabled={editingRole !== null}
                      >
                        <Trash2 size={18} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
        </View>
        )}

        {/* Hospital Token Management */}
        {activeTab === 'tokens' && (
        <View>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Hospital Tokens</Text>
            </View>
            <Text style={styles.sectionSubtitle}>View, search, and add hospital tokens</Text>
          </View>

          <View style={styles.tokenSectionContainer}>
            <Text style={styles.formTitle}>Manage Tokens</Text>

            <TextInput
              style={[styles.input, { color: Colors.gray[900] }]}
              placeholder="Search tokens"
              placeholderTextColor={Colors.gray[400]}
              value={tokenSearch}
              onChangeText={setTokenSearch}
              autoCapitalize="none"
            />

            <View style={styles.filterRow}>
              <Picker
                selectedValue={tokenFilter}
                onValueChange={(itemValue: 'all' | 'used' | 'unused') => setTokenFilter(itemValue)}
                style={[styles.picker, { width: '40%' }]}
                dropdownIconColor={Colors.primary}
                mode="dropdown"
                itemStyle={{
                  color: Colors.gray[900],
                  fontSize: 16,
                }}
              >
                <Picker.Item label="All Tokens" value="all" />
                <Picker.Item label="Used" value="used" />
                <Picker.Item label="Not Used" value="unused" />
              </Picker>
            </View>

            <View style={styles.tokenAddRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton]}
                onPress={handleAddToken}
              >
                <Text style={styles.actionButtonText}>Generate Token</Text>
              </TouchableOpacity>
            </View>

            {tokenMessage ? (
              <Text style={[styles.sectionSubtitle, { color: '#065f46', marginTop: 8 }]}>
                {tokenMessage}
              </Text>
            ) : null}
            {tokenError ? (
              <Text style={[styles.sectionSubtitle, { color: Colors.error, marginTop: 8 }]}>
                {tokenError}
              </Text>
            ) : null}

            <View style={styles.tokenListContainer}>
              {tokenLoading ? (
                <Text style={styles.sectionSubtitle}>Loading tokens...</Text>
              ) : filteredTokens.length === 0 ? (
                <Text style={styles.emptyText}>No tokens found</Text>
              ) : (
                filteredTokens.map((t, idx) => (
                  <View key={`${t.id || t.token}-${idx}`} style={[styles.authorityItem, t.used ? styles.usedTokenRow : styles.notUsedTokenRow]}>
                    <View style={styles.authorityInfo}>
                      <Text style={styles.roleName}>{t.token}</Text>
                      {t.createdAt ? (
                        <Text style={styles.emailText}>Created: {t.createdAt}</Text>
                      ) : null}
                      <Text style={[styles.emailText, t.used ? styles.usedTokenText : styles.notUsedTokenText]}>{t.used ? 'Used' : 'Not Used'}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <View>
            <AnalyticsContent embedded />
          </View>
        )}

        {/* My Actions */}
        {activeTab === 'actions' && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>My Actions</Text>
              </View>
              <Text style={styles.sectionSubtitle}>View and manage your feedback actions</Text>
            </View>

            <View style={styles.tokenSectionContainer}>
              {/* Date Filter */}
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Sort by Date:</Text>
                <View style={styles.dateFilterButtons}>
                  <TouchableOpacity 
                    style={[styles.filterButton, feedbackDateSort === 'asc' && styles.activeFilterButton]}
                    onPress={() => {
                      setFeedbackDateSort(feedbackDateSort === 'asc' ? 'desc' : 'asc');
                      const sorted = [...feedbacks].sort((a, b) => {
                        const dateA = new Date(a.submittedAt).getTime();
                        const dateB = new Date(b.submittedAt).getTime();
                        return feedbackDateSort === 'asc' ? dateA - dateB : dateB - dateA;
                      });
                      setFeedbacks(sorted);
                    }}
                  >
                    <Text style={[styles.filterButtonText, feedbackDateSort === 'asc' && styles.activeFilterButtonText]}>
                      Ascending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.filterButton, feedbackDateSort === 'desc' && styles.activeFilterButton]}
                    onPress={() => {
                      setFeedbackDateSort(feedbackDateSort === 'desc' ? 'asc' : 'desc');
                      const sorted = [...feedbacks].sort((a, b) => {
                        const dateA = new Date(a.submittedAt).getTime();
                        const dateB = new Date(b.submittedAt).getTime();
                        return feedbackDateSort === 'desc' ? dateB - dateA : dateA - dateB;
                      });
                      setFeedbacks(sorted);
                    }}
                  >
                    <Text style={[styles.filterButtonText, feedbackDateSort === 'desc' && styles.activeFilterButtonText]}>
                      Descending
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {feedbackLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : feedbacks.length > 0 ? (
                <FlatList
                  data={feedbacks}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
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
                      <View style={styles.ratingContainer}>
                        <Text style={styles.ratingLabel}>Rating:</Text>
                        <Text style={styles.ratingValue}>{item.rating}/5</Text>
                      </View>
                      
                      {item.additionalComments && (
                        <View style={styles.commentsContainer}>
                          <Text style={styles.commentsLabel}>Issues/Concerns:</Text>
                          <Text style={styles.commentsText}>{item.additionalComments}</Text>
                        </View>
                      )}
                      
                      <View style={styles.feedbackFooter}>
                        {item.status === 'resolved' ? (
                          <View style={styles.resolvedStatusContainer}>
                            <CheckCircle size={16} color={Colors.success} />
                            <Text style={styles.resolvedStatusText}>This feedback has been resolved</Text>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.resolveButton}
                            onPress={() => handleStatusChange(item.id, 'resolved')}
                          >
                            <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                  contentContainerStyle={styles.listContent}
                  refreshing={feedbackRefreshing}
                  onRefresh={handleFeedbackRefresh}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <AlertCircle size={48} color={Colors.text.secondary} />
                  <Text style={styles.emptyText}>No feedback items require your attention</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  quickActionsBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  profileContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.primary + '15',
  },
  editButtonText: {
    marginLeft: 6,
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  profileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  analyticsButton: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  headerNavBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  navButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  navButtonTextActive: {
    color: 'white',
  },
  navAnalytics: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileForm: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 6,
    marginTop: 12,
  },
  profileInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background, // Using background color instead of gray[50]
  },
  profileInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.gray[800],
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: 'white',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  formButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  addButtonText: {
    marginLeft: 6,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  addDepartmentContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: Colors.gray[100],
  },
  editFormContainer: {
    width: '100%',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  addButton: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  cancelButton: {
    backgroundColor: Colors.gray[200],
    borderWidth: 1,
    borderColor: Colors.gray[300],
  } as ViewStyle,
  disabledButton: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
  } as ViewStyle,
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  } as TextStyle,
  authoritiesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  } as ViewStyle,
  tokenSectionContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  } as ViewStyle,
  tokenAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,
  filterRow: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
  } as ViewStyle,
  picker: {
    height: 50,
    color: Colors.gray[900],
    paddingHorizontal: 12,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
  } as TextStyle,
  tokenListContainer: {
    marginTop: 8,
  } as ViewStyle,
  emptyText: {
    color: Colors.gray[600],
    fontStyle: 'italic',
    textAlign: 'center',
  } as TextStyle,
  authorityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  } as ViewStyle,
  authorityInfo: {
    flex: 1,
    marginRight: 12,
  } as ViewStyle,
  usedTokenRow: {
    backgroundColor: '#d1fae5', // light green
    borderColor: '#10b981', // green-500
  } as ViewStyle,
  notUsedTokenRow: {
    backgroundColor: '#fee2e2', // light red
    borderColor: '#ef4444', // red-500
  } as ViewStyle,
  usedTokenText: {
    color: '#166534', // green-800
  } as TextStyle,
  notUsedTokenText: {
    color: '#991b1b', // red-800
  } as TextStyle,
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
  } as TextStyle,
  emailText: {
    fontSize: 14,
    color: Colors.gray[600],
    fontStyle: 'italic',
  } as TextStyle,
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  actionIconButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 6,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
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
  } as ViewStyle,
  resolvedItem: {
    opacity: 0.8,
  } as ViewStyle,
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  } as ViewStyle,
  urgencyText: {
    fontWeight: '600',
    fontSize: 12,
    color: 'white',
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  } as ViewStyle,
  statusText: {
    fontWeight: '600',
    fontSize: 12,
    color: 'white',
  } as TextStyle,
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
  } as TextStyle,
  hospitalName: {
    fontWeight: '600',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  feedbackFooter: {
    marginTop: 16,
  } as ViewStyle,
  resolvedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.success + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  } as ViewStyle,
  resolvedStatusText: {
    fontWeight: '500',
    fontSize: 14,
    color: Colors.success,
    marginLeft: 8,
    flex: 1,
  } as TextStyle,
  statusLabel: {
    fontWeight: '500',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  } as TextStyle,
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.text.secondary,
    backgroundColor: 'transparent',
    alignItems: 'center',
  } as ViewStyle,
  activeStatusButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  } as ViewStyle,
  statusButtonText: {
    fontWeight: '500',
    fontSize: 12,
    color: Colors.text.secondary,
  } as TextStyle,
  activeStatusButtonText: {
    color: 'white',
    fontWeight: '600',
  } as TextStyle,
  listContent: {
    padding: 16,
    paddingTop: 8,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  } as ViewStyle,
  filterLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  } as TextStyle,
  dateFilterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  } as ViewStyle,
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: 'white',
    alignItems: 'center',
  } as ViewStyle,
  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  } as ViewStyle,
  filterButtonText: {
    fontWeight: '500',
    fontSize: 13,
    color: Colors.text.secondary,
  } as TextStyle,
  activeFilterButtonText: {
    color: 'white',
    fontWeight: '600',
  } as TextStyle,
  commentsContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#d8ac8eff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  } as ViewStyle,
  commentsLabel: {
    fontWeight: '600',
    fontSize: 13,
    color: Colors.text.primary,
    marginBottom: 4,
  } as TextStyle,
  commentsText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  } as TextStyle,
  resolveButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    alignItems: 'center',
  } as ViewStyle,
  resolveButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: 'white',
  } as TextStyle,
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  } as ViewStyle,
  ratingLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: '#92400e',
    marginRight: 8,
  } as TextStyle,
  ratingValue: {
    fontWeight: '700',
    fontSize: 16,
    color: '#d97706',
  } as TextStyle,
});