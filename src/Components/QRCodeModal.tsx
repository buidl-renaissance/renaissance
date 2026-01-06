import React from "react";
import { View, StyleSheet } from "react-native";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { QRCodeContent } from "./QRCodeContent";
import { theme } from "../colors";

interface QRCodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScanResult?: (data: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isVisible,
  onClose,
  onScanResult,
}) => {
  return (
    <DismissibleScrollModal
      isVisible={isVisible}
      onClose={onClose}
      title="Connect"
      backgroundColor={theme.background}
      height="70%"
    >
      {({ onScroll, scrollEnabled }) => (
        <View style={styles.contentContainer}>
          <QRCodeContent
            isVisible={isVisible}
            onScanResult={onScanResult}
            onConnectionCreated={onClose}
          />
        </View>
      )}
    </DismissibleScrollModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
