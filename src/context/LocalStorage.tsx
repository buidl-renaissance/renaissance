import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadAudioUri, uploadImage } from '../dpop'; // Assuming these functions are in dpop.ts

interface ContentUpload {
  id: string;
  uri: string;
  type: 'audio' | 'image';
  timestamp: number;
  elapsedTime?: number;
  metadata?: any;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  remoteUrl?: string;
}

interface LocalStorageContextType {
  contentUploads: ContentUpload[];
  addContentUpload: (upload: Omit<ContentUpload, 'uploadStatus'>) => Promise<void>;
  removeContentUpload: (id: string) => Promise<void>;
  clearAllContentUploads: () => Promise<void>;
  getContentUploadsForEvent: (eventId: string) => ContentUpload[];
  uploadContentToServer: (id: string) => Promise<void>;
  uploadAllPendingContent: () => Promise<void>;
  getUnuploadedContent: () => ContentUpload[];
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

export const LocalStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentUploads, setContentUploads] = useState<ContentUpload[]>([]);

  useEffect(() => {
    loadContentUploads();
  }, []);

  const loadContentUploads = async () => {
    try {
      const storedUploads = await AsyncStorage.getItem('contentUploads');
      if (storedUploads) {
        setContentUploads(JSON.parse(storedUploads));
      }
    } catch (error) {
      console.error('Error loading content uploads:', error);
    }
  };

  const saveContentUploads = async (uploads: ContentUpload[]) => {
    try {
      await AsyncStorage.setItem('contentUploads', JSON.stringify(uploads));
    } catch (error) {
      console.error('Error saving content uploads:', error);
    }
  };

  const addContentUpload = async (upload: Omit<ContentUpload, 'uploadStatus'>) => {
    const newUpload: ContentUpload = { ...upload, uploadStatus: 'pending' };
    const updatedUploads = [...contentUploads, newUpload];
    setContentUploads(updatedUploads);
    await saveContentUploads(updatedUploads);
  };

  const removeContentUpload = async (id: string) => {
    const updatedUploads = contentUploads.filter(upload => upload.id !== id);
    setContentUploads(updatedUploads);
    await saveContentUploads(updatedUploads);
  };

  const clearAllContentUploads = async () => {
    setContentUploads([]);
    await AsyncStorage.removeItem('contentUploads');
  };

  const getContentUploadsForEvent = (eventId: string) => {
    return contentUploads.filter(upload => upload.metadata?.eventId === eventId);
  };

  const uploadContentToServer = async (id: string) => {
    const upload = contentUploads.find(u => u.id === id);
    if (!upload) return;

    try {
      setContentUploads(prev => prev.map(u => u.id === id ? { ...u, uploadStatus: 'uploading' } : u));

      let result;
      if (upload.type === 'audio') {
        result = await uploadAudioUri(upload.uri);
      } else if (upload.type === 'image') {
        result = await uploadImage({ uri: upload.uri, type: 'image/jpeg' });
      }

      if (result && result.url) {
        setContentUploads(prev => prev.map(u => u.id === id ? { ...u, uploadStatus: 'success', remoteUrl: result.url } : u));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      setContentUploads(prev => prev.map(u => u.id === id ? { ...u, uploadStatus: 'error' } : u));
    }

    await saveContentUploads(contentUploads);
  };

  const uploadAllPendingContent = async () => {
    const pendingUploads = contentUploads.filter(u => u.uploadStatus === 'pending');
    for (const upload of pendingUploads) {
      await uploadContentToServer(upload.id);
    }
  };

  const getUnuploadedContent = () => {
    return contentUploads.filter(upload => upload.uploadStatus !== 'success');
  };

  return (
    <LocalStorageContext.Provider value={{ 
      contentUploads, 
      addContentUpload, 
      removeContentUpload, 
      clearAllContentUploads,
      getContentUploadsForEvent,
      uploadContentToServer,
      uploadAllPendingContent,
      getUnuploadedContent
    }}>
      {children}
    </LocalStorageContext.Provider>
  );
};

export const useLocalStorage = () => {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error('useLocalStorage must be used within a LocalStorageProvider');
  }
  return context;
};
