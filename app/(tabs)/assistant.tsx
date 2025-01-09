import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;

export default function AssistantScreen() {
  const { imageUri, type, extractedText } = useLocalSearchParams<{ 
    imageUri: string, 
    type: string,
    extractedText: string 
  }>();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (extractedText) {
      processTicketWithAI(extractedText);
    }
  }, [extractedText]);

  const processTicketWithAI = async (text: string) => {
    try {
      setIsLoading(true);
      const decodedText = decodeURIComponent(text);
      
      let userPreferences = {
        riskTolerance: 50,
        communicationStyle: 'professional',
        detailLevel: 'detailed',
        showProbability: true,
        showTrends: true,
        expertOpinions: true,
        preferredSports: ['basketball', 'football'],
        betTypes: ['spread', 'moneyline'],
      };

      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().aiPreferences) {
          userPreferences = userDoc.data().aiPreferences;
        }
      }

      const systemMessage = `You are a sports betting assistant who adapts to the user's preferences:
      - Risk Tolerance: ${userPreferences.riskTolerance}/100 (higher means more aggressive)
      - Communication Style: ${userPreferences.communicationStyle}
      - Detail Level: ${userPreferences.detailLevel}
      ${userPreferences.showProbability ? '- Include probability percentages' : ''}
      ${userPreferences.showTrends ? '- Include relevant betting trends' : ''}
      ${userPreferences.expertOpinions ? '- Include expert opinions' : ''}

      Focus on these sports: ${userPreferences.preferredSports.join(', ')}
      Preferred bet types: ${userPreferences.betTypes.join(', ')}

      When analyzing bets:
      1. Match the user's preferred communication style and detail level
      2. Adjust risk recommendations based on their tolerance level
      3. Only include probabilities, trends, and expert opinions if enabled
      4. Focus on their preferred sports and bet types
      5. Format important points in bold using **text**`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemMessage
            },
            {
              role: "user",
              content: decodedText
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't analyze that properly.";

      setChatHistory([{
        role: 'assistant',
        content: aiResponse
      }]);

    } catch (error) {
      console.error('AI Processing Error:', error);
      setChatHistory([{
        role: 'assistant',
        content: 'Sorry, I had trouble analyzing that. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (message.trim() === '' || isLoading) return;

    const userMessage = message.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a friendly sports betting assistant who:
              1. Uses simple, everyday language
              2. Provides relevant recent player stats when discussing players
              3. Explains concepts as if you're confidant in your knowledge
              4. Breaks down complex ideas into simple terms
              5. Focuses on what matters most to the bettor
              6. Provides clear opinion on which bet to make (Example: "I would suggest {answer}, remember this is just my opinion and you should make your own decision")`
            },
            ...chatHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: aiResponse
      }]);

    } catch (error) {
      console.error('Chat Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I ran into an error. Let's try that again!"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.imagePreview} 
            resizeMode="contain" 
          />
        </View>
      )}
      
      <ScrollView 
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContentContainer}
      >
        {chatHistory.map((chat, index) => (
          <View 
            key={index} 
            style={[
              styles.messageContainer,
              chat.role === 'user' ? styles.userMessage : styles.assistantMessage
            ]}
          >
            <Text 
              style={[
                styles.messageText,
                chat.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}
            >
              {chat.content.split('**').map((text, index) => (
                <Text key={index} style={index % 2 === 1 ? styles.boldText : undefined}>
                  {text}
                </Text>
              ))}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('analyzing')}</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={t('chatPlaceholder')}
          placeholderTextColor="#888"
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (!message.trim() || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const additionalStyles = StyleSheet.create({
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  imagePreviewContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#000010',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  chatContainer: {
    flex: 1,
  },
  chatContentContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 6,
    padding: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000010',
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#000010',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#000010',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF20',
  },
  input: {
    flex: 1,
    backgroundColor: '#000010',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  sendButton: {
    backgroundColor: '#000010',
    borderRadius: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  sendButtonDisabled: {
    backgroundColor: '#000010',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ...additionalStyles,
  boldText: {
    fontWeight: 'bold',
  },
}); 