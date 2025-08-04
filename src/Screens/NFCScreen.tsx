import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

const NFCScreen = () => {
  const [url, setUrl] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [hasNfc, setHasNfc] = useState(false);

  useEffect(() => {
    const checkNfc = async () => {
      const supported = await NfcManager.isSupported();
      if (supported) {
        await NfcManager.start();
        setHasNfc(true);
      } else {
        Alert.alert('Error', 'NFC is not supported on this device');
      }
    };

    checkNfc();

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      // Use unregisterTagEvent instead of stop which doesn't exist
      NfcManager.unregisterTagEvent().catch(() => {});
    };
  }, []);

  const writeNfc = async () => {
    if (!url) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    try {
      setIsWriting(true);
      
      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Ready to write some NDEF',
      });
      
      // Format the URL with proper prefix if needed
      let urlToWrite = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToWrite = `https://${url}`;
      }
      
      // Create URL record
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(urlToWrite)]);
      
      // Write the data to the tag
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      
      Alert.alert('Success', 'URL written to NFC tag successfully');
    } catch (error) {
      console.log('error', error);
      console.warn('Error writing to NFC:', error);
      Alert.alert('Error', 'Failed to write to NFC tag. Please try again.');
    } finally {
      // Clean up
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsWriting(false);
    }
  };

  if (!hasNfc) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>NFC not supported</Text>
        <Text>This device does not support NFC functionality.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>NFC URL Writer</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter URL (e.g., example.com)"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          
          <Button
            title={isWriting ? "Waiting for NFC tag..." : "Write URL to NFC Tag"}
            onPress={writeNfc}
            disabled={isWriting || !url}
          />
          
          {isWriting && (
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                Hold your device near an NFC tag to write the URL.
              </Text>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  instructions: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e7f3ff',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    textAlign: 'center',
    color: '#0066cc',
  },
});

export default NFCScreen;
