import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface Category {
  title: string;
  items: string[];
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
} 