import { Text, TextProps } from 'react-native';
import { useColorScheme } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'title' | 'body' | 'caption';
}

export function ThemedText({ style, type, ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  let fontSize = 16;
  let fontWeight: 'normal' | 'bold' = 'normal';

  switch (type) {
    case 'title':
      fontSize = 24;
      fontWeight = 'bold';
      break;
    case 'caption':
      fontSize = 14;
      break;
  }

  return (
    <Text 
      style={[
        { color, fontSize, fontWeight },
        style
      ]} 
      {...props} 
    />
  );
} 