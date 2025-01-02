import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ScanScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.placeholderContainer}>
        <MaterialIcons name="camera-alt" size={48} color="#666" />
        <ThemedText style={styles.placeholderText}>Camera Preview</ThemedText>
      </ThemedView>

      <ThemedView style={styles.controls}>
        <TouchableOpacity style={styles.button}>
          <ThemedView style={styles.buttonInner}>
            <MaterialIcons name="camera" size={32} color="white" />
            <ThemedText style={styles.buttonText}>Scan</ThemedText>
          </ThemedView>
        </TouchableOpacity>

        <ThemedView style={styles.instructions}>
          <ThemedText type="defaultSemiBold">How to scan:</ThemedText>
          <ThemedText>1. Position your ticket in the frame</ThemedText>
          <ThemedText>2. Keep the camera steady</ThemedText>
          <ThemedText>3. Tap the scan button</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: Platform.select({ 
      ios: '#00000008', 
      android: '#00000008', 
      web: '#00000008' 
    }),
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    color: '#666',
  },
  controls: {
    gap: 24,
    alignItems: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonInner: {
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  instructions: {
    gap: 8,
    backgroundColor: Platform.select({ 
      ios: '#00000008', 
      android: '#00000008', 
      web: '#00000008' 
    }),
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
}); 