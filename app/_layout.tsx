import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { PaperProvider } from "react-native-paper";

import HomeScreen from "./(tabs)/index"; // ✅ Make sure this file doesn't contain NavigationContainer
import Navbar from "./components/navebar";
import LoginScreen from "./(tabs)/login";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer> {/* ✅ This should be the only NavigationContainer */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreenWithNavbar} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}

// ✅ Ensure HomeScreen does not contain another NavigationContainer
const HomeScreenWithNavbar = () => (
  <>
    <Navbar />
    <HomeScreen />
  </>
);
