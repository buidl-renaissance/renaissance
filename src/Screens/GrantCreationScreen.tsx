import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const GrantCreationScreen = ({
  navigation
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  navigation.setOptions({
    headerTitle: "Create Grant",
  });

  const handleCreateGrant = () => {
    // Handle the logic to create the grant with the provided details
    // This could include sending the data to a server or updating state in your application
    console.log('Grant Created:', { title: title, description: description, url: url });

    // Optionally, reset the form fields after creating the grant
    setTitle('');
    setDescription('');
    setUrl('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="Enter title..."
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]} // Increase height for multiline input
        multiline
        placeholder="Enter description..."
      />

      <Text style={styles.label}>URL</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        style={styles.input}
        placeholder="Enter URL..."
      />

      <Button title="Create Grant" onPress={handleCreateGrant} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default GrantCreationScreen;
