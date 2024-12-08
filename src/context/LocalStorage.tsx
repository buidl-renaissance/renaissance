import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadAudioUri, uploadImage, createContent } from '../dpop';
import { ContentUpload, DAContent } from '../interfaces';
import moment from 'moment';

interface LocalStorageContextType {
  contentUploads: ContentUpload[];
  pendingContent: DAContent[];
  addContentUpload: (upload: Omit<ContentUpload, 'uploadStatus'>) => Promise<void>;
  removeContentUpload: (id: string) => Promise<void>;
  clearAllContentUploads: () => Promise<void>;
  getContentUploadsForEvent: (eventId: string) => ContentUpload[];
  uploadContentToServer: (id: string) => Promise<void>;
  uploadAllPendingContent: () => Promise<void>;
  getUnuploadedContent: () => ContentUpload[];
  addPendingContent: (content: DAContent) => Promise<void>;
  uploadPendingContent: () => Promise<void>;
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

export const LocalStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contentUploads, setContentUploads] = useState<ContentUpload[]>([]);
  const [pendingContent, setPendingContent] = useState<DAContent[]>([]);

  useEffect(() => {
    loadContentUploads();
    loadPendingContent();
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

  const loadPendingContent = async () => {
    try {
      const stored = await AsyncStorage.getItem('pendingContent');
      if (stored) {
        setPendingContent(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending content:', error);
    }
  };

  const saveContentUploads = async (uploads: ContentUpload[]) => {
    try {
      await AsyncStorage.setItem('contentUploads', JSON.stringify(uploads));
    } catch (error) {
      console.error('Error saving content uploads:', error);
    }
  };

  const savePendingContent = async (content: DAContent[]) => {
    try {
      await AsyncStorage.setItem('pendingContent', JSON.stringify(content));
    } catch (error) {
      console.error('Error saving pending content:', error);
    }
  };

  const addContentUpload = async (upload: Omit<ContentUpload, 'uploadStatus'>) => {
    const newUpload: ContentUpload = { ...upload, uploadStatus: 'pending' };
    const updatedUploads = [...contentUploads, newUpload];
    setContentUploads(updatedUploads);
    await saveContentUploads(updatedUploads);
  };

  const addPendingContent = async (content: DAContent) => {
    const updatedContent = [...pendingContent, content];
    setPendingContent(updatedContent);
    await savePendingContent(updatedContent);
  };

  const removeContentUpload = async (id: string) => {
    const updatedUploads = contentUploads.filter(upload => upload.id !== id);
    setContentUploads(updatedUploads);
    await saveContentUploads(updatedUploads);
  };

  const clearAllContentUploads = async () => {
    setContentUploads([]);
    setPendingContent([]);
    await AsyncStorage.removeItem('contentUploads');
    await AsyncStorage.removeItem('pendingContent');
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

  const uploadPendingContent = async () => {
    for (const content of pendingContent) {
      try {
        // Upload any media files first
        if (content.data.media) {
          const uploadedMedia = await Promise.all(
            content.data.media.map(async (media: any) => {
              const result = await uploadImage({ uri: media.uri, type: 'image/jpeg' });
              return { ...media, url: result.url };
            })
          );
          content.data.media = uploadedMedia;
        }

        // Upload audio if present
        if (content.data.audio) {
          const audioResult = await uploadAudioUri(content.data.audio);
          content.data.audio = audioResult.url;
        }

        // Create the content on the server with required timestamp
        await createContent(content);

        // Remove from pending after successful upload
        setPendingContent(prev => prev.filter(c => c !== content));
        await savePendingContent(pendingContent);
      } catch (error) {
        console.error('Error uploading pending content:', error);
      }
    }
  };

  const uploadAllPendingContent = async () => {
    const pendingUploads = contentUploads.filter(u => u.uploadStatus === 'pending');
    for (const upload of pendingUploads) {
      await uploadContentToServer(upload.id);
    }
    await uploadPendingContent();
  };

  const getUnuploadedContent = (): ContentUpload[] => {
    return contentUploads.filter(upload => upload.uploadStatus !== 'success');
  };

  return (
    <LocalStorageContext.Provider value={{ 
      contentUploads,
      pendingContent,
      addContentUpload,
      removeContentUpload,
      clearAllContentUploads,
      getContentUploadsForEvent,
      uploadContentToServer,
      uploadAllPendingContent,
      getUnuploadedContent,
      addPendingContent,
      uploadPendingContent
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
