import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from '../context/AudioPlayer';
import AudioView from '../Components/Content/AudioView';
import { ContentView } from '../Components/ContentView';
import { useArtworks, useContent } from "../hooks/useArtwork";
import { DAContent } from '../interfaces';
import { theme } from '../colors';

const AudioContentScreen: React.FC = () => {
  const [content] = useContent();

  const renderAudioItem = ({ item }: { item: DAContent }) => (
    <ContentView content={item} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={content}
        renderItem={renderAudioItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContainer: {
    padding: 0,
  },
  audioItem: {
    marginBottom: 24,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default AudioContentScreen;
