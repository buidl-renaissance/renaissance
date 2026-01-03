import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../colors';

// Define types and constants locally since imports are causing errors
type VerificationStatus = 'pending' | 'verified' | 'failed';

// Mock these values since we can't import them
const colors = {
  primary: '#4285F4',
  background: '#FFFFFF',
  text: '#333333',
  success: '#34A853',
  error: '#EA4335'
};

// Websocket URL - replace with your actual websocket endpoint
const WS_URL = 'wss://your-api-endpoint.com/ws';

const VerifyScreen: React.FC = () => {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  navigation.setOptions({
    headerTitle: 'Get Connected',
    headerStyle: {
      backgroundColor: theme.background,
    },
    headerTintColor: theme.text,
  });
  
  // Mock user data - in a real app, you would get this from your auth context
  const user = {
    username: 'testuser',
    publicKey: 'abc123publickey',
    id: 'user123'
  };

  // QR code data containing username and public key
  const qrData = JSON.stringify({
    username: user.username,
    publicKey: user.publicKey,
  });

  // Set up websocket connection for verification
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    const connectWebsocket = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connection established');
          // Send initial message with user ID for identification
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'register',
              userId: user.id
            }));
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;

          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'verification_update') {
              if (data.status === 'verified') {
                setStatus('verified');
                
                // Navigate to home screen after successful verification
                setTimeout(() => {
                  // Using any to bypass the type error with navigation
                  (navigation as any).navigate('Home');
                }, 2000);
              } else if (data.status === 'failed') {
                setStatus('failed');
                setError(data.message || 'Verification failed');
              }
            }
          } catch (err) {
            console.error('Error parsing websocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error. Please try again.');
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          // Attempt to reconnect if closed unexpectedly and component is still mounted
          if (isMounted) {
            setTimeout(() => {
              connectWebsocket();
            }, 3000);
          }
        };
      } catch (err) {
        console.error('Error setting up websocket:', err);
        setError('Failed to set up verification');
      }
    };

    connectWebsocket();

    // Clean up websocket connection when component unmounts
    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Connected</Text>
      
      <View style={styles.qrContainer}>
        {qrData && (
          <QRCode
            value={qrData}
            size={200}
            color="black"
            backgroundColor="white"
          />
        )}
      </View>
      
      <Text style={styles.instructions}>
        Scan this QR code with the verification app to confirm your identity
      </Text>
      
      <View style={styles.statusContainer}>
        {status === 'pending' && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>Waiting for verification...</Text>
          </>
        )}
        
        {status === 'verified' && (
          <Text style={[styles.statusText, styles.successText]}>
            Verification successful! Redirecting...
          </Text>
        )}
        
        {status === 'failed' && (
          <Text style={[styles.statusText, styles.errorText]}>
            {error || 'Verification failed. Please try again.'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: colors.text,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 30,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 40,
    color: colors.text,
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  successText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.error,
    fontWeight: 'bold',
  },
});

export default VerifyScreen;

