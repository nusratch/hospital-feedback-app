import { Tabs } from 'expo-router';
import { Home, User, ClipboardList, Settings } from 'lucide-react-native';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useEffect } from 'react';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function TabLayout() {
  const { userData, isAuthenticated, isLoading } = useAuth();

  // Block rendering of tabs until auth is hydrated to avoid flicker/wrong tabs
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your session…</Text>
      </View>
    );
  }

  // Determine if tabs should be visible based on user role
  const role: UserRole | undefined = userData?.role as UserRole | undefined;
  const showAuthorityDashboard = isAuthenticated && !!userData?.isAuthority && role !== 'super_admin';
  const showAdminDashboard = isAuthenticated && role === 'super_admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarItemStyle: {
          padding: 0,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarStyle: [styles.tabBar, {
          paddingHorizontal: 4,
        }],
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />

      {/* Authority Dashboard - Only visible for authority users */}
      <Tabs.Screen
        name="authority-dashboard"
        options={{
          title: 'Authority Dashboard',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} strokeWidth={2} />
          ),
          // Hide tab if user doesn't have authority role
          href: showAuthorityDashboard ? undefined : null,
        }}
      />

      {/* Admin Dashboard - Only visible for super_admin */}
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          title: 'Admin Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
          // Hide tab if user is not super_admin
          href: showAdminDashboard ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />

      {/** Hidden route for Analytics - navigable via button, not a tab */}
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    height: 60,
    paddingBottom: 4,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  tabLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
    includeFontPadding: false,
  }
});