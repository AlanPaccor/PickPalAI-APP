import React, { createContext, useContext, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { initializeI18n } from '../i18n';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setIsLoading: () => {},
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const init = async () => {
      try {
        await initializeI18n();
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000010' }}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext); 