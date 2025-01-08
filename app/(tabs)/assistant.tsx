import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AssistantScreen() {
  const { imageUri, type, extractedText } = useLocalSearchParams<{ 
    imageUri: string, 
    type: string,
    extractedText: string 
  }>();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (imageUri && extractedText) {
      console.log('Received image and text in assistant:', imageUri);
      processTicketImage(imageUri, extractedText);
    }
  }, [imageUri, extractedText]);

  const processTicketImage = async (uri: string, text: string) => {
    try {
      console.log('Processing ticket with text:', decodeURIComponent(text));
      
      // Add the extracted text to the chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `I've analyzed your ticket. Here's what I found:\n\n${decodeURIComponent(text)}\n\nWhat would you like to know about this ticket?`
      }]);

    } catch (error) {
      console.error('Processing Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that ticket. Could you try uploading it again?'
      }]);
    }
  };

  const handleSend = () => {
    if (message.trim() === '') return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message.trim() }]);
    
    // TODO: Add your AI API call here
    // For now, just echo the message
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `You said: ${message}` }]);
    }, 500);

    setMessage('');
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
              {chat.content}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  imagePreviewContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
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
    backgroundColor: '#0A84FF',
    borderBottomRightRadius: 5,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderBottomLeftRadius: 5,
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
    backgroundColor: '#2A2A2A',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#404040',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 