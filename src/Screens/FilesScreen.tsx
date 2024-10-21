import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Files from '../Components/Files';

type RootStackParamList = {
    Files: { path: string };
};

type FilesScreenRouteProp = RouteProp<RootStackParamList, 'Files'>;
type FilesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Files'>;

const FilesScreen: React.FC = () => {
  const navigation = useNavigation<FilesScreenNavigationProp>();
  const route = useRoute<FilesScreenRouteProp>();

  const handleFilePress = (file: { isDirectory: boolean; path: string; name: string }) => {
    if (file.isDirectory) {
      navigation.push('Files', { path: file.path });
    } else {
      // Handle file selection (e.g., open, play, or view the file)
      console.log('File selected:', file.name);
    }
  };

  return (
    <View style={styles.container}>
      <Files onFilePress={handleFilePress} directory={route.params?.path} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default FilesScreen;



