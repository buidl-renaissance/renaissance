import { useState, useCallback } from "react";

export type WebModalEventType =
  | "ra"
  | "luma"
  | "da"
  | "meetup"
  | "sports"
  | "instagram"
  | undefined;

export interface UseWebModalReturn {
  webModalVisible: boolean;
  webModalUrl: string | null;
  webModalTitle: string;
  webModalEventType: WebModalEventType;
  webModalEventData: any;
  openWebModal: (
    url: string,
    title: string,
    eventType: WebModalEventType,
    eventData?: any
  ) => void;
  closeWebModal: () => void;
}

/**
 * Hook for managing web modal state
 */
export const useWebModal = (): UseWebModalReturn => {
  const [webModalVisible, setWebModalVisible] = useState<boolean>(false);
  const [webModalUrl, setWebModalUrl] = useState<string | null>(null);
  const [webModalTitle, setWebModalTitle] = useState<string>("");
  const [webModalEventType, setWebModalEventType] =
    useState<WebModalEventType>(undefined);
  const [webModalEventData, setWebModalEventData] = useState<any>(null);

  const openWebModal = useCallback(
    (
      url: string,
      title: string,
      eventType: WebModalEventType,
      eventData?: any
    ) => {
      setWebModalUrl(url);
      setWebModalTitle(title);
      setWebModalEventType(eventType);
      setWebModalEventData(eventData || null);
      setWebModalVisible(true);
    },
    []
  );

  const closeWebModal = useCallback(() => {
    setWebModalVisible(false);
    setWebModalUrl(null);
    setWebModalTitle("");
    setWebModalEventType(undefined);
    setWebModalEventData(null);
  }, []);

  return {
    webModalVisible,
    webModalUrl,
    webModalTitle,
    webModalEventType,
    webModalEventData,
    openWebModal,
    closeWebModal,
  };
};

