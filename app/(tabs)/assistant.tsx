import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AssistantScreen() {
  const { imageUri, type } = useLocalSearchParams<{ imageUri: string, type: string }>();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (imageUri) {
      console.log('Received image in assistant:', imageUri);
      processTicketImage(imageUri);
    }
  }, [imageUri]);

  const processTicketImage = async (uri: string) => {
    try {
      console.log('Starting processing for:', uri);
      
      // For now, just acknowledge receipt of the image
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `I received your ticket image. OCR processing will be implemented later.`
      }]);

    } catch (error) {
      console.error('Processing Error:', error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble with that ticket. Could you try uploading it again?'
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
          placeholderTextColor="#666"
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
    backgroundColor: '#F5F5F5',
  },
  imagePreviewContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 5,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#000000',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 