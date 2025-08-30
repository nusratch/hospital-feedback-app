import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ViewStyle, TextStyle } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import {
  fetchAuthorityRoles,
  updateAuthorityUser,
  createAuthorityUser,
  deleteAuthorityUser
} from '../../services/authorityService';
import { Edit2, Save, X, Plus, Trash2, User, Mail, Phone } from 'lucide-react-native';
import { AuthorityRoleMapping, AuthorityUser } from '@/types';
import { fetchTokens as fetchHospitalTokens, addToken as addHospitalToken, HospitalToken } from '../../services/tokenService';

// Super admin email - must match the one in authorityRoleMapping in types/index.ts
const SUPER_ADMIN_EMAIL = 'SUPERADMIN@HOSPITAL.COM';

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
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    loadAuthorityData();
  }, []);

  useEffect(() => {
    loadTokens();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuthorityData();
    setRefreshing(false);
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
    if (!q) {
      setFilteredTokens(tokens);
    } else {
      setFilteredTokens(tokens.filter(t => (t.token || '').toLowerCase().includes(q)));
    }
  }, [tokenSearch, tokens]);

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

  return (
    <View style={styles.container}>
      <Header title="Admin Dashboard" />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Admin Profile</Text>
            {!isEditingProfile ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingProfile(true)}
              >
                <Edit2 size={18} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.profileActions}>
                <TouchableOpacity
                  style={[styles.profileButton, styles.cancelButton]}
                  onPress={() => setIsEditingProfile(false)}
                >
                  <Text style={[styles.buttonText, { color: Colors.gray[700] }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.profileButton, styles.saveButton]}
                  onPress={handleProfileUpdate}
                >
                  <Text style={[styles.buttonText, { color: 'white' }]}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditingProfile ? (
            <View style={styles.profileForm}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.profileInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Full Name"
                editable={isEditingProfile}
                selectTextOnFocus={isEditingProfile}
                placeholderTextColor={Colors.gray[400]}
                autoComplete="name"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.profileInput}
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={isEditingProfile}
                selectTextOnFocus={isEditingProfile}
                placeholderTextColor={Colors.gray[400]}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.profileInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                editable={isEditingProfile}
                selectTextOnFocus={isEditingProfile}
                placeholderTextColor={Colors.gray[400]}
                autoComplete="tel"
              />
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <User size={18} color={Colors.gray[600]} />
                <Text style={styles.infoText}>{profileData.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Mail size={18} color={Colors.gray[600]} />
                <Text style={styles.infoText}>{profileData.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={18} color={Colors.gray[600]} />
                <Text style={styles.infoText}>{profileData.phone}</Text>
              </View>
            </View>
          )}
        </View>

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

        {/* Hospital Token Management */}
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
                <View key={`${t.id || t.token}-${idx}`} style={styles.authorityItem}>
                  <View style={styles.authorityInfo}>
                    <Text style={styles.roleName}>{t.token}</Text>
                    {t.createdAt ? (
                      <Text style={styles.emailText}>Created: {t.createdAt}</Text>
                    ) : null}
                  </View>
                </View>
              ))
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
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
  tokenListContainer: {
    marginTop: 8,
  } as ViewStyle,
  emptyText: {
    fontSize: 14,
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
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
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
});