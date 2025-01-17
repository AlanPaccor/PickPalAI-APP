import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      category: "Getting Started",
      question: "How does the AI betting analysis work?",
      answer: "Our AI analyzes multiple data points including team statistics, player performance, historical matchups, and current trends to provide informed betting recommendations. The analysis is customized based on your preferences and risk tolerance settings."
    },
    {
      category: "Getting Started",
      question: "How accurate are the predictions?",
      answer: "While we strive for high accuracy, sports betting inherently involves risk. Our AI typically achieves 76-88% accuracy, but this can vary based on various factors. Always use our recommendations as part of your broader research."
    },
    {
      category: "Account & Billing",
      question: "How do I end my subscription plan?",
      answer: "You can end your subscription plan in the Billing & Payments section of your account settings. Select 'End Subscription' to end your subscription."
    },
    {
      category: "Account & Billing",
      question: "Can I get a refund?",
      answer: "We do not offer refunds. If you have any concerns about our service, please contact our support team, and we will be happy to assist you."
    },
    {
      category: "Using the App",
      question: "How do I scan a betting ticket?",
      answer: "To scan a ticket, tap the scan button at the bottom of the screen and either take a photo or upload an existing image of your betting ticket. Our AI will analyze the ticket and provide recommendations."
    },
    {
      category: "Using the App",
      question: "Can I customize the AI's analysis style?",
      answer: "Yes! Go to Betting Preferences in your account settings to customize the AI's risk tolerance, communication style, and analysis detail level to match your preferences."
    },
    {
      category: "Privacy & Security",
      question: "Is my betting data secure?",
      answer: "Yes, we use industry-standard encryption to protect your data. Your betting history and personal information are never shared with third parties without your explicit consent."
    },
    {
      category: "Privacy & Security",
      question: "Can I delete my account and data?",
      answer: "Yes, you can request account deletion through Privacy & Security settings. This will permanently remove all your data from our servers."
    },
  ];

  // Group FAQ items by category
  const groupedFAQs = faqItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

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
        <ThemedText type="title">FAQ</ThemedText>
      </ThemedView>

      {Object.entries(groupedFAQs).map(([category, items], categoryIndex) => (
        <ThemedView key={category} style={styles.section}>
          <ThemedText type="subtitle" style={styles.categoryTitle}>
            {category}
          </ThemedText>
          
          {items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[
                styles.faqItem,
                expandedIndex === categoryIndex * 100 + itemIndex && styles.expandedItem
              ]}
              onPress={() => setExpandedIndex(
                expandedIndex === categoryIndex * 100 + itemIndex 
                  ? null 
                  : categoryIndex * 100 + itemIndex
              )}
            >
              <ThemedView style={styles.questionContainer}>
                <ThemedText type="defaultSemiBold" style={styles.question}>
                  {item.question}
                </ThemedText>
                <MaterialCommunityIcons 
                  name={expandedIndex === categoryIndex * 100 + itemIndex ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={theme.tint}
                />
              </ThemedView>
              
              {expandedIndex === categoryIndex * 100 + itemIndex && (
                <ThemedText style={styles.answer}>
                  {item.answer}
                </ThemedText>
              )}
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}

      <ThemedView style={styles.supportSection}>
        <ThemedText style={styles.supportText}>
          Still have questions? Contact our support team.
        </ThemedText>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => router.push('/account/support')}
        >
          <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  categoryTitle: {
    marginBottom: 16,
    color: '#1E90FF',
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    marginBottom: 12,
  },
  expandedItem: {
    borderColor: '#1E90FF40',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    flex: 1,
    marginRight: 16,
  },
  answer: {
    marginTop: 16,
    lineHeight: 22,
    opacity: 0.8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF10',
  },
  supportSection: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    alignItems: 'center',
    marginTop: 8,
  },
  supportText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  contactButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 