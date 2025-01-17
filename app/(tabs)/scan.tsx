import { StyleSheet, TouchableOpacity, Platform, Image, Dimensions, ActionSheetIOS, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import { useState } from 'react';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get('window');

const GOOGLE_CLOUD_VISION_API_KEY = Constants.expoConfig?.extra?.GOOGLE_CLOUD_VISION_API_KEY;

const extractBetInfo = (text: string): {
  player: string;
  bet: string;
  team?: string;
  opponent?: string;
  sport?: string;
  time?: string;
} => {
  try {
    // Enhanced regex patterns to extract more information
    const player = text.match(/Player:\s*([^\n]+)/i)?.[1]?.trim() || 
                  text.match(/([A-Za-z\s]+)\s+vs/i)?.[1]?.trim() || 
                  'Unknown Player';
    
    const bet = text.match(/Bet:\s*([^\n]+)/i)?.[1]?.trim() || 
                text.match(/(Over|Under)\s+[\d.]+/i)?.[0]?.trim() ||
                text.match(/([\d.]+)\s+(points|rebounds|assists)/i)?.[0]?.trim() ||
                'Unknown Bet';
    
    const team = text.match(/Team:\s*([^\n]+)/i)?.[1]?.trim();
    const opponent = text.match(/(?:vs|versus)\s+([^\n]+)/i)?.[1]?.trim();
    const sport = text.match(/Sport:\s*([^\n]+)/i)?.[1]?.trim();
    const time = text.match(/Time:\s*([^\n]+)/i)?.[1]?.trim() ||
                text.match(/(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)/)?.[1]?.trim();

    return { player, bet, team, opponent, sport, time };
  } catch (error) {
    console.error('Error extracting bet info:', error);
    return { player: 'Unknown Player', bet: 'Unknown Bet' };
  }
};

const showAnalysisOptions = (processedImage: ImageManipulator.ImageResult, extractedText: string) => {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'AI Chat Analysis', 'Statistical Analytics'],
        cancelButtonIndex: 0,
        title: 'Choose Analysis Type',
        message: 'How would you like to analyze this bet?',
      },
      (buttonIndex) => handleAnalysisChoice(buttonIndex, processedImage, extractedText)
    );
  } else {
    // Use Alert for Android and other platforms
    Alert.alert(
      'Choose Analysis Type',
      'How would you like to analyze this bet?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'AI Chat Analysis',
          onPress: () => handleAnalysisChoice(1, processedImage, extractedText),
        },
        {
          text: 'Statistical Analytics',
          onPress: () => handleAnalysisChoice(2, processedImage, extractedText),
        },
      ],
      { cancelable: true }
    );
  }
};

const handleAnalysisChoice = (
  buttonIndex: number, 
  processedImage: ImageManipulator.ImageResult, 
  extractedText: string
) => {
  if (buttonIndex === 1) {
    // Navigate to AI Chat
    router.push({
      pathname: "/assistant",
      params: { 
        imageUri: processedImage.uri,
        type: 'ticket',
        extractedText: encodeURIComponent(extractedText)
      }
    });
  } else if (buttonIndex === 2) {
    const betInfo = extractBetInfo(extractedText);
    router.push({
      pathname: "/analytics",
      params: betInfo
    });
  }
};

export default function ScanScreen() {
  const { t } = useTranslation();
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
      
      // Show options to user
      showAnalysisOptions(processedImage, extractedText);

    } catch (error) {
      console.error('Image Processing Error:', error);
      Alert.alert(
        'Error',
        'Failed to process the image. Please try again.',
        [{ text: 'OK' }]
      );
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
        <ThemedText style={styles.title}>{t('Scan Betting Slip')}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t('Take a photo or upload your betting slip for instant analysis')}
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
                  <ThemedText style={styles.processingText}>
                    {t('Analyzing your betting slip...')}
                  </ThemedText>
                </ThemedView>
              )}
            </>
          ) : (
            <ThemedView style={styles.uploadPlaceholder}>
              <MaterialIcons name="add-a-photo" size={48} color="#1E90FF" />
              <ThemedText style={styles.uploadText}>
                {t('Tap to Upload')}
              </ThemedText>
              <ThemedText style={styles.supportedFormats}>
                {t('Take a photo or choose from gallery')}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>

      <ThemedView style={styles.instructions}>
        <ThemedText style={styles.instructionsTitle}>{t('Quick Guide')}</ThemedText>
        <ThemedView style={styles.step}>
          <ThemedView style={styles.stepNumber}>
            <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
          </ThemedView>
          <ThemedText style={styles.stepText}>
            {t('Take a clear, screenshot of your entire betting slip')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.step}>
          <ThemedView style={styles.stepNumber}>
            <MaterialIcons name="auto-awesome" size={20} color="#FFFFFF" />
          </ThemedView>
          <ThemedText style={styles.stepText}>
            {t('Our AI will scan and analyze the betting details')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.step}>
          <ThemedView style={styles.stepNumber}>
            <MaterialIcons name="insights" size={20} color="#FFFFFF" />
          </ThemedView>
          <ThemedText style={styles.stepText}>
            {t('Choose between AI chat analysis or statistical insights')}
          </ThemedText>
        </ThemedView>
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
    borderColor: '#1E90FF20',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: '#00001A',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#00001A',
  },
  uploadText: {
    fontSize: 20,
    color: '#1E90FF',
    fontWeight: '600',
  },
  supportedFormats: {
    fontSize: 14,
    opacity: 0.7,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  instructions: {
    padding: 24,
    borderRadius: 16,
    gap: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
    backgroundColor: '#000010',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    opacity: 0.9,
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