import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { debounce } from 'lodash';
import { ThemedText } from './ThemedText';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (text: string) => void;
  onClear: () => void;
}

export const SearchBar = React.memo(({ onSearch, onClear }: SearchBarProps) => {
  const { t } = useTranslation();
  const [localSearchText, setLocalSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();

  const debouncedSearch = useRef(
    debounce((text: string) => {
      onSearch(text);
    }, 300)
  ).current;

  const handleTextChange = useCallback((text: string) => {
    setLocalSearchText(text);
    debouncedSearch(text);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  return (
    <View style={styles.searchContainer}>
      <View style={[
        styles.searchBarWrapper,
        isFocused && styles.searchBarWrapperFocused
      ]}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color="#FFFFFF80" 
          style={styles.searchIcon}
        />
        <TextInput
          ref={searchInputRef}
          value={localSearchText}
          onChangeText={handleTextChange}
          placeholder={t('Search...')}
          placeholderTextColor="#FFFFFF60"
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          blurOnSubmit={true}
          enablesReturnKeyAutomatically={true}
          keyboardAppearance={colorScheme}
        />
        {localSearchText.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setLocalSearchText('');
              onSearch('');
            }}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons name="close" size={20} color="#FFFFFF80" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000010',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarWrapperFocused: {
    borderColor: '#FFFFFF40',
    backgroundColor: '#252525',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  }
}); 