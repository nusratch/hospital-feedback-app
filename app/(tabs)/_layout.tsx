import { Tabs } from 'expo-router';
import { Home, User, ClipboardList, UserCircle} from 'lucide-react-native';
import { View, StyleSheet, ActivityIndicator, Text, Platform } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function TabLayout() {
  const { userData, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

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

  // Compute dynamic tab bar padding/height to avoid bottom truncation
  const baseHeight = Platform.select({ ios: 60, android: 56, web: 60 }) || 60;
  const bottomInsetForWeb = 24; // give extra space on web where insets are 0 and browser UI
  const effectiveBottomInset = Math.max(insets.bottom, Platform.OS === 'web' ? bottomInsetForWeb : 0);
  const tabBarExtraStyle = {
    paddingHorizontal: 4,
    paddingBottom: effectiveBottomInset + 10,
    paddingTop: 10,
    height: baseHeight + effectiveBottomInset + 20,
    overflow: 'visible' as const,
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.gray[400],
          tabBarLabelStyle: styles.tabLabel,
          tabBarIconStyle: { marginBottom: 2 },
          headerShown: false,
          tabBarShowLabel: true,
          tabBarItemStyle: {
            padding: 0,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarStyle: [styles.tabBar, tabBarExtraStyle],
        }}
      >
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
              <User size={size} color={color} strokeWidth={2} />
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
              <UserCircle size={size} color={color} strokeWidth={2} />
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
    </SafeAreaView>
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
    marginBottom: 8,
    lineHeight: 13,
    textAlign: 'center',
    includeFontPadding: false,
  }
});