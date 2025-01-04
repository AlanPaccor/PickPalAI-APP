import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function Welcome() {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
    >
      <View style={styles.content}>
        <Text style={styles.logoText}>Aora</Text>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
            }} 
            style={styles.image}
            resizeMode="cover"
          />
          <Image 
            source={{ 
              uri: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
            }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.title}>Discover Endless</Text>
        <Text style={styles.titleHighlight}>Possibilities with Aora</Text>
        
        <Text style={styles.subtitle}>
          Where creativity meets innovation: embark on a journey of limitless exploration with Aora
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/auth/register')}
      >
        <Text style={styles.buttonText}>Continue with Email</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  image: {
    width: 150,
    height: 200,
    borderRadius: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  titleHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 25,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
}); 