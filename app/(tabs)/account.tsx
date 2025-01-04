import { View, TouchableOpacity, Text } from 'react-native';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

export default function AccountScreen() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TouchableOpacity 
        style={{ 
          backgroundColor: '#ff3b30', 
          padding: 15, 
          borderRadius: 5,
          alignItems: 'center' 
        }} 
        onPress={handleLogout}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
} 