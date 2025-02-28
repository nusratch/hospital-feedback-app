import React, { useState } from 'react';
import { View, StyleSheet } from "react-native";
import { Button, Text, TextInput, Surface, Checkbox, Divider, IconButton } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = () => {
    console.log('Login pressed', { email, password, rememberMe });
    // Implement your login logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye" : "eye-off"}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
            />
            <Text variant="bodyMedium" onPress={() => setRememberMe(!rememberMe)}>
              Remember me
            </Text>
            <View style={styles.flex} />
            <Text variant="bodyMedium" style={styles.forgotPassword}>
              Forgot Password?
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
          >
            Sign In
          </Button>

          <Divider style={styles.divider} />
          <Text variant="bodyMedium" style={styles.orText}>or continue with</Text>

          <View style={styles.socialButtonsContainer}>
            <Button
              mode="outlined"
              icon="google"
              onPress={() => console.log('Google login')}
              style={styles.socialButton}
            >
              Google
            </Button>
            <Button
              mode="outlined"
              icon="facebook"
              onPress={() => console.log('Facebook login')}
              style={styles.socialButton}
            >
              Facebook
            </Button>
          </View>

          <View style={styles.signupContainer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Text
              variant="bodyMedium"
              style={styles.signupText}
              onPress={() => console.log('Navigate to signup')}
            >
              Sign Up
            </Text>
          </View>
        </View>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  flex: {
    flex: 1,
  },
  forgotPassword: {
    color: '#6200ee',
  },
  loginButton: {
    marginBottom: 24,
    paddingVertical: 6,
  },
  divider: {
    marginBottom: 16,
  },
  orText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 0.48,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});