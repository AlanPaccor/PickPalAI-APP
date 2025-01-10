import React, { createContext, useContext, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import i18n from '../i18n';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingText?: string;
  setLoadingText: (text?: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
  loadingText: undefined,
  setLoadingText: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string>();

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setIsLoading,
        loadingText,
        setLoadingText,
      }}
    >
      {children}
      <Modal visible={isLoading} transparent>
        <View style={styles.container}>
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0A84FF" />
            {loadingText && (
              <ThemedText style={styles.text}>
                {loadingText}
              </ThemedText>
            )}
          </View>
        </View>
      </Modal>
    </LoadingContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
}); 