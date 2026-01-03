import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { AudioRecorder } from '../Components/AudioRecorder';
import { theme } from '../colors';

const BroadcastScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Broadcast</Text>
      </View>
      <View style={styles.content}>
        <AudioRecorder />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BroadcastScreen;
