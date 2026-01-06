import React from "react";
import { StyleSheet } from "react-native";
import { DismissibleScrollModal } from "./DismissibleScrollModal";
import { BookmarksContent } from "./BookmarksContent";
import { theme } from "../colors";

interface BookmarksModalProps {
  isVisible: boolean;
  onClose: () => void;
  navigation?: any;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isVisible,
  onClose,
  navigation,
}) => {
  return (
    <DismissibleScrollModal
      isVisible={isVisible}
      onClose={onClose}
      title="Bookmarked Events"
      backgroundColor={theme.background}
    >
      {({ onScroll, scrollEnabled }) => (
        <BookmarksContent
          navigation={navigation}
          isVisible={isVisible}
          onScroll={onScroll}
          scrollEnabled={scrollEnabled}
          containerStyle={styles.contentContainer}
        />
      )}
    </DismissibleScrollModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
});
