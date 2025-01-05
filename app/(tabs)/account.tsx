import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Switch } from 'react-native';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { MaterialCommunityIconName } from '@/types/icons';

interface MenuItem {
  icon: MaterialCommunityIconName;
  label: string;
  onPress: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems: MenuSection[] = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'account-edit-outline', label: 'Edit Profile', onPress: () => {} },
        { icon: 'bell-outline', label: 'Notifications', onPress: () => {} },
        { icon: 'shield-lock-outline', label: 'Privacy & Security', onPress: () => {} },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'chart-line', label: 'Betting Preferences', onPress: () => {} },
        { icon: 'currency-usd', label: 'Currency Settings', onPress: () => {} },
        { icon: 'translate', label: 'Language', onPress: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
        { icon: 'message-text-outline', label: 'Contact Support', onPress: () => {} },
        { icon: 'information-outline', label: 'About', onPress: () => {} },
      ]
    }
  ];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1A5F7A', dark: '#1D3D47' }}
      headerImage={
        <MaterialCommunityIcons 
          name="account-circle" 
          size={120} 
          color="#ffffff50" 
          style={styles.headerIcon} 
        />
      }>
      <ThemedView style={styles.profileSection}>
        <ThemedText type="title">{user?.email || 'User'}</ThemedText>
        <ThemedText style={styles.joinDate}>Member since {new Date().getFullYear()}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statItem}>
          <ThemedText type="defaultSemiBold">0</ThemedText>
          <ThemedText>Bets Placed</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statItem}>
          <ThemedText type="defaultSemiBold">0%</ThemedText>
          <ThemedText>Win Rate</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statItem}>
          <ThemedText type="defaultSemiBold">$0</ThemedText>
          <ThemedText>Total Profit</ThemedText>
        </ThemedView>
      </ThemedView>

      {menuItems.map((section, index) => (
        <ThemedView key={index} style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={itemIndex} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <ThemedView style={styles.menuItemContent}>
                <ThemedView style={styles.menuItemLeft}>
                  <MaterialCommunityIcons 
                    name={item.icon} 
                    size={24} 
                    color={theme.tint}
                  />
                  <ThemedText>{item.label}</ThemedText>
                </ThemedView>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={theme.tabIconDefault}
                />
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      ))}

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]} 
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={24} color="white" />
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  profileSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  joinDate: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    backgroundColor: Platform.select({ 
      ios: '#00000010', 
      android: '#00000010', 
      web: '#00000010' 
    }),
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  menuItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Platform.select({ 
      ios: '#00000010', 
      android: '#00000010', 
      web: '#00000010' 
    }),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 