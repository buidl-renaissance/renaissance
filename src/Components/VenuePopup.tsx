import React from "react";
import { Dimensions, Text, StyleSheet, View } from "react-native";
import { DAEvent, DAVenue } from "../interfaces";

import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { Button } from "../Components/Button";
import { EventCard } from "../Components/EventCard";
import { RenderHTML } from "../Components/RenderHTML";

import { lightGreen, darkGrey, theme } from "../colors";
import { TouchableOpacity } from "react-native-gesture-handler";

const { height, width } = Dimensions.get("window");

const SPACING = 8;
const ITEM_LENGTH = width * 0.9; // Item is a square. Therefore, its height and width are of the same length.
const EMPTY_ITEM_LENGTH = (width - ITEM_LENGTH) / 2;
const BORDER_RADIUS = 20;
const CURRENT_ITEM_TRANSLATE_Y = 0;

const VenuePopup = ({ venue, onClose, onSelectEvent }) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = React.useMemo(() => ["90%", "50%", "35%"], []);

  const handleSheetChanges = React.useCallback((index: number) => {
    // console.log("handleSheetChanges", index);
    if (index === -1) onClose && onClose();
  }, []);

  React.useEffect(() => {
    if (venue) {
      bottomSheetModalRef.current?.present();
    }
  }, [venue]);

  if (!venue) return null;

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <View style={{ padding: 16 }}>
          <View
            style={[
              {
                height: 220,
              },
            ]}
          >
            <Text style={styles.title}>{venue.title}</Text>
            {venue.events?.length && (
              <Text>{venue.events?.length} upcoming events</Text>
            )}
            <View style={{ marginHorizontal: -4, marginTop: 8 }}>
              {venue.events?.map((event: DAEvent) => {
                return (
                  <TouchableOpacity
                    key={event.slug}
                    onPress={() => onSelectEvent(event)}
                  >
                    <EventCard
                      event={event}
                      options={{
                        showDate: true,
                        showBookmark: true,
                        showVenue: false,
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    borderTopWidth: 1,
    borderColor: "#999",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    borderColor: "#999",
    borderBottomWidth: 1,
    // backgroundColor: lightGreen,
    backgroundColor: darkGrey,
  },
  cardContainer: {
    backgroundColor: theme.surface,
    // backgroundColor: '#d2e4dd',
    height: 180,
    margin: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderColor: theme.border,
    borderWidth: 1,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
  },
  venueContainer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    height: 220, // Dimensions.get("window").height -
    width: Dimensions.get("window").width,
    // borderTopColor: '#ddd',
    // borderTopWidth: 1,
    // borderTopRightRadius: 16,
    // borderTopLeftRadius: 16,
    // backgroundColor: '#d2e4dd',
    paddingLeft: 16,
    paddingRight: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  slide: {},
  title: {
    fontSize: 24,
  },
  flatListContent: {
    // height: CURRENT_ITEM_TRANSLATE_Y * 2 + ITEM_LENGTH,
    // alignItems: 'center',
    marginBottom: CURRENT_ITEM_TRANSLATE_Y,
    paddingRight: 32,
  },
  itemContent: {
    marginHorizontal: SPACING * 3,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: BORDER_RADIUS + SPACING * 2,
    height: 220,
  },
});

export default VenuePopup;
