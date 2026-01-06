import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";

import {
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";
import { RenderHTML } from "../Components/RenderHTML";

import { lightGreen, darkGrey, theme } from "../colors";

interface EventPopupProps {
  event: any;
  onClose?: () => void;
}

const EventPopup = ({ event, onClose }: EventPopupProps) => {
  const handleRSVP = React.useCallback(() => {
    // Alert.alert("THIS NEEDS TO BE INTEGRATED!!!");
    if (event.url) {
      Linking.openURL(event.url);
    }
  }, [event]);

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = React.useMemo(() => ["100%", "75%"], []);

  const handleSheetChanges = React.useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    if (index === -1 && onClose) {
      // Modal was dismissed
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    if (event) {
      // Small delay to ensure any other modals are closed first
      setTimeout(() => {
        bottomSheetModalRef.current?.present();
      }, 100);
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [event]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
    >
      <ScrollView>
        <EventCard event={event} />
        {event.content && (
          <RenderHTML
            html={event.content}
            style={{ paddingHorizontal: 16 }}
          />
        )}
      </ScrollView>
      {event.url?.match("http") && (
        <View style={styles.buttonContainer}>
          <Button title="View Details" variant="solid" onPress={handleRSVP} />
        </View>
      )}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightGreen,
    flexDirection: "column",
    borderColor: theme.border,
    borderTopWidth: 1,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    borderColor: theme.border,
    borderBottomWidth: 1,
    // backgroundColor: lightGreen,
    backgroundColor: darkGrey,
  },
});

export default EventPopup;
