import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { encode, decode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';

global.atob = decode; // Set global atob function

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/login`, {
        username,
        password,
      });
  
      const { token } = response.data;
      console.log('Token:', token);
  
      if (token) {
        const decodedToken = JSON.parse(decode(token.split('.')[1]));
        console.log('Decoded token:', decodedToken);
  
        await AsyncStorage.setItem('token', token);
  
        navigation.navigate('Main');
      } else {
        throw new Error('Token is undefined');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response);
        setErrorMessage(error.response.data.message || 'Login failed');
      } else if (error.request) {
        console.error('Error request:', error.request);
        setErrorMessage('Server unreachable. Check your connection.');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <LinearGradient
      colors={['rgba(42,0,58,1)', 'rgba(128,0,128,1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Antabay Login</Text>
        <Text style={styles.subtitle}>Please enter your username and password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        <Text style={styles.signUpText}>
          Don't have an account yet? <Text style={styles.signUpLink} onPress={() => navigation.navigate('Signup')}>Sign Up</Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#800080',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  signUpText: {
    marginTop: 20,
  },
  signUpLink: {
    color: '#800080',
    fontWeight: 'bold',
  },
});

export default Login;
