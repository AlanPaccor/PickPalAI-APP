import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.uid);
      
      // The AuthContext will handle the routing based on subscription status
      // No need to manually route here
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Failed to login. Please check your credentials.';
      if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = useCallback(() => {
    router.push('/auth/register');
  }, []);

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
    >
      <ThemedText type="title" style={styles.title}>
        Login
      </ThemedText>
      
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#FFFFFF50"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#FFFFFF50"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!loading}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialCommunityIcons 
            name={showPassword ? "eye-off" : "eye"} 
            size={24} 
            color="#FFFFFF50"
          />
        </TouchableOpacity>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>Login</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToRegister}>
        <ThemedText style={styles.link}>
          Don't have an account? Register
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#000010',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#00000010',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0A84FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#FF453A',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    marginTop: 24,
    textAlign: 'center',
    color: '#0A84FF',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  eyeButton: {
    padding: 16,
  },
}); 