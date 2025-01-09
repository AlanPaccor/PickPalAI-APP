import { View, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { auth } from '../config/firebase';
import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const user = auth.currentUser;
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No user email found');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    try {
      // First reauthenticate
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Then update password
      await updatePassword(user, newPassword);

      Alert.alert('Success', 'Password updated successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.tint}
          />
        </TouchableOpacity>
        <ThemedText type="title">Profile Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Account Information
        </ThemedText>
        
        <ThemedView style={styles.infoItem}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText>{user?.email}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoItem}>
          <ThemedText style={styles.label}>Password</ThemedText>
          {!isChangingPassword ? (
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={() => setIsChangingPassword(true)}
            >
              <ThemedText style={styles.changeButtonText}>Change Password</ThemedText>
            </TouchableOpacity>
          ) : (
            <View style={styles.passwordForm}>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#666"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                >
                  <ThemedText>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]}
                  onPress={handlePasswordChange}
                >
                  <ThemedText style={styles.saveButtonText}>Update</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.infoItem}>
          <ThemedText style={styles.label}>Account Created</ThemedText>
          <ThemedText>
            {user?.metadata.creationTime 
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : 'N/A'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 60,
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  section: {
    marginBottom: 32,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: '#00000020',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  changeButtonText: {
    color: '#0A84FF',
  },
  passwordForm: {
    marginTop: 8,
    gap: 8,
  },
  input: {
    backgroundColor: '#00000040',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#00000040',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  saveButton: {
    backgroundColor: '#0A84FF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 