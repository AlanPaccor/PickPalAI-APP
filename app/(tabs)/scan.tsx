import { StyleSheet, TouchableOpacity, Platform, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      // Optimize the image
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('Processing image:', processedImage.uri);
      
      // Navigate to assistant with the processed image
      router.push({
        pathname: "./assistant",
        params: { 
          imageUri: processedImage.uri,
          type: 'ticket'
        }
      });

    } catch (error) {
      console.error('Image Processing Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      await processImage(imageUri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Upload Ticket</ThemedText>
        <ThemedText style={styles.subtitle}>
          Upload a screenshot of your betting ticket to get instant analysis
        </ThemedText>
      </ThemedView>

      <TouchableOpacity 
        style={styles.uploadArea} 
        onPress={pickImage}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        <ThemedView style={styles.placeholderContainer}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              {isProcessing && (
                <ThemedView style={styles.processingOverlay}>
                  <MaterialIcons name="hourglass-top" size={48} color="#1E90FF" />
                  <ThemedText style={styles.processingText}>Processing...</ThemedText>
                </ThemedView>
              )}
            </>
          ) : (
            <ThemedView style={styles.uploadPlaceholder}>
              <MaterialIcons name="cloud-upload" size={48} color="#1E90FF" />
              <ThemedText style={styles.uploadText}>Tap to Upload Screenshot</ThemedText>
              <ThemedText style={styles.supportedFormats}>
                Supports PNG, JPG formats
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>

      <ThemedView style={styles.instructions}>
        <ThemedText style={styles.instructionsTitle}>How it works:</ThemedText>
        {[
          "Take a screenshot of your betting ticket",
          "Upload the screenshot here",
          "Get instant analysis and insights"
        ].map((text, index) => (
          <ThemedView key={index} style={styles.step}>
            <ThemedView style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.stepText}>{text}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
    paddingTop: Platform.select({ ios: 100, android: 100, web: 100 }),
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  uploadArea: {
    flex: 1,
    maxHeight: width * 0.7,
    marginVertical: 10,
  },
  placeholderContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1E90FF30',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  uploadText: {
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: '600',
  },
  supportedFormats: {
    fontSize: 12,
    opacity: 0.5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  instructions: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  processingText: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 