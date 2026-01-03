import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DAContent } from '../dpop';
import { updateContent } from '../dpop'; // Assuming you have an API function to update content
import { ArtworkView } from '../Components/ArtworkView';
import moment from 'moment';
import { theme } from '../colors';

const EditContentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [content, setContent] = useState<DAContent | null>(null);

  useEffect(() => {
    if (route.params?.content) {
      setContent(route.params.content as DAContent);
    }
  }, [route.params]);

  const handleSave = async () => {
    if (content) {
      try {
        await updateContent(content);
        navigation.goBack();
      } catch (error) {
        console.error('Error updating content:', error);
      }
    }
  };

  if (!content) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Content</Text>

      <Text style={styles.label}>Caption:</Text>
      <TextInput
        style={styles.input}
        value={content.caption}
        onChangeText={(text) => setContent({ ...content, caption: text })}
        multiline
      />

      <Text style={styles.label}>Timestamp:</Text>
      <Text style={styles.text}>{moment(content.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</Text>

      <Text style={styles.label}>Artwork:</Text>
      {content.data.image && (
        <ArtworkView
          name={content.caption}
          description={moment(content.timestamp).fromNow()}
          image={{ uri: content.data.image }}
        />
      )}

      {content.data.type === 'audio' && (
        <View>
          <Text style={styles.label}>Audio:</Text>
          <Text style={styles.text}>{content.data.audio}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditContentScreen;
