import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAudioPlayer } from '../context/AudioPlayer';
import moment from 'moment';
import { uploadAudioUri, uploadImage } from '../dpop';
import Icon from '../Components/Icon';
import { IconTypes } from '../Components/Icon';

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  modificationTime?: number;
  size?: number;
}

interface FilesProps {
  directory: string;
  onFilePress: (file: FileInfo) => void;
}

const Files: React.FC<FilesProps> = ({
  directory,
  onFilePress,
}) => {
  const [currentPath, setCurrentPath] = React.useState<string>(directory ?? FileSystem.cacheDirectory ?? "");
  const [files, setFiles] = React.useState<FileInfo[]>([]);
  const { playSound } = useAudioPlayer();

  React.useEffect(() => {
    listFiles(currentPath);
  }, [currentPath]);

  const listFiles = async (path: string) => {
    try {
      const result = await FileSystem.readDirectoryAsync(path);
      const fileInfoPromises = result.map(async (item) => {
        const fullPath = `${path}${item}`;
        const info = await FileSystem.getInfoAsync(fullPath);
        return {
          name: item,
          path: fullPath,
          isDirectory: info.isDirectory,
          modificationTime: info.modificationTime,
          size: info.size,
        };
      });
      const fileInfos = await Promise.all(fileInfoPromises);
      console.log("listFiles", fileInfos);
      // Sort files by timestamp (modificationTime) in descending order
      const sortedFiles = fileInfos.sort((a, b) => {
        return (b.modificationTime ?? 0) - (a.modificationTime ?? 0);
      });
      setFiles(sortedFiles);
    } catch (error) {
      console.error('Error listing files:', error);
    }
  };

  const handleFilePress = async (file: FileInfo) => {
    if (file.isDirectory) {
      // setCurrentPath(file.path + '/');
      onFilePress(file);
    } else {
      console.log("This is a file:", file.name);
      if (file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav')) {
        await playSound(file.path);
      } else if (file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.gif')) {
        // For image files, we don't need to do anything here as they will be displayed in the renderItem function
        console.log("This is an image file");
      }
    }
  };

  const handleUpload = async (file: FileInfo) => {
    if (file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav')) {
      await uploadAudioUri(file.path);
    } else if (file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.gif')) {
      await uploadImage(file.path);
    } else {
      console.error('Unsupported file type for upload');
    }
  };

  const renderItem = ({ item }: { item: FileInfo }) => (
    <View style={styles.fileItem}>
      <TouchableOpacity onPress={() => handleFilePress(item)} style={styles.fileContent}>
        <View style={styles.fileDetails}>
          <Text style={styles.fileName}>{item.name}</Text>
          {!item.isDirectory && (
            <View>
              <Text style={styles.fileInfo}>
                Modified: {moment(Number(item.modificationTime) * 1000).format('MMMM Do YYYY, h:mm:ss a')}
              </Text>
              <Text style={styles.fileInfo}>
                Size: {((item.size ?? 0) / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
          )}
          {!item.isDirectory && (item.name.endsWith('.jpg') || item.name.endsWith('.png') || item.name.endsWith('.gif')) && (
            <Image source={{ uri: item.path }} style={styles.imagePreview} />
          )}
        </View>
        {!item.isDirectory && (
          <TouchableOpacity onPress={() => handleUpload(item)} style={styles.uploadIcon}>
            <Icon name="upload" type={IconTypes.Feather} size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.currentPath}>{currentPath}</Text>
      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={(item) => item.path}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  currentPath: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileInfo: {
    fontSize: 12,
    color: '#666',
  },
  imagePreview: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginTop: 10,
  },
  uploadIcon: {
    padding: 10,
  },
});

export default Files;

// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import * as FileSystem from 'expo-file-system';

// const Files: React.FC = () => {
//   const [audioFiles, setAudioFiles] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchAudioFiles = async () => {
//       try {
//         const audioDir = FileSystem.documentDirectory + 'audio/';
//         const dirInfo = await FileSystem.getInfoAsync(audioDir);
        
//         if (!dirInfo.exists) {
//           console.log('Audio directory does not exist');
//           return;
//         }

//         const files = await FileSystem.readDirectoryAsync(audioDir);
//         const audioFiles = files.filter(file => file.endsWith('.m4a') || file.endsWith('.mp3'));
//         setAudioFiles(audioFiles);
//       } catch (error) {
//         console.error('Error fetching audio files:', error);
//       }
//     };

//     fetchAudioFiles();
//   }, []);

//   const renderItem = ({ item }: { item: string }) => (
//     <View style={styles.fileItem}>
//       <Text>{item}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Saved Audio Files</Text>
//       <FlatList
//         data={audioFiles}
//         renderItem={renderItem}
//         keyExtractor={(item) => item}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   fileItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
// });

// export default Files;
