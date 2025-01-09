import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface PasswordStrength {
  score: number;
  color: string;
  label: string;
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    color: '#FF3B30',
    label: 'Bad'
  });

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    
    // Length check
    if (pass.length >= 8) score += 1;
    
    // Complexity checks
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}\|&lt;&gt;]/.test(pass);
    
    // Add points for complexity
    if (hasUpperCase && hasLowerCase) score += 1;
    if (hasNumbers) score += 1;
    if (hasSpecialChars) score += 1;
    
    // Determine strength based on score
    let strength: PasswordStrength;
    if (score <= 1) {
      strength = { score: 0, color: '#FF3B30', label: 'Bad' };
    } else if (score <= 3) {
      strength = { score: 1, color: '#FFCC00', label: 'Medium' };
    } else {
      strength = { score: 2, color: '#34C759', label: 'Good' };
    }
    
    setPasswordStrength(strength);
  };

  useEffect(() => {
    checkPasswordStrength(password);
  }, [password]);

  const handleRegister = async () => {
    if (loading) return;
    
    if (passwordStrength.score < 2) {
      setError('Please create a stronger password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/auth/subscription');
    } catch (err: any) {
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = useCallback(() => {
    router.push('/auth/login');
  }, []);

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
    >
      <ThemedText type="title" style={styles.title}>
        Register
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

      <View>
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
        
        {password.length > 0 && (
          <ThemedView style={styles.strengthIndicator}>
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color }]} />
            <ThemedText style={[styles.strengthText, { color: passwordStrength.color }]}>
              Password Strength: {passwordStrength.label}
            </ThemedText>
          </ThemedView>
        )}
        
        <ThemedText style={styles.passwordRequirements}>
          Password must contain:{'\n'}
          • At least 8 characters{'\n'}
          • Upper and lowercase letters{'\n'}
          • Numbers{'\n'}
          • Special characters (!@#$%^&*(),.?":{}\|&lt;&gt;)
        </ThemedText>
      </View>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#FFFFFF50"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <MaterialCommunityIcons 
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24} 
            color="#FFFFFF50"
          />
        </TouchableOpacity>
      </ThemedView>

      <TouchableOpacity 
        style={[
          styles.button, 
          loading && styles.buttonDisabled,
          passwordStrength.score < 2 && styles.buttonDisabled
        ]} 
        onPress={handleRegister}
        disabled={loading || passwordStrength.score < 2}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>Register</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToLogin}>
        <ThemedText style={styles.link}>
          Already have an account? Login
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
    backgroundColor: '#000010',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
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
  strengthIndicator: {
    marginTop: 8,
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    textAlign: 'center',
  },
  passwordRequirements: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginBottom: 16,
    lineHeight: 20,
  },
}); 