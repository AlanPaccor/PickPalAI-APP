import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Switch, Modal } from 'react-native';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { MaterialCommunityIconName } from '@/types/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { useBetCount } from '../hooks/useBetCount';

interface MenuItem {
  icon: MaterialCommunityIconName;
  label: string;
  onPress: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface ModalContent {
  title: string;
  content: string;
}

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const user = auth.currentUser;
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({ title: '', content: '' });
  const { betCount } = useBetCount();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const showModal = (title: string, content: string) => {
    setModalContent({ title, content });
    setModalVisible(true);
  };

  const menuItems: MenuSection[] = [
    {
      title: 'Account Settings',
      items: [
        { 
          icon: 'account-cog', 
          label: 'Profile Settings', 
          onPress: () => router.push('/account/profile')
        },
        { 
          icon: 'credit-card-outline', 
          label: 'Billing & Payments', 
          onPress: () => router.push('/account/billing')
        },
        { 
          icon: 'bell-outline', 
          label: 'Notifications', 
          onPress: () => router.push('/account/notifications')
        },
      ]
    },
    {
      title: 'Preferences & Privacy',
      items: [
        { 
          icon: 'shield-lock-outline', 
          label: 'Privacy & Security', 
          onPress: () => router.push('/account/privacy')
        },
        { 
          icon: 'chart-line', 
          label: 'Betting Preferences', 
          onPress: () => router.push('/account/betting-preferences')
        },
        { 
          icon: 'help-circle-outline', 
          label: 'Support & Feedback', 
          onPress: () => router.push('/account/support')
        },
      ]
    }
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.profileSection}>
        <ThemedText type="title">{user?.email || 'User'}</ThemedText>
        <ThemedText style={styles.joinDate}>Member since {new Date().getFullYear()}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statItem}>
          <ThemedText type="defaultSemiBold">{betCount}</ThemedText>
          <ThemedText>Bets Analyzed</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statItem}>
          <ThemedText type="defaultSemiBold">89%</ThemedText>
          <ThemedText>Win Rate</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statItem}>
          <ThemedText type="defaultSemiBold">$0</ThemedText>
          <ThemedText>Total Profit</ThemedText>
        </ThemedView>
      </ThemedView>

      {menuItems.map((section, index) => (
        <ThemedView key={index} style={[styles.section, styles.sectionContainer]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity 
              key={itemIndex} 
              style={[
                styles.menuItem,
                itemIndex === section.items.length - 1 && styles.lastMenuItem
              ]}
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
        style={[styles.logoutButton, { backgroundColor: '#000010',
          borderWidth: 1,
          borderColor: '#FFFFFF20',
         }]} 
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={24} color="white" />
        <ThemedText style={styles.logoutText}>Logout</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>{modalContent.title}</ThemedText>
            <ThemedText style={styles.modalText}>{modalContent.content}</ThemedText>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.modalButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000010',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 100,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  joinDate: {
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    backgroundColor: Platform.select({ 
      ios: '#000010', 
      android: '#000010', 
      web: '#000010' 
    }),
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  sectionContainer: {
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#000010',
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
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF10',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContent: {
    backgroundColor: '#000010',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
}); 