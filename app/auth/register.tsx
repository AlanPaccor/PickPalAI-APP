import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface PasswordStrength {
  score: number; // 0 = bad, 1 = medium, 2 = good
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
      router.replace('/(tabs)');
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
      <Text style={styles.title}>
        Register
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color="#666"
            />
          </TouchableOpacity>
        </View>
        
        {password.length > 0 && (
          <View style={styles.strengthIndicator}>
            <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color }]} />
            <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
              Password Strength: {passwordStrength.label}
            </Text>
          </View>
        )}
        
        <Text style={styles.passwordRequirements}>
          Password must contain:{'\n'}
          • At least 8 characters{'\n'}
          • Upper and lowercase letters{'\n'}
          • Numbers{'\n'}
          • Special characters (!@#$%^&*(),.?":{}\|&lt;&gt;)
        </Text>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          editable={!loading}
        />
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <MaterialIcons 
            name={showConfirmPassword ? "visibility" : "visibility-off"} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>
      </View>

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
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToLogin}>
        <Animated.Text 
          style={styles.link}
          entering={FadeIn.delay(400)}
        >
          Already have an account? Login
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    color: '#007AFF',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeButton: {
    padding: 10,
  },
  strengthIndicator: {
    marginTop: 5,
    marginBottom: 10,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginBottom: 5,
  },
  strengthText: {
    fontSize: 12,
    textAlign: 'center',
  },
  passwordRequirements: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    marginTop: 5,
    lineHeight: 18,
  },
}); 