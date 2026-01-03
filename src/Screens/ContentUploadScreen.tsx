import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalStorage } from '../context/LocalStorage';
import Icon, { IconTypes } from '../Components/Icon';
import { ContentUpload } from '../interfaces';
import { theme } from '../colors';

const ContentUploadScreen: React.FC = () => {
  const { 
    getUnuploadedContent, 
    uploadContentToServer, 
    uploadAllPendingContent 
  } = useLocalStorage();

  const [unuploadedContent, setUnuploadedContent] = useState<ContentUpload[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    refreshUnuploadedContent();
  }, []);

  const refreshUnuploadedContent = () => {
    const content = getUnuploadedContent();
    setUnuploadedContent(content);
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    await uploadAllPendingContent();
    setIsUploading(false);
    refreshUnuploadedContent();
  };

  const handleUploadSingle = async (id: string) => {
    await uploadContentToServer(id);
    refreshUnuploadedContent();
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.type} - {new Date(item.timestamp).toLocaleString()}</Text>
      <TouchableOpacity 
        onPress={() => handleUploadSingle(item.id)}
        disabled={item.uploadStatus === 'uploading'}
      >
        {item.uploadStatus === 'uploading' ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Icon type={IconTypes.Ionicons} name="upload" size={24} color="#0000ff" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Upload Queue</Text>
      {unuploadedContent.length > 0 ? (
        <>
          <FlatList
            data={unuploadedContent}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity 
            style={styles.uploadAllButton} 
            onPress={handleUploadAll}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.uploadAllButtonText}>Upload All</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noContentText}>No content waiting to be uploaded.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  itemText: {
    fontSize: 16,
  },
  uploadAllButton: {
    backgroundColor: '#6366F1',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadAllButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noContentText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ContentUploadScreen;
