import { Tabs } from 'expo-router';
import { Chrome as Home, User, ClipboardList, Settings } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function TabLayout() {
  const { userData, isAuthenticated } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);

  useEffect(() => {
    if (userData) {
      setUserRole(userData.role);
    }
  }, [userData]);

  // Determine if tabs should be visible based on user role
  const showAuthorityDashboard = isAuthenticated && userData?.isAuthority && userRole !== 'super_admin';
  const showAdminDashboard = isAuthenticated && userRole === 'super_admin';

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
          title: 'Dashboard',
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
          title: 'Admin',
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