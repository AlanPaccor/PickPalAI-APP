import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [stuckTimeout, setStuckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkRememberMe = async () => {
      const savedRememberMe = await SecureStore.getItemAsync('rememberMe');
      if (savedRememberMe === 'true') {
        setRememberMe(true);
      }
    };
    checkRememberMe();
  }, []);

  useEffect(() => {
    return () => {
      if (stuckTimeout) {
        clearTimeout(stuckTimeout);
      }
    };
  }, [stuckTimeout]);

  const handleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (rememberMe) {
        await SecureStore.setItemAsync('rememberMe', 'true');
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userPassword', password);
      } else {
        await SecureStore.deleteItemAsync('rememberMe');
        await SecureStore.deleteItemAsync('userEmail');
        await SecureStore.deleteItemAsync('userPassword');
      }
      
      console.log('User logged in:', userCredential.user.uid);
      
      const timeout = setTimeout(() => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('User still on login page, forcing navigation...');
            router.replace('/(tabs)');
          }
        });
      }, 2000);

      setStuckTimeout(timeout);
      
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

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
    >
      <ThemedText type="title" style={styles.title}>
        {t('Login')}
      </ThemedText>
      
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('Email')}
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
          placeholder={t('Password')}
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
        style={styles.rememberMeContainer} 
        onPress={toggleRememberMe}
      >
        <MaterialCommunityIcons 
          name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} 
          size={24} 
          color="#0A84FF" 
        />
        <ThemedText style={styles.rememberMeText}>Remember Me</ThemedText>
      </TouchableOpacity>

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
          {t('No account?')} {t('Register')}
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
    borderColor: '#FFFFFF30',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#000010',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000010',
    borderColor: '#1E90FF',
    borderWidth: 1,
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -8,
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#FFFFFF90',
    fontSize: 14,
  },
}); 