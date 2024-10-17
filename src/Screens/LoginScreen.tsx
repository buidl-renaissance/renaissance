import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleEmailLogin = () => {
    // Implement email login logic here
    console.log('Email login');
  };

  const handleSocialLogin = (platform: string) => {
    // Implement social login logic here
    console.log(`${platform} login`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
        <Text style={styles.loginButtonText}>Login with Email</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, styles.instagramButton]}
          onPress={() => handleSocialLogin('Instagram')}
        >
          <FontAwesome name="instagram" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialButton, styles.linkedinButton]}
          onPress={() => handleSocialLogin('LinkedIn')}
        >
          <FontAwesome name="linkedin" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={() => handleSocialLogin('Google')}
        >
          <FontAwesome name="google" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 20,
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  socialButton: {
    padding: 10,
    borderRadius: 5,
    width: 50,
    alignItems: 'center',
  },
  instagramButton: {
    backgroundColor: '#C13584',
  },
  linkedinButton: {
    backgroundColor: '#0077B5',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
});

export default LoginScreen;
