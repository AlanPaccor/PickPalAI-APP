import { StyleSheet, TouchableOpacity, Platform, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useState } from 'react';
import Constants from 'expo-constants';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

const GOOGLE_CLOUD_VISION_API_KEY = Constants.expoConfig?.extra?.GOOGLE_CLOUD_VISION_API_KEY;

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
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      if (!processedImage.base64) {
        throw new Error('Failed to process image to base64');
      }

      console.log('Processing image:', processedImage.uri);

      // Call Google Cloud Vision API
      const body = {
        requests: [
          {
            image: {
              content: processedImage.base64,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const extractedText = data.responses[0]?.fullTextAnnotation?.text;

      if (!extractedText) {
        throw new Error('No text was extracted from the image');
      }

      console.log('Extracted text:', extractedText);
      
      // Navigate to assistant with the processed image and extracted text
      router.push({
        pathname: "./assistant",
        params: { 
          imageUri: processedImage.uri,
          type: 'ticket',
          extractedText: encodeURIComponent(extractedText)
        }
      });

    } catch (error) {
      console.error('Image Processing Error:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    try {
      // Update to use new MediaType API
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await processImage(imageUri);
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
      // You might want to show an error message to the user here
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
    backgroundColor: '#000010',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
    color: '#FFFFFF',
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
    backgroundColor: '#000010',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: '#000010',
  },
  uploadText: {
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: '600',
  },
  supportedFormats: {
    fontSize: 12,
    opacity: 0.5,
    color: '#FFFFFF',
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
    borderColor: '#ffffff20',
    backgroundColor: '#000010',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#FFFFFF',
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
    backgroundColor: '#000070',
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
    color: '#FFFFFF',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000010',
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