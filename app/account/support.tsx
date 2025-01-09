import { View, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

interface SupportOption {
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

export default function SupportScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const supportOptions: SupportOption[] = [
    {
      icon: 'message-question',
      title: 'FAQ',
      description: 'Find answers to common questions',
      action: () => {/* Navigate to FAQ */},
    },
    {
      icon: 'email-outline',
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: () => Linking.openURL('mailto:support@example.com'),
    },
    {
      icon: 'bug-outline',
      title: 'Report an Issue',
      description: "Let us know if something isn't working",
      action: () => Linking.openURL('mailto:bugs@example.com'),
    },
    {
      icon: 'lightbulb-outline',
      title: 'Feature Request',
      description: 'Suggest new features or improvements',
      action: () => Linking.openURL('mailto:feedback@example.com'),
    },
    {
      icon: 'star-outline',
      title: 'Rate the App',
      description: 'Share your experience with others',
      action: () => {/* Add store rating link */},
    },
  ];

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
        <ThemedText type="title">Support & Feedback</ThemedText>
      </ThemedView>

      {/* Quick Support Card */}
      <ThemedView style={styles.quickSupportCard}>
        <MaterialCommunityIcons 
          name="headphones" 
          size={32} 
          color="#4CAF50"
        />
        <ThemedText style={styles.quickSupportTitle}>Need Help?</ThemedText>
        <ThemedText style={styles.quickSupportText}>
          Our support team is available 24/7 to assist you with any questions or concerns.
        </ThemedText>
      </ThemedView>

      {/* Support Options */}
      <ThemedView style={styles.section}>
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={option.action}
          >
            <ThemedView style={styles.optionIcon}>
              <MaterialCommunityIcons 
                name={option.icon as any}
                size={24} 
                color={theme.tint}
              />
            </ThemedView>
            <ThemedView style={styles.optionContent}>
              <ThemedText type="defaultSemiBold">{option.title}</ThemedText>
              <ThemedText style={styles.optionDescription}>
                {option.description}
              </ThemedText>
            </ThemedView>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.tabIconDefault}
            />
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Support Hours */}
      <ThemedView style={styles.supportHours}>
        <ThemedText style={styles.supportHoursTitle}>Support Hours</ThemedText>
        <ThemedText style={styles.supportHoursText}>
          24/7 Email Support{'\n'}
          Live Chat: 9AM - 5PM EST
        </ThemedText>
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
  quickSupportCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#00000010',
    borderWidth: 1,
    borderColor: '#4CAF5040',
    marginBottom: 24,
  },
  quickSupportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  quickSupportText: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#00000010',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionDescription: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 4,
  },
  supportHours: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#00000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  supportHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  supportHoursText: {
    opacity: 0.7,
    lineHeight: 20,
  },
}); 