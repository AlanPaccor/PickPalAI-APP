import { View, ViewProps, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

export function ThemedView(props: ViewProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.background,
        },
        StyleSheet.flatten(props.style),
      ]}
    />
  );
}
