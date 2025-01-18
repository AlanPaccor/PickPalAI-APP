import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information that you provide directly to us, including:
• Account information (email, password)
• Betting history and preferences
• Device information and usage data
• Analytics data to improve our services`
    },
    {
      title: "How We Use Your Information",
      content: `Your information helps us:
• Provide and improve our AI betting analysis
• Personalize your experience
• Send important updates and notifications
• Maintain app security and prevent fraud`
    },
    {
      title: "Data Security",
      content: `We implement industry-standard security measures:
• End-to-end encryption for sensitive data
• Secure cloud storage with regular backups
• Regular security audits and updates
• Strict access controls for user data`
    },
    {
      title: "Data Sharing",
      content: `We never sell your personal data. We may share anonymous, aggregated data to:
• Improve our AI models
• Analyze betting trends
• Generate market insights
Your individual betting history remains private.`
    },
    {
      title: "Your Rights",
      content: `You have the right to:
• Access your personal data
• Request data deletion
• Opt out of data sharing
• Export your data
Contact support to exercise these rights.`
    },
    {
      title: "Updates to Policy",
      content: "We may update this privacy policy occasionally. We'll notify you of any significant changes through the app or email."
    },
    {
      title: "Contact Us",
      content: "For privacy-related questions or concerns, contact our support team at support@pickpalai.com"
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
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
        <ThemedText type="title">Privacy Policy</ThemedText>
      </ThemedView>

      {/* Last Updated */}
      <ThemedText style={styles.lastUpdated}>
        Last Updated: {new Date().toLocaleDateString()}
      </ThemedText>

      {/* Policy Sections */}
      {sections.map((section, index) => (
        <ThemedView key={index} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          <ThemedText style={styles.sectionContent}>
            {section.content}
          </ThemedText>
        </ThemedView>
      ))}
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
  lastUpdated: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    backgroundColor: '#000010',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E90FF',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
}); 