import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAudioPlayer } from '../context/AudioPlayer';
import moment from 'moment';
import { uploadAudioUri } from '../dpop';

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  modificationTime?: number;
  size?: number;
}

const Files = () => {
  const [currentPath, setCurrentPath] = React.useState<string>(FileSystem.cacheDirectory ?? "");
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
      setCurrentPath(file.path + '/');
    } else {
      console.log("This is a file:", file.name);
      if (file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav')) {
        playSound(file.path);
      }
    }
  };

  const handleUpload = async (file: FileInfo) => {
    // Implement your upload logic here
    await uploadAudioUri(file.path);
  };

  const renderItem = ({ item }: { item: FileInfo }) => (
    <View style={styles.fileItem}>
      <TouchableOpacity onPress={() => handleFilePress(item)}>
        <Text style={styles.fileName}>{item.name}</Text>
        {!item.isDirectory && (
          <View>
            <Text style={styles.fileInfo}>
              Recorded: {moment(Number(item.modificationTime) * 1000).format('MMMM Do YYYY, h:mm:ss a')}
            </Text>
            <Text style={styles.fileInfo}>
              Size: {((item.size ?? 0) / 1024 / 1024).toFixed(2)} MB
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {!item.isDirectory && (
        <Button title="Upload" onPress={() => handleUpload(item)} />
      )}
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileInfo: {
    fontSize: 12,
    color: '#666',
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
